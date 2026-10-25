import { useState, useEffect } from "react";
import axios from "axios";
import { Terminal, loadStripeTerminal } from "@stripe/terminal-js";
import { appConfig } from "config/app.config";

export type TDiscoverResultResponse = {
  discoveredReaders: any[];
  error?: { message: string };
};

export type TReaderResponse = {
  reader: { label: string };
  error?: { message: string };
};

export type TterminalResponse = {
  error?: { message: string };
  paymentIntent: any;
  setupIntent?: any;
};

export type TprocessPaymentResult = {
  error?: { message: string };
  paymentIntent?: any;
  setupIntent?: any;
};

// Function to fetch the connection token from the service-payments backend
const getHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-API-KEY": appConfig.paymentsAPIKey,
  Authorization: appConfig.getCookie("auth"),
});

// Return the connection token
const fetchConnectionToken = async () => {
  const endpont = `${appConfig.paymentsAPI}/stripe/reader/create/token`;
  /* eslint-disable no-useless-catch */
  try {
    const response = await axios.post(endpont, {}, { headers: getHeaders() });
    return response.data.token;
  } catch (err) {
    // since this function is called inside of the library we need to
    // guarantee that we will surface the error back in our code by catching
    // and rethrowing
    throw err;
  }
  /* eslint-enable no-useless-catch */
};

// Function to handle unexpected reader disconnections
const unexpectedDisconnect = () => {
  //TODO: Handle unexpected disconnects
};

// overide for testing with out tap/insert/swipe
export const simulated = false;

// card reader connection status lifecyle
export const cardReaderStatus = {
  DIS: "DISCONNECTED",
  IDL: "IDLE",
  RDY: "READY",
  PRG: "IN_PROGRESS",
  CON: "CONNECTED",
};

export const cardReaderErrors = {
  TermnalNotFound: "Terminal Not Found",
};

// card reader hook
export const useStripeTerminal = () => {
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>(
    cardReaderStatus.IDL
  );

  useEffect(() => {
    const initializeTerminal = async () => {
      const stripeTerminal = await loadStripeTerminal();
      if (!stripeTerminal) {
        setError("Unable to load terminal");
        return "Unable to load terminal";
      }
      const terminalInstance = stripeTerminal!.create({
        onFetchConnectionToken: fetchConnectionToken,
        onUnexpectedReaderDisconnect: unexpectedDisconnect,
      });
      setTerminal(terminalInstance);
    };
    initializeTerminal();
  }, []);

  const connectionError = (): string | null => {
    return error;
  };

  /**
   * @description connect to stripe terminal reader
   * @param terminal the stripe terminal api
   * @returns {string|null}
   */
  const connectToReader = async (
    terminal?: Terminal
  ): Promise<string | null> => {
    setError(null);
    if (!terminal) {
      setError("Unable to connect to reader terminal not found");
      return error;
    }
    setConnectionStatus(cardReaderStatus.PRG);

    // Discover readers with the `simulated` option
    let discoverResult: TDiscoverResultResponse | undefined;
    let connectionError = "";
    try {
      discoverResult = (await terminal.discoverReaders({
        simulated: simulated, // Set to false when using an actual reader
      })) as TDiscoverResultResponse;
    } catch {
      connectionError =
        "Something went wrong trying to discover registered readers.";
      setError(connectionError);
      return connectionError;
    }
    if (
      discoverResult?.error ||
      discoverResult?.discoveredReaders.length === 0
    ) {
      setConnectionStatus(cardReaderStatus.DIS);
      if (discoverResult?.error) {
        connectionError = `${discoverResult.error?.message}`;
        setError(connectionError);
        return connectionError;
      }
      connectionError =
        "No readers are available for your location. Check your configuration and try again.";
      setError(connectionError);
      return connectionError;
    }
    const targetTerminalId = appConfig.getLocal("card_reader_id");
    const selectedReader = discoverResult?.discoveredReaders.find(
      (reader) => reader.id === targetTerminalId
    );
    if (!selectedReader) {
      setConnectionStatus(cardReaderStatus.DIS);
      connectionError =
        "Readers available did not match your locally configured reader. Refresh and try again.";
      setError(connectionError);
      return connectionError;
    }
    try {
      const connectResult = (await terminal.connectReader(
        selectedReader
      )) as TReaderResponse;
      if (connectResult?.error && connectResult.error?.message) {
        setConnectionStatus(cardReaderStatus.DIS);
        setError(`${connectResult?.error.message}`);
        return `${connectResult?.error.message}`;
      } else {
        setConnectionStatus(cardReaderStatus.RDY);
        setError(null);
        return null;
      }
    } catch (err) {
      setConnectionStatus(cardReaderStatus.DIS);
      setError(`${err}`);
      return `${err}`;
    }
  };

  return {
    terminal,
    connectionStatus,
    connectToReader,
    connectionError,
  };
};
