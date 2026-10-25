import { StripeCardBrand } from "constants/payments";
import React from "react";
import { useTheme } from "@mui/material/styles";
import Visa from "assets/images/visa.png";
import Amex from "assets/images/americanexpress.png";
import Discover from "assets/images/discover.png";
import Mastercard from "assets/images/mastercard.png";
import BusinessAccount from "components/complexIcons/BusinessAccount";
import { Box } from "@mui/system";
import { FaMoneyCheck } from "react-icons/fa6";
import { LocalAtm, AccountBalance } from "@mui/icons-material";
import { LCColors } from "theme/Colors";
import { PaymentMethodTypesEnum } from "constants/paymentMethods";
import { isCheckType } from "utils/paymentMethods";

const brandedToDefaultHeightMultiplier = 1;
const brandedHeightToWidthMultiplier = 45 / 28;
const brandedToDBHeightMultiplier = 42 / 28;
const dbHeightToWidthMultiplier = 45 / 42;
const defaultHeightToWidthMulttiplier = 45 / 28;
const dbWidthToCheckWidthMultiplier = 36 / 45;
const checkWidthToHeightMultiplier = 45 / 36;
export function sizesFromBrandedHeight(brandedHeight: number) {
  const brandedWidth = brandedHeight * brandedHeightToWidthMultiplier;
  const defaultHeight = brandedHeight * brandedToDefaultHeightMultiplier;
  const defaultWidth = defaultHeight * defaultHeightToWidthMulttiplier;
  const directBillHeight = brandedHeight * brandedToDBHeightMultiplier;
  const directBillWidth = directBillHeight * dbHeightToWidthMultiplier;
  return {
    branded: {
      height: brandedHeight,
      width: Math.floor(brandedWidth),
    },
    default: {
      height: Math.floor(defaultHeight),
      width: Math.floor(defaultWidth),
    },
    directBill: {
      height: Math.floor(directBillHeight),
      width: Math.floor(directBillWidth),
    },
  };
}

interface CardLogoProps {
  cardType: string | StripeCardBrand;
  isDirectBill?: boolean;
  paymentType?: PaymentMethodTypesEnum;
  sizes?: {
    branded: {
      height: number;
      width: number;
    };
    default: {
      height: number;
      width: number;
    };
    directBill: {
      height: number;
      width: number;
    };
    check?: {
      height?: number;
    };
  };
}

const brandsWithImages = Object.values(StripeCardBrand);

const cardImageMap = {
  [StripeCardBrand.amex]: Amex,
  [StripeCardBrand.visa]: Visa,
  [StripeCardBrand.discover]: Discover,
  [StripeCardBrand.mastercard]: Mastercard,
};

const CardLogo: React.FC<CardLogoProps> = ({
  cardType,
  sizes,
  isDirectBill,
  paymentType,
}) => {
  const { palette } = useTheme();
  const isBrandWithImage = brandsWithImages.includes(
    cardType as StripeCardBrand
  );
  const cardImage = cardImageMap[cardType as StripeCardBrand];
  if (paymentType === PaymentMethodTypesEnum.CASH) {
    return (
      <LocalAtm
        color="secondary"
        sx={{
          fontSize: "1rem",
          height: sizes?.directBill?.height ?? 42,
          width: sizes?.directBill?.width ?? 45,
        }}
      />
    );
  }
  if (paymentType === PaymentMethodTypesEnum.ACH_WIRE_TRANSFER) {
    return (
      <AccountBalance
        color="secondary"
        sx={{
          fontSize: "1rem",
          height: sizes?.directBill?.height ?? 42,
          width: sizes?.directBill?.width ?? 45,
        }}
      />
    );
  }
  if (isCheckType(paymentType)) {
    const width =
      (sizes?.directBill.width ?? 45) * dbWidthToCheckWidthMultiplier;
    let height = 45;
    if (sizes?.check?.height) {
      height = sizes?.check?.height;
    } else {
      height = width * checkWidthToHeightMultiplier;
    }
    return (
      <Box
        width={sizes?.directBill.width ?? 45}
        display="flex"
        justifyContent="center"
      >
        <FaMoneyCheck
          color={palette.secondary.main}
          style={{ height, width }}
        />
      </Box>
    );
  }
  if (isDirectBill) {
    return (
      <BusinessAccount
        caseFill={LCColors.darkBlue}
        height={sizes?.directBill?.height ?? 42}
        width={sizes?.directBill?.width ?? 45}
      />
    );
  }
  if (isBrandWithImage && cardImage) {
    return (
      <img
        src={cardImage}
        alt={`Logo for ${cardType} Credit Card`}
        height={sizes?.branded?.height ?? 28}
        width={sizes?.branded.width ?? 45}
        style={{ maxWidth: "unset" }}
      />
    );
  }
  return (
    <Box
      // height and width match rendered value of defined cards
      height={sizes?.default?.height ?? 28}
      width={sizes?.default?.width ?? 45}
      pt="5px"
      borderRadius="2px"
      sx={{ backgroundColor: "secondary.main" }}
    >
      <div style={{ height: "6px", width: "100%", background: "darkgrey" }} />
    </Box>
  );
};

export default CardLogo;
