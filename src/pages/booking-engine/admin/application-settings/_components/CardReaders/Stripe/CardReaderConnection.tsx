import { Paper, Button, Typography, Box } from "@mui/material";
import { useStripeTerminal, simulated } from "hooks/useStripeCardReader";
function CardReaderConnection() {
  const { terminal, connectionStatus, connectToReader } = useStripeTerminal();

  const handleConnect = async () => {
    if (!terminal) {
      alert("Terminal is not initialized.");
      return;
    }
    await connectToReader(terminal);
  };

  return (
    <Paper sx={{ p: 2 }} elevation={2}>
      <a
        style={{ float: "right" }}
        href="https://docs.stripe.com/terminal/references/testing"
        target="_blank"
        rel="noreferrer"
      >
        See docs
      </a>
      <Typography variant="h5" gutterBottom>
        Stripe Card Reader Connection
      </Typography>
      status: <strong>{connectionStatus}</strong> <br />
      simulated: <strong>{simulated.toString()}</strong>
      <br />
      <Typography variant="caption">
        If simulated=false, the Card Reader will simulate a card swipe and
        process the payment.
      </Typography>
      <hr />
      <Button
        style={{ marginTop: 10, marginBottom: 10 }}
        variant="outlined"
        size="small"
        onClick={handleConnect}
      >
        Connect
      </Button>
      <Box sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
        <Typography variant="h6">Pseudo Code Example</Typography>
        <pre style={{ fontSize: "10px" }}>
          {` 
        import { useStripeTerminal, simulated } from "hooks/useStripeCardReader";
        const { terminal, connectionStatus, connectToReader } = useStripeTerminal();
        
        const paymentIntentReponse = await axios.get(paymentIntentPath, {headers});
        const clientSecret = paymentIntentResponse.data.client_secret;

        //display connection status
        {connectionStatus} 

        //on payment action connect to the reader 
        const onPayment = ()=>{
            connectToReader()
        };

        // clientSecret is found in the setup intent or the payment intent
        const paymentMethodResult = await terminal.collectPaymentMethod(clientSecret);
        // if you dont have a payment method you can not process the payment
        if (paymentMethodResult.error) {
            //throw error
            return;
        };

        // Process the payment
        const processPaymentResult = await terminal.processPayment(paymentMethodResult.paymentIntent);

        if (processPaymentResult.error) {
            // throw error
        } else if (processPaymentResult.paymentIntent) {
            // Optionally, you can confirm the payment in your backend if capture_method='manual'
            // display success message
        }
        `}
        </pre>
      </Box>
    </Paper>
  );
}

export default CardReaderConnection;
