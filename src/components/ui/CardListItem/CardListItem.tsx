import React from "react";
import { Grid, SxProps, Typography } from "@mui/material";
import CardLogo from "../CardLogo/CardLogo";
import { IPaymentMethodResponse } from "types/reservationTypes";
import { getCardListDetailStrings } from "utils/paymentMethods";

interface CardListItemProps {
  paymentMethod?: IPaymentMethodResponse;
  primaryPaymentMap: any;
  parentSx?: SxProps;
}

const CardListItem: React.FC<CardListItemProps> = ({
  paymentMethod,
  primaryPaymentMap,
  parentSx,
}) => {
  if (!paymentMethod) {
    return null;
  }
  const { main, secondary } = getCardListDetailStrings(paymentMethod);
  return (
    <Grid
      container
      key={paymentMethod.id}
      flexWrap="nowrap"
      alignItems="center"
      py={2}
      sx={parentSx}
    >
      <Grid item mr={3}>
        <CardLogo
          isDirectBill={!!paymentMethod.direct_billing_account_id}
          cardType={paymentMethod?.brand?.toString()}
          paymentType={paymentMethod.payment_type}
        />
      </Grid>
      <Grid item container direction="column">
        <Grid item sx={{ textTransform: "capitalize" }}>
          <Typography fontWeight="bold" fontSize="1rem">
            {main}
          </Typography>
        </Grid>
        {secondary && (
          <Grid item>
            <Typography fontSize="0.75rem" color="grey.700">
              {secondary}
            </Typography>
          </Grid>
        )}
        {primaryPaymentMap[paymentMethod.id] && (
          <Grid item>
            <Typography fontSize="0.75rem" color="success.main">
              {`Primary payment for Folios: ${primaryPaymentMap[paymentMethod.id].folios.join(", ")}`}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default CardListItem;
