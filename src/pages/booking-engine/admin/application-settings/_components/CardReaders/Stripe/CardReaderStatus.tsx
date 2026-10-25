import { useState, useEffect } from "react";
import axios from "axios";
import { Divider, Panel, Message } from "rsuite";
import { Grid, Row, Col } from "rsuite";
import { appConfig } from "config/app.config";

type MessageType = "success" | "error" | "warning";

interface MessageState {
  type: MessageType;
  body: string;
}

function CardReaderStatus() {
  const [cardReaderStatus, setCardReaderStatus] = useState("");
  const [message, setMessage] = useState<MessageState>({
    type: "success",
    body: "",
  });

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-API-KEY": appConfig.paymentsAPIKey,
    Authorization: appConfig.getCookie("auth"),
  });

  useEffect(() => {
    const fetchStatus = async () => {
      const reader_id = await appConfig.getLocal("card_reader_id");

      if (!reader_id) {
        setMessage({ type: "warning", body: "Card reader id not paired" });
        return;
      }
      try {
        const endpoint = `${appConfig.paymentsAPI}/stripe/reader/get/${reader_id}`;
        const response = await axios.get(endpoint, { headers: getHeaders() });
        if (response.data.success) {
          setCardReaderStatus(response.data.reader);
        }
        setMessage({ type: "success", body: "Card reader paired" });
      } catch (err) {
        if (axios.isAxiosError(err)) {
          // Access the response from the error object
          const errorMessage = `${err.response?.data?.error}`;
          setMessage({ type: "error", body: errorMessage });
        } else {
          setMessage({ type: "error", body: `${err}` });
        }
      }
    };

    fetchStatus();
  }, []);

  return (
    <Panel bordered shaded className="pa-10">
      <h3>Card Reader Status</h3>
      <Divider />

      {message.body && (
        <Message showIcon={true} type={`${message?.type || "success"}`}>
          {message.body}
        </Message>
      )}
      <br />
      <Grid fluid>
        <Row>
          <Col xs={12}>
            <strong>Field</strong>
          </Col>
          <Col xs={12}>
            <strong>Value</strong>
          </Col>
        </Row>
        {cardReaderStatus &&
          Object.entries(cardReaderStatus).map(([key, value]) => (
            <Row key={key} className="hover-invert">
              <Col xs={12}>{key}:</Col>
              <Col xs={12}>
                {typeof value !== "object" ? `${value}` : JSON.stringify(value)}
              </Col>
            </Row>
          ))}
      </Grid>
    </Panel>
  );
}

export default CardReaderStatus;
