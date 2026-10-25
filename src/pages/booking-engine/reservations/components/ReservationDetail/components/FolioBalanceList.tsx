import React from "react";
import { Box, Typography } from "@mui/material";
import { TotalsByFolio } from "types/ui/payments";
import { currencyString } from "utils/helperFunctions/numbers";

const FolioBalanceList: React.FC<{ folioTotals: TotalsByFolio }> = ({
  folioTotals,
}) => {
  return (
    <Box maxWidth="50%">
      {Object.keys(folioTotals.folios).map((folioKey) => {
        return (
          <Box
            display="flex"
            justifyContent="space-between"
            key={`folioBalanceTota_${folioKey}`}
          >
            <Typography
              component="div"
              fontSize="14px"
              fontWeight="bold"
            >{`Folio ${folioKey}: `}</Typography>
            <Typography component="div" fontSize="14px">
              {currencyString(folioTotals.folios[folioKey]?.balance)}
            </Typography>
          </Box>
        );
      })}
      <Box display="flex" justifyContent="space-between" mt={1}>
        <Typography
          component="div"
          fontSize="14px"
          fontWeight="bold"
        >{`Total: `}</Typography>
        <Typography component="div" fontSize="14px">
          {currencyString(folioTotals.totalBalance)}
        </Typography>
      </Box>
    </Box>
  );
};

export default FolioBalanceList;
