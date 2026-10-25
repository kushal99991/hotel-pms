import React from "react";
import { Box, Typography } from "@mui/material";
import { IFolioResponse } from "types/folios";
import moment from "moment";
import { appConfig } from "config/app.config";
import { currencyString } from "utils/helperFunctions/numbers";
import { IChargeResponse } from "types/charges";
import { apiAmountToNumber } from "utils/dataFormats";
import { isAdjustment } from "utils/charges";

interface ChargesProps {
  folio?: IFolioResponse;
  reservationId?: number;
}

const Charges: React.FC<ChargesProps> = ({ folio, reservationId }) => {
  const charges = folio?.charges ?? [];

  const totalCents = charges.reduce((total, c) => {
    if (isAdjustment(c, charges)) {
      return total - apiAmountToNumber(c.amount) * 100;
    }
    return total + apiAmountToNumber(c.amount) * 100;
  }, 0);
  function displayAmount(c: IChargeResponse) {
    const amtString = currencyString(apiAmountToNumber(c.amount));
    if (isAdjustment(c, charges)) {
      return `- ${amtString}`;
    }
    return amtString;
  }
  const total = currencyString(totalCents / 100);
  return (
    <Box>
      <Typography fontWeight="bold">{`Folio ${reservationId ?? -1}${folio?.type ?? ""}`}</Typography>
      <Box px={4} mt={2}>
        {charges.map((c) => {
          return (
            <Box key={`chargeDetails-${c.id}`} display="flex">
              <Box flex="1">
                {moment(c.date).format(appConfig.displayDateFormat)}
              </Box>
              <Box flex="4">
                {isAdjustment(c, charges)
                  ? `ADJ - ${c.posting_code.name}`
                  : c.posting_code.name}
              </Box>
              <Box flex="1" textAlign="right">
                {displayAmount(c)}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box display="flex" px={4} mt={2}>
        <Typography component="div" textAlign="right" sx={{ flex: 5 }}>
          {`Total Due (Folio ${folio?.type ?? ""}):`}
        </Typography>
        <Box flex="1" textAlign="right">
          {totalCents < 0 ? `- ${total}` : total}
        </Box>
      </Box>
    </Box>
  );
};

export default Charges;
