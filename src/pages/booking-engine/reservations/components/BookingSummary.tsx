import React from "react";
import moment from "moment";
import {
  Box,
  Grid,
  Skeleton,
  styled,
  Typography,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { IReservationResponse } from "types/reservationTypes";
import ReservationStatusChip from "components/widgets/ReservationStatusChip/ReservationStatusChip";
import TextButton from "./ReservationDetail/components/TextButton";
import { pluralValue } from "utils/helperFunctions/common";
import { getMethodDetailString, getCurrentRoom } from "utils/reservations";
import { PaymentTotalsData } from "components/ui/PaymentTotals/PaymentTotals";
import RoomUnassign from "./ReservationDetail/RoomUnassign";
import { isValidMethod, methodsHaveValidMethod } from "utils/payments";
import { FolioTypes } from "constants/folios";
import DisplayRoomStatus from "./DisplayRoomStatus";
import { statusColors } from "components/widgets/RoomStatusCode/RoomStatusCode";
import { IRoomStatus } from "constants/room";
import { ReservationStatusEnum } from "constants/reservation";
import RatePlanDetail from "components/ui/RatePlanDetail/RatePlanDetail";
import { useUpdateGuestMutation } from "services/guestSlice";
import DynamicIcon from "components/ui/DynamicIcon/DynamicIcon";
import { useUpdateReservationMutation } from "services/reservationSlice";
interface DetailRowProps {
  label: string;
  textValue?: string;
  renderValue?: () => React.ReactNode;
}

interface IBookingSummaryProps {
  isLoading: boolean;
  details: IReservationResponse | null;
  onRoomAssignClick: () => void;
  onChangeTypeClick?: () => void;
  onEditDatesClick?: () => void;
  totals?: PaymentTotalsData;
  onRefresh?: () => void;
}

const BookingSummaryLoader: React.FC = () => {
  return (
    <Grid
      container
      spacing={2}
      border="1px solid #ccc"
      borderRadius={1}
      sx={{
        backgroundColor: "#f9f9f9",
      }}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid
          key={index.toString()}
          item
          xs={12}
          sm={5}
          md={4}
          lg={2}
          padding={2}
        >
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="80%" />
        </Grid>
      ))}
    </Grid>
  );
};

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  textValue,
  renderValue,
}) => (
  <Box display="flex" flexDirection="column" width="100%" flexWrap="wrap">
    <Typography variant="body1" fontWeight="bold">
      {label}:
    </Typography>
    {textValue && <Typography variant="body2">{textValue}</Typography>}
    {renderValue?.()}
  </Box>
);

