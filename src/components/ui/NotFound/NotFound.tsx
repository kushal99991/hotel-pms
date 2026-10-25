import React from "react";
import { Box, Typography, Button, styled } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Use useNavigate to handle routing

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  // Handle the button click to navigate back to the home page
  const handleGoHome = () => {
    navigate("/"); // Change this path as per your home route
  };

  return (
    <Wrapper>
      <Content>
        <Typography variant="h1" component="h1" color="primary" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" color="textSecondary" gutterBottom>
          Oops! The page you`re looking for doesn`t exist.
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          You may have mistyped the address or the page may have moved.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoHome}
          sx={{ marginTop: "20px" }}
        >
          Go to Home
        </Button>
      </Content>
    </Wrapper>
  );
};

export default NotFound;

// Styled Components

const Wrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "95%",
  backgroundColor: theme.palette.background.default,
  textAlign: "center",
}));

const Content = styled(Box)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
}));
