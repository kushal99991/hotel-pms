import React from "react";
import { useNavigate } from "react-router-dom"; // If using React Router
import { Button, Container, Typography } from "@mui/material"; // Assuming you're using Material-UI

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate("/booking-engine/dashboard");
  };

  return (
    <Container style={{ textAlign: "center", marginTop: "5rem" }}>
      <Typography variant="h2" component="h1" gutterBottom>
        403 - Unauthorized
      </Typography>
      <Typography variant="body1" gutterBottom>
        You do not have permission to access this page.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleBackToHome}>
        Back to Home
      </Button>
    </Container>
  );
};

export default Unauthorized;
