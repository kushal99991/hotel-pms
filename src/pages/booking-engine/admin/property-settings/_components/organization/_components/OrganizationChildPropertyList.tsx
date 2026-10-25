import { useNavigate } from "react-router-dom";
import {
  Paper,
  Divider,
  Typography,
  Avatar,
  Box,
  Button,
  styled,
} from "@mui/material";
import { IOrgChildPropertyResponse } from "types/org";
import React from "react";
import DataTable, { Column } from "components/elements/DataTable/DataTable";
import { appConfig } from "config/app.config";

interface OrganizationChildPropertyListProps {
  dataSources: IOrgChildPropertyResponse[];
  isLoading: boolean;
}

const OrganizationChildPropertyList: React.FC<
  OrganizationChildPropertyListProps
> = ({ dataSources, isLoading }) => {
  const Navigate = useNavigate();
  const onPropertyDetail = (id: string) => {
    Navigate(`/${appConfig.pmsDir}/admin/property/detail/${id}`);
  };

  const columns: Column<IOrgChildPropertyResponse>[] = [
    {
      field: "logo",
      label: "",
      align: "center",
      renderCell: (raw: IOrgChildPropertyResponse) => {
        return (
          <>
            {raw?.logo ? (
              <StyledAvatarWrapper>
                <Avatar alt={raw?.name} src={raw?.logo} />
              </StyledAvatarWrapper>
            ) : (
              <Avatar
                sx={{
                  width: 128,
                  height: 128,
                  backgroundColor: "#BDBDBD",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 50,
                }}
              >
                {raw?.name?.[0]?.toUpperCase()}
              </Avatar>
            )}
          </>
        );
      },
    },
    {
      field: "name",
      label: "Property Name",
      align: "center",
    },
    {
      field: "address_1",
      label: "Address",
      renderCell: (raw: IOrgChildPropertyResponse) => {
        const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-marker+285A98(${raw.lng},${raw.lat})/${raw.lng},${raw.lat},15,0/300x250?access_token=${appConfig.mapBoxToken}`;
        return (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexDirection="column"
          >
            <Typography>{raw?.address_1 ?? ""}</Typography>
            <img
              src={mapUrl}
              alt="map"
              style={{ width: "100%", height: 100, borderRadius: "8px" }}
            />
          </Box>
        );
      },
    },
    {
      field: "room_count",
      label: "Room Count",
    },
    {
      field: "cancellation_policy",
      label: "In Maintaince",
      renderCell: () => `0`,
    },
    {
      field: "occupancy_count",
      label: "Held",
      renderCell: () => `0`,
    },
    {
      field: "id",
      label: "Action",
      renderCell: (raw: IOrgChildPropertyResponse) => {
        return (
          <>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 2 }}
              onClick={() => onPropertyDetail(raw.id?.toString())}
            >
              View Property
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <Paper elevation={0}>
      <Typography variant="h5" gutterBottom>
        Properties
      </Typography>

      <Divider style={{ marginBottom: "25px" }} />
      <DataTable
        columns={columns}
        data={dataSources ?? []}
        isLoading={isLoading}
        rowsPerPageOptions={[5, 10, 25]}
        initialRowsPerPage={5}
      />
    </Paper>
  );
};

export default OrganizationChildPropertyList;

const StyledAvatarWrapper = styled(Box)(() => ({
  position: "relative",
  display: "inline-block",
  width: "fit-content",
  "&:hover .uploadIcon": {
    opacity: 1,
  },
}));
