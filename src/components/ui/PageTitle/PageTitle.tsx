import React, { ReactNode } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface PageTitleProps {
  title: string;
  bold?: boolean;
  rightBtn?: ReactNode;
}

const PageTitle: React.FC<PageTitleProps> = ({
  title,
  rightBtn,
  bold = true,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        fontWeight={bold ? "bold" : "normal"}
      >
        {title}
      </Typography>
      {rightBtn && rightBtn}
    </Box>
  );
};

export default PageTitle;
