import React, { useMemo, useState } from "react";
import {
  IconButton,
  Typography,
  Divider,
  Grid,
  CircularProgress,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import RatePlanSummary from "./RatePlanSummary";
import Modal from "components/widgets/ModalWindows/Modal";
import { useGetRatePlansMutation } from "services/roomRateSlice";
import useAuth from "hooks/useAuth";
import useSnackbar from "hooks/useSnackbar";
import { IRatePlanResponse } from "types/roomRateTypes";

interface IRatePlanDetail {
  rate_plan_id: number | null;
}

const RatePlanDetail: React.FC<IRatePlanDetail> = ({ rate_plan_id }) => {
  const { users, properties } = useAuth();
  const { openSnackbar } = useSnackbar();
  const [open, setOpen] = useState<boolean>(false);
  const [ratePlanDetails, setRatePlanDetails] =
    useState<IRatePlanResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedProperty = useMemo(() => {
    return properties.find((a) => a.id === users?.defaultPropertyId);
  }, [properties, users?.defaultPropertyId]);

  const [getRatePlans] = useGetRatePlansMutation();

  const fetchRatePlan = async () => {
    if (!rate_plan_id) {
      openSnackbar("Invalid Rate Code Plan Id", "error");
      return;
    }
    setLoading(true);
    const response = await getRatePlans({
      property_id: users?.defaultPropertyId ?? 0,
      id: rate_plan_id,
    });
    setLoading(false);
    if (response?.error) {
      openSnackbar(response.error as string, "error");
      return;
    }
    const sources = response.data;
    setRatePlanDetails(sources[0]);
  };

  const handleOpen = async () => {
    if (!ratePlanDetails) {
      await fetchRatePlan();
    }
    setOpen(true);
  };

  return (
    <>
      <IconButton
        onClick={async (e) => {
          e.stopPropagation();
          await handleOpen();
        }}
        aria-label="Rate Plan Info"
        size="small"
        onMouseEnter={() => {
          if (!ratePlanDetails && !loading) fetchRatePlan();
        }}
      >
        {loading ? (
          <CircularProgress size={18} />
        ) : (
          <InfoIcon fontSize="small" />
        )}
      </IconButton>

      <Modal
        open={open}
        title="Rate Plan Details"
        size="sm"
        onClose={() => setOpen(false)}
        isHideCloseButton={true}
        style={{
          "& .MuiDialog-paper": {
            width: "90%",
            maxWidth: 500, // Control for tablet
            margin: { xs: 1, sm: 2 }, // Space around on mobile/tablet
          },
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Name</Typography>
            <Typography variant="body2">
              {ratePlanDetails?.name ?? ""}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Cancellation Policy</Typography>
            <Typography variant="body2">
              Cancellation Permitted Before:{" "}
              {selectedProperty?.cancellation_policy_duration_days ?? 0} days
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2">Description</Typography>
            <Typography variant="body2">
              {ratePlanDetails?.description ?? ""}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography
          variant="subtitle1"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
        >
          Rate Plan Rules
        </Typography>

        <RatePlanSummary ratePlanRules={ratePlanDetails?.rules ?? []} />
      </Modal>
    </>
  );
};

export default RatePlanDetail;
