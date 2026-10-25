import { Card, CardContent, Grid, Typography } from "@mui/material";
import useGeneralLedger from "hooks/useGeneralLedger";
import React from "react";

const SummaryCards: React.FC = () => {
  const { summaryCards } = useGeneralLedger();
  return (
    <Grid container spacing={3} className="mb-8">
      {summaryCards.map((card, i) => (
        <Grid item xs={12} sm={6} lg={2.4} key={i}>
          <Card
            className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0"
            sx={{
              height: "100%",
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: "1px solid #e2e8f0",
            }}
          >
            <CardContent className="p-6">
              <Typography
                variant="body2"
                className="text-gray-600 mb-1 font-medium"
              >
                {card.label}
              </Typography>
              <Typography
                variant="h5"
                className={`font-bold  mb-2`}
                color={card.color}
              >
                ${card.value.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SummaryCards;
