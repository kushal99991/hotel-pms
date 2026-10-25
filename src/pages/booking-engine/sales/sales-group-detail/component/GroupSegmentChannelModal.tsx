import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  SelectChangeEvent,
} from "@mui/material";
import { useUpdateSalesAccountGroupMutation } from "services/salesSlice";
import { ISalesGroupListItem } from "types/salesTypes";
import { marketOptionList, bookingChannelList } from "config/tables/reservations";
import { salesDistributionOptions } from "constants/sales";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";

interface GroupSegmentChannelModalProps {
  open: boolean;
  group: ISalesGroupListItem | null | undefined;
  onCloseModal: (refreshData: boolean) => void;
}

function GroupSegmentChannelModal({
  open,
  group,
  onCloseModal,
}: GroupSegmentChannelModalProps) {
  const [marketSegment, setMarketSegment] = useState(group?.market_segment ?? "");
  const [bookingChannel, setBookingChannel] = useState(group?.booking_channel ?? "");
  const [salesDistribution, setSalesDistribution] = useState(group?.sales_distribution ?? "");
  const [errorMessage, setErrorMessage] = useState("");

  const [updateSalesAccountGroup, { isLoading }] = useUpdateSalesAccountGroupMutation();
  const { selectedGroup, setSelectedGroup } = useSalesDashboardContext();

  useEffect(() => {
    if (open) {
      setMarketSegment(group?.market_segment ?? "");
      setBookingChannel(group?.booking_channel ?? "");
      setSalesDistribution(group?.sales_distribution ?? "");
      setErrorMessage("");
    }
  }, [open]);

  async function handleSubmit() {
    if (!group?.id) return;
    updateSalesAccountGroup({
      group_id: group.id,
      market_segment: marketSegment,
      booking_channel: bookingChannel,
      sales_distribution: salesDistribution,
    }).then((resp) => {
      if (!resp.error) {
        setSelectedGroup({
          ...selectedGroup!,
          market_segment: marketSegment,
          booking_channel: bookingChannel,
          sales_distribution: salesDistribution,
        });
        onCloseModal(true);
      } else {
        setErrorMessage("Error updating values. Please try again");
      }
    });
  }

  function handleClose() {
    setErrorMessage("");
    onCloseModal(false);
  }

  function handleMarketSegmentChange(evt: SelectChangeEvent<unknown>) {
    setMarketSegment(evt.target.value as string);
  }

  function handleBookingChannelChange(evt: SelectChangeEvent<unknown>) {
    setBookingChannel(evt.target.value as string);
  }

  function handleSalesDistributionChange(evt: SelectChangeEvent<unknown>) {
    setSalesDistribution(evt.target.value as string);
  }

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { width: 400 } }}>
      <DialogTitle>Update Group</DialogTitle>
      <DialogContent>
        <Grid container direction="column">
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <Grid item>
            <CustomDropdown
              label="Market Segment"
              placeholder="Market Segment"
              options={marketOptionList}
              onChange={handleMarketSegmentChange}
              value={marketSegment}
              fullWidth
            />
          </Grid>
          <Grid item mt={2}>
            <CustomDropdown
              label="Booking Channel"
              placeholder="Booking Channel"
              options={bookingChannelList}
              onChange={handleBookingChannelChange}
              value={bookingChannel}
              fullWidth
            />
          </Grid>
          <Grid item mt={2}>
            <CustomDropdown
              label="Sales Distribution"
              placeholder="Sales Distribution"
              options={salesDistributionOptions}
              onChange={handleSalesDistributionChange}
              value={salesDistribution}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GroupSegmentChannelModal;
