import { Box, ButtonBase } from "@mui/material";
import React, { useState } from "react";
import { CheckOutStateValue } from "types/reservationTypes";

const CheckoutStatListItem: React.FC<{ stateItem: CheckOutStateValue }> = ({
  stateItem,
}) => {
  const [seeMoreVisible, setSeeMoreVisible] = useState<boolean>(
    stateItem.showMoreByDefault ?? false
  );

  function handleSeeMoreClick() {
    setSeeMoreVisible(!seeMoreVisible);
  }
  return (
    <li>
      <Box display="flex" alignItems="center">
        {stateItem.message}
        {stateItem.hasMoreContent && (
          <ButtonBase
            onClick={handleSeeMoreClick}
            sx={{ ml: 0.5, color: "secondary.main" }}
          >
            {seeMoreVisible ? "(hide details)" : "(more info)"}
          </ButtonBase>
        )}
      </Box>
      {seeMoreVisible && (
        <Box pl={2} mt={1}>
          {stateItem.viewMoreContent ?? null}
        </Box>
      )}
    </li>
  );
};

export default CheckoutStatListItem;
