import React, { useMemo } from "react";
import { Box, styled } from "@mui/material";

import CommonTabs from "components/elements/Tabs/CommonTabs";
import UserManagementList from "./component/UserManagementList";
import RoleTemplateList from "./component/RoleTemplateList";
import { useLocation } from "react-router-dom";

const Page: React.FC = () => {
  const location = useLocation();

  // Determine the initial tab based on the current route
  const initialTab = useMemo(() => {
    switch (location.pathname) {
      case "/booking-engine/admin/user-management":
        return 0;
      case "/booking-engine/admin/role-management":
        return 1;
      default:
        return 0;
    }
  }, [location.pathname]);

  return (
    <MainWrapper>
      <CommonTabs
        tabs={[
          { content: <UserManagementList />, label: "Users" },
          { content: <RoleTemplateList />, label: "Roles" },
        ]}
        initialTab={initialTab}
      />
    </MainWrapper>
  );
};

export default Page;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  margin: "15px 10px",
}));