const BookingSummary: React.FC<IBookingSummaryProps> = ({
  isLoading,
  details,
  onRoomAssignClick,
  onChangeTypeClick,
  onEditDatesClick,
  totals,
  onRefresh,
}) => {
  if (isLoading) {
    return (
      <>
        <BookingSummaryLoader />
      </>
    );
  }
  const totalDays = moment(details?.end_date).diff(
    moment(details?.start_date),
    "days"
  );

  function getRoomNumberDisplay() {
    const roomAssigned = getCurrentRoom(details);
    if (roomAssigned) {
      const roomNumber = roomAssigned.room_number;
      const hkCode = roomAssigned?.housekeeping_status as
        | IRoomStatus
        | undefined;
      const shouldShowHK = details
        ? new Set<ReservationStatusEnum>([
            ReservationStatusEnum.RESERVED,
            ReservationStatusEnum.ARRIVING,
            ReservationStatusEnum.NO_SHOW,
            ReservationStatusEnum.IN_HOUSE,
            ReservationStatusEnum.DEPARTING,
          ]).has(details.status)
        : false;
      return (
        <Box display="flex" flexDirection="column" gap={1}>
          <Box display="flex" alignItems="center">
            <Typography variant="body1">{roomNumber}</Typography>
            {shouldShowHK &&
              hkCode &&
              (() => {
                const info = statusColors[hkCode as IRoomStatus];
                const label = info?.label || hkCode;
                const color = info?.color || "black";
                return (
                  <Tooltip title={label}>
                    <Typography
                      sx={{ fontWeight: "bold", ml: 1 }}
                      style={{ color }}
                    >
                      {hkCode}
                    </Typography>
                  </Tooltip>
                );
              })()}
            <RoomUnassign details={details} onRefresh={onRefresh} />
          </Box>
          <DisplayRoomStatus details={details} onRefresh={onRefresh} />
        </Box>
      );
    }
    return (
      <Box>
        <TextButton
          onClick={onRoomAssignClick}
          sx={{ width: "auto" }}
          data-testid="summary-assign-room-btn"
        >
          Assign
        </TextButton>
      </Box>
    );
  }

  const totalNight = totalDays > 1 ? totalDays : 1;
  const roomTypeInfo = details?.room_type;

  function getPaymentMethodString() {
    let pmString = "None collected";
    if (methodsHaveValidMethod(details?.payment_methods)) {
      let method = details?.folios?.find(
        (f) => f.type === FolioTypes.A
      )?.primary_payment_method;
      if (!method) {
        method = details?.payment_methods.find((pm) => isValidMethod(pm));
      }
      pmString = method ? getMethodDetailString(method) : "None collected";
    }
    return pmString;
  }

  // const childrenCount = details?.children_count ?? 0;
  const guestCount = details?.guests?.length ?? 0;
  const adultCount = guestCount;
  const primaryGuest = details?.reservation_first_guest_info;
  const [updateGuest, { isLoading: isUpdatingGuest }] =
    useUpdateGuestMutation();
  const [updateReservation, { isLoading: isUpdatingReservation }] =
    useUpdateReservationMutation();

  const [vipDialogOpen, setVipDialogOpen] = React.useState(false);

  type VipGuest = {
    id: number;
    first_name: string;
    last_name: string;
    vip?: boolean;
    isBooker?: boolean;
  };

  const vipGuests: VipGuest[] = React.useMemo(() => {
    if (!details) return [];

    const guests: VipGuest[] = [];
    const seen = new Set<number>();

    if ((details as any).reservation_holder_info) {
      const holder = (details as any).reservation_holder_info as any;
      guests.push({
        id: holder.id,
        first_name: holder.first_name,
        last_name: holder.last_name,
        vip: holder.vip,
        isBooker: true,
      });
      seen.add(holder.id);
    }

    (details.guests || []).forEach((g: any) => {
      if (!seen.has(g.id)) {
        guests.push({
          id: g.id,
          first_name: g.first_name,
          last_name: g.last_name,
          vip: g.vip,
        });
        seen.add(g.id);
      }
    });

    return guests;
  }, [details]);

  const anyVip = vipGuests.some((g) => Boolean(g.vip));
  const vipCount = vipGuests.filter((g) => Boolean(g.vip)).length;

  async function handleToggleGuestFlag(
    flag: "vip" | "incognito",
    checked: boolean
  ) {
    if (!details?.id) return;

    if (flag === "incognito") {
      const response = await updateReservation({
        id: details.id,
        incognito: checked,
      } as any);
      if ((response as any)?.data) {
        onRefresh?.();
      }
    }
  }

  async function handleToggleVipForGuest(guestId: number, checked: boolean) {
    const response = await updateGuest({
      id: guestId,
      vip: checked,
    } as any);
    if ((response as any)?.data) {
      onRefresh?.();
    }
  }
  return (
    <Grid
      container
      spacing={2}
      marginLeft={0}
      sx={{
        backgroundColor: "#f9f9f9",
      }}
    >
      <Col item xs={12} sm={6} md={4} lg={2} padding={2}>
        <DetailRow
          label="Date"
          renderValue={() => (
            <Box display="flex" alignItems="center" flexWrap="wrap">
              <Typography variant="body1">
                {`${moment(details?.start_date).format("MMM DD")} - ${moment(details?.end_date).format("MMM DD")} (${pluralValue(totalNight, "night", "nights")})`}
              </Typography>
              <Box ml={0.5} mr={-2}>
                <TextButton
                  onClick={onEditDatesClick}
                  sx={{ minWidth: "unset" }}
                  data-testid="summary-change-room-type-btn"
                >
                  Edit
                </TextButton>
              </Box>
            </Box>
          )}
        />
        <DetailRow
          label="Rate Plan"
          renderValue={() => (
            <Box display="flex" alignItems="center" flexWrap="wrap">
              <Typography variant="body1">{`${details?.rate_code?.name ?? ""}`}</Typography>
              <Box ml={0.5} mr={-2}>
                <RatePlanDetail
                  rate_plan_id={details?.rate_code?.rate_plan?.id ?? null}
                />
              </Box>
            </Box>
          )}
        />
      </Col>
      <Col item xs={12} sm={6} md={4} lg={2} padding={2}>
        <DetailRow
          label="Guests"
          renderValue={() => (
            <Box display="flex" flexDirection="column">
              <Typography variant="body2">{`Adult: ${adultCount} Children: ${details?.children_count}`}</Typography>
              <Box display="flex" flexDirection="column" mt={1}>
                <FormControlLabel
                  label={
                    <Box display="flex" alignItems="center">
                      <Box component="span" mr={0.5}>
                        {`VIP${
                          vipCount > 0
                            ? ` (${vipCount} guest${vipCount > 1 ? "s" : ""})`
                            : ""
                        }`}
                      </Box>
                      <DynamicIcon name="RiVipCrown2Fill" color="black" />
                    </Box>
                  }
                  control={
                    <Checkbox
                      size="small"
                      checked={anyVip}
                      onClick={() => setVipDialogOpen(true)}
                      onChange={() => setVipDialogOpen(true)}
                    />
                  }
                />
                <FormControlLabel
                  label={
                    <Box display="flex" alignItems="center">
                      <Box component="span" mr={0.5}>
                        Incognito
                      </Box>
                      <DynamicIcon name="BsIncognito" />
                    </Box>
                  }
                  control={
                    <Checkbox
                      size="small"
                      checked={Boolean((details as any)?.incognito)}
                      onChange={(_, checked) =>
                        handleToggleGuestFlag("incognito", checked)
                      }
                      disabled={isUpdatingReservation}
                    />
                  }
                />
              </Box>
            </Box>
          )}
        />
      </Col>
      <Col item xs={12} sm={6} md={4} lg={2} padding={2}>
        <DetailRow
          label="Room Type"
          renderValue={() => (
            <div>
              <Box display="flex" alignItems="center">
                <Typography variant="body1">
                  {roomTypeInfo?.type ?? ""}
                </Typography>
                <Box ml={2}>
                  <TextButton
                    onClick={onChangeTypeClick}
                    sx={{ width: "auto" }}
                    data-testid="summary-change-room-type-btn"
                  >
                    Change
                  </TextButton>
                </Box>
              </Box>
              <Typography variant="body2">
                {roomTypeInfo?.name ?? ""}
              </Typography>
            </div>
          )}
        />
      </Col>
      <Col item xs={12} sm={6} md={4} lg={2} padding={2}>
        <DetailRow label="Room No" renderValue={getRoomNumberDisplay} />
      </Col>
      <Col item xs={12} sm={6} md={4} lg={2} padding={2}>
        <DetailRow
          label="Reservation Status"
          renderValue={() => (
            <div
              style={{
                maxWidth: "fit-content",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <ReservationStatusChip status={details?.status} />
              {details?.is_guaranteed !== undefined && (
                <Box mt={2}>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={"text.primary"}
                  >
                    GTD: {details?.is_guaranteed ? "Yes" : "No"}
                  </Typography>
                </Box>
              )}
            </div>
          )}
        />
      </Col>
      <Col item xs={12} sm={6} md={4} lg={2} padding={2} borderRight={0}>
        <DetailRow
          label="Payment Method"
          renderValue={() => (
            <Box>
              <div>
                <Typography variant="body1" component="span">
                  Card:
                </Typography>
                <Typography
                  variant="body1"
                  component="span"
                >{` ${getPaymentMethodString()}`}</Typography>
              </div>
              <div>
                <Typography variant="body1" component="span">
                  Balance:
                </Typography>
                <Typography
                  variant="body1"
                  component="span"
                >{` ${totals?.balance.toLocaleString("en-US", { style: "currency", currency: "USD" })}`}</Typography>
              </div>
            </Box>
          )}
        />
      </Col>
      <Dialog
        open={vipDialogOpen}
        onClose={() => setVipDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Select VIP guests</DialogTitle>
        <DialogContent dividers>
          {vipGuests.map((guest) => (
            <FormControlLabel
              key={guest.id + (guest.isBooker ? "-booker" : "")}
              label={
                <Box display="flex" alignItems="center">
                  <Typography variant="body2">
                    {guest.first_name} {guest.last_name}
                    {guest.isBooker ? " (Booker)" : ""}
                  </Typography>
                </Box>
              }
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(guest.vip)}
                  onChange={(_, checked) =>
                    handleToggleVipForGuest(guest.id, checked)
                  }
                  disabled={isUpdatingGuest}
                />
              }
            />
          ))}
          {!vipGuests.length && (
            <Typography variant="body2" color="text.secondary">
              No guests are attached to this reservation.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVipDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default BookingSummary;

const Col = styled(Grid)(() => ({
  border: "1px solid #ccc",
  marginTop: "-1px",
  marginLeft: "-1px",
}));
