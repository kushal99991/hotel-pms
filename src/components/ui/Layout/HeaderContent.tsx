import React from "react";
import AuthHeader from "./AuthHeader";
import useAuth from "hooks/useAuth";
import { Outlet } from "react-router-dom";
import PrimaryHeader from "./PrimaryHeader";
import MainContent from "./MainContent";
import { Box } from "@mui/material";
import CommandPalette from "components/widgets/CommandPalette/CommandPalette";

const HeaderContent: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <>
      {isLoggedIn ? (
        <Box>
          <PrimaryHeader />
          <CommandPalette />
          <MainContent>
            <Outlet />
          </MainContent>
        </Box>
      ) : (
        <>
          <AuthHeader />
          <Outlet />
        </>
      )}
    </>
  );
};

export default HeaderContent;
