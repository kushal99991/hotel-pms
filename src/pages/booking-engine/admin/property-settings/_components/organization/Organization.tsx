import React, { useState, useCallback } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { Paper, Box, Fade } from "@mui/material";
import { useGetOrgByIdQuery } from "services/organizationSlice";
import { useAuth } from "hooks";

import OrganizationEditForm from "./_components/OrganizationEditForm";
import OrganizationChildPropertyList from "./_components/OrganizationChildPropertyList";
import OrganizationDetail from "./_components/OrganizationDetails";

const Organization: React.FC = () => {
  const { users } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [fadeIn, setFadeIn] = useState<boolean>(true);

  const userId = users?.id;
  const {
    data: organization,
    isLoading,
    refetch: onRefresh,
  } = useGetOrgByIdQuery(userId ? { id: String(userId) } : skipToken);

  const handleEditClick = useCallback(() => {
    setFadeIn(false);
    setTimeout(() => {
      setEditMode(true);
      setFadeIn(true);
    }, 300); // The duration of the fade out
  }, []);

  const handleCancelClick = useCallback(() => {
    setFadeIn(false);
    onRefresh();
    setTimeout(() => {
      setEditMode(false);
      setFadeIn(true);
    }, 300); // The duration of the fade out
  }, [onRefresh]);

  return (
    <Paper
      sx={{
        width: "100%",
        padding: 3,
        marginTop: 2,
      }}
    >
      <Fade in={editMode ? fadeIn : true} timeout={300}>
        {editMode && organization ? (
          <Box>
            <OrganizationEditForm
              organization={organization}
              handleCancelClick={handleCancelClick}
            />
          </Box>
        ) : (
          <div>
            <OrganizationDetail
              organization={organization ?? null}
              onEditClick={handleEditClick}
              isLoading={isLoading}
              onRefresh={onRefresh}
            />

            <OrganizationChildPropertyList
              dataSources={organization?.childProperty || []}
              isLoading={isLoading}
            />
          </div>
        )}
      </Fade>
    </Paper>
  );
};

export default Organization;
