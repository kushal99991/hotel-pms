import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useFormContext, Controller, Control } from "react-hook-form";
import { Person as AdultIcon } from "@mui/icons-material";
import { ChildCare as ChildIcon } from "@mui/icons-material";
import { Close as CloseIcon } from "@mui/icons-material";
import GuestDetailForm from "./GuestDetailForm";
import { IReservation } from "types/reservationTypes";
import FormTextField from "components/forms/FormTextField";
import { IStay } from "types/reservationTypes";
import GuestCount from "./GuestCount";
import AddReservationViewContext from "contexts/AddReservationViewContext";
import { IGetRoomTypeAvailability } from "types/roomTypes";
import moment from "moment";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useGetTaxExemptionListQuery } from "services/financeSlice";
import { styled } from "@mui/material";
import useAuth from "hooks/useAuth";
import { SET_VALUE_OPTIONS } from "constants/forms";

interface StayDetailsProps {
  stay: IStay;
  stayIndex: number;
  roomAvailabilityList: IGetRoomTypeAvailability[];
}

const StayDetails: React.FC<StayDetailsProps> = ({
  stayIndex,
  stay,
  roomAvailabilityList,
}) => {
  const formContextMethods = useFormContext();
  const { control, setValue, watch, formState } = formContextMethods;
  const { viewState, setViewState } = useContext(AddReservationViewContext)!;
  const { users } = useAuth();

  const [openRateDialog, setOpenRateDialog] = useState(false);
  const [tempCustomRates, setTempCustomRates] = useState<{
    [date: string]: number | string;
  }>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Watch for form data to get pricing information
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const stays = watch("stays");

  const adultCount = watch(`stays.${stayIndex}.adultCount`);
  const childCount = watch(`stays.${stayIndex}.childrenCount`);
  const occupantsCountError =
    formState.errors.stays?.[stayIndex]?.adultCount ||
    formState.errors.stays?.[stayIndex]?.childrenCount;

  // Get current stay data
  const currentStay = stays?.[stayIndex];

  // Get pricing data from the room availability list
  const getPricingData = (): { [date: string]: number } => {
    const pricing: { [date: string]: number } = {};
    if (stay?.roomType?.id && roomAvailabilityList) {
      const room = roomAvailabilityList.find(r => r.roomTypeId === stay.roomType?.id);
      if (room && room.pricing) {
        Object.entries(room.pricing).forEach(([date, price]) => {
          pricing[date] = parseFloat(price || "0");
        });
      }
    }
    return pricing;
  };

  // Calculate ADR (Average Daily Rate)
  const calculateADR = (rates: { [date: string]: number }) => {
    const rateValues = Object.values(rates);
    if (rateValues.length === 0) return 0;
    const total = rateValues.reduce((sum, rate) => sum + rate, 0);
    return total / rateValues.length;
  };

  // Get current ADR based on existing rates or temp rates during editing
  const getCurrentADR = () => {
    const currentRates = openRateDialog ? tempCustomRates : getPricingData();
    // Convert mixed types to numbers for calculation
    const numericRates: { [date: string]: number } = {};
    Object.entries(currentRates).forEach(([date, rate]) => {
      numericRates[date] = rate === "" ? 0 : Number(rate);
    });
    return calculateADR(numericRates);
  };

  // Get max adults and children from room type
  const maxAdults = stay?.roomType?.adults || 5;
  const maxChildren = stay?.roomType?.children || 4;

  const handleOpenRateDialog = () => {
    setTempCustomRates();
    setOpenRateDialog(true);
  };

  const handleCloseRateDialog = () => {
    setOpenRateDialog(false);
    setTempCustomRates({});
    setHasChanges(false);
  };

  const handleRateChange = (date: string, value: string) => {
    setTempCustomRates((prev) => {
      const next = { ...prev, [date]: value };
      setHasChanges(true);
      return next;
    });
  };

  const handleSaveRates = () => {
    setValue(`stays.${stayIndex}.customRates`, tempCustomRates);
    handleCloseRateDialog();
  };

  return (
    <Box
      border={1}
      borderRadius={5}
      p={3}
      mt={6}
      component={Paper}
      elevation={2}
    >
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center">
          <Typography variant="body1" fontWeight="bold" mr={1}>
            Room Type:
          </Typography>
          <Typography variant="body1">{stay?.roomType?.type}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body1" fontWeight="bold">
            ADR:{" "}
            {getCurrentADR().toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 2,
            })}
          </Typography>
          <Typography
            onClick={handleOpenRateDialog}
            sx={{
              cursor: "pointer",
              textTransform: "none",
              textDecoration: "underline",
              color: "#32A1AE",
              "&:hover": {
                color: "#228891",
              },
            }}
          >
            Edit Nightly Rates
          </Typography>
        </Box>
      </Box>

      {/* Special Requests */}
      <Grid container spacing={2} mt={1}>
        <FormTextField
          name={`stays.${stayIndex}.specialRequests`}
          label="Special Requests"
          sm={12}
          gridProps={{
            mb: 2,
          }}
        />
      </Grid>

      {/* Guest Count Section */}
      <Box mt={3} mb={2}>
        <Typography variant="h6" component="h3" gutterBottom>
          Guest Count
        </Typography>
        <GuestCount
          items={[
            {
              icon: <AdultIcon />,
              label: "Adults",
              count: adultCount || 1,
              key: "adult",
              maxCount: maxAdults,
            },
            {
              icon: <ChildIcon />,
              label: "Children",
              count: childCount || 0,
              key: "child",
              maxCount: maxChildren,
            },
          ]}
          onChange={(itemCounts) => {
            if (itemCounts.key === "adult") {
              setValue(
                `stays.${stayIndex}.adultCount`,
                itemCounts.count,
                SET_VALUE_OPTIONS
              );
              // Update context if needed for backward compatibility
              setViewState({
                ...viewState,
                totalAdults: itemCounts.count,
              });
            } else if (itemCounts.key === "child") {
              setValue(
                `stays.${stayIndex}.childrenCount`,
                itemCounts.count,
                SET_VALUE_OPTIONS
              );
              // Update context if needed for backward compatibility
              setViewState({
                ...viewState,
                totalChildren: itemCounts.count,
              });
            }
          }}
        />
        {occupantsCountError?.message && (
          <Typography color="error" mt={1}>
            {occupantsCountError?.message?.toString()}
          </Typography>
        )}
      </Box>

      {/* Tax Exemption Dropdown */}
      <Box mb={2}>
        <Controller
          name={`stays.${stayIndex}.tax_exemption_id`}
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            const propertyId = users?.defaultPropertyId;
            const { data, isLoading, isError } = useGetTaxExemptionListQuery({
              property_id: propertyId,
            });
            const options =
              data?.map((item) => ({
                label: item.reason,
                value: item.id.toString(),
              })) || [];
            return (
              <CustomDropdownMain
                label="Tax Exemption"
                placeholder="Select Tax Exemption (if any)"
                options={options}
                value={value ? value.toString() : ""}
                onChange={(e: any) => {
                  const selectedId = e.target.value
                    ? Number(e.target.value)
                    : undefined;
                  onChange(selectedId);
                }}
                isInvalid={!!error}
                helperText={error?.message}
                fullWidth
                disabled={isLoading || isError}
                className="mb-2"
              />
            );
          }}
        />
      </Box>

      <Box mt={4} key={`guestDetail-${stayIndex}`}>
        <Typography variant="h6" component="h3" gutterBottom>
          Guests
        </Typography>

        <Controller
          name={`stays.${stayIndex}.guests`}
          control={control}
          render={({ fieldState: { error } }) => (
            <>
              <GuestDetailForm
                guests={stay.guests || []}
                maxGuest={stay?.roomType?.occupancy ?? 1}
                index={stayIndex}
                control={control as unknown as Control<IReservation>}
              />
              {error?.message && (
                <Typography variant="body2" color="error" marginTop={1}>
                  {error?.message ?? "Please Fill Guest Detail"}
                </Typography>
              )}
            </>
          )}
        />
      </Box>

      {/* Custom Rate Dialog */}
      <Dialog
        open={openRateDialog}
        onClose={handleCloseRateDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Edit Nightly Rates - {stay?.roomType?.type}
          <IconButton
            aria-label="close"
            onClick={handleCloseRateDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="subtitle1" fontWeight="bold" color="primary">
              ADR:{" "}
              {(() => {
                // Convert mixed types to numbers for calculation
                const numericRates: { [date: string]: number } = {};
                Object.entries(tempCustomRates).forEach(([date, rate]) => {
                  numericRates[date] = rate === "" ? 0 : Number(rate);
                });
                return calculateADR(numericRates).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 2,
                });
              })()}
            </Typography>
          </Box>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "50%", minWidth: 150 }}>
                    <Typography fontWeight="bold">Date</Typography>
                  </TableCell>
                  <TableCell
                    sx={{ width: "50%", minWidth: 120, textAlign: "center" }}
                  >
                    <Typography fontWeight="bold">Nightly Rate</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(tempCustomRates).map(([date, rate]) => (
                  <TableRow key={date}>
                    <TableCell sx={{ verticalAlign: "middle" }}>
                      {moment(date).format("MMM DD, YYYY")}
                    </TableCell>
                    <TableCell
                      sx={{ textAlign: "center", verticalAlign: "middle" }}
                    >
                      <TextField
                        size="small"
                        type="number"
                        value={rate}
                        onChange={(e) => handleRateChange(date, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        inputProps={{
                          min: 0,
                          style: { width: 100, textAlign: "center" },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "& input": {
                              textAlign: "center",
                            },
                          },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRateDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSaveRates}
            color="primary"
            variant="contained"
            disabled={!hasChanges}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StayDetails;

const CustomDropdownMain = styled(CustomDropdown)(() => ({
  marginTop: "14px",
  alignItems: "flex-start",
}));
