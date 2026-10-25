import React from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Skeleton,
  ButtonBase,
} from "@mui/material";
import { OpenInNew } from "@mui/icons-material";

interface ReservationDetailAction {
  label: string;
  linkTo?: string;
  onClick: () => void;
  newTabAction?: boolean;
}

interface ReservationDetailBoxProps {
  label: string;
  children: React.ReactNode;
  isContentRemovePending?: boolean;
  isLoading?: boolean;
  isRefreshing?: boolean;
  actions?: ReservationDetailAction[];
}

const ReservationDetailBox: React.FC<ReservationDetailBoxProps> = ({
  label,
  isContentRemovePending = false,
  isLoading = false,
  isRefreshing = false,
  children,
  actions,
}) => (
  <Card sx={{ width: "100%", borderRadius: 2 }}>
    <CardContent
      sx={{
        bgcolor: "#000",
        borderRadius: "4px 4px 0 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <Typography variant="body1" fontWeight="bold" color="#FFF">
          {label}
        </Typography>
      </div>
      {actions && actions.length && (
        <Box>
          <Grid container item>
            {actions.map((a: ReservationDetailAction) => {
              return (
                <ButtonBase
                  onClick={a.onClick}
                  key={a.label}
                  sx={{
                    color: "white",
                    textDecoration: "underline",
                    fontSize: "0.875rem",
                  }}
                >
                  {a.label}
                  {a.newTabAction && (
                    <OpenInNew sx={{ fontSize: "0.875rem" }} />
                  )}
                </ButtonBase>
              );
            })}
          </Grid>
        </Box>
      )}
    </CardContent>
    <CardContent
      sx={isContentRemovePending ? { padding: 0, paddingBottom: 0 } : {}}
    >
      {/* do not render skeleton and unmount child if it is just refreshing */}
      {isLoading && !isRefreshing ? (
        <Skeleton variant="rectangular" width="100%" height={100} />
      ) : (
        children
      )}
    </CardContent>
  </Card>
);

export default ReservationDetailBox;
