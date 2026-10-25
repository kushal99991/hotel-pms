import {
  Controller,
  Control,
  useFieldArray,
  FieldArrayWithId,
  useFormContext,
} from "react-hook-form";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Box,
  Link,
  styled,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { IGetRoomTypeAvailability, IRoomTypes } from "types/roomTypes";
import { IInventory, IReservation, IStay } from "types/reservationTypes";
import Label from "components/elements/Label/Label";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";

import moment from "moment";
import ReservationHolderForm from "./ReservationHolderForm";
import StayDetails from "./StayDetails";
import {
  marketOptionList,
  bookingChannelList,
} from "config/tables/reservations";
import AddReservationViewContext from "contexts/AddReservationViewContext";
import { useGetInventoryMutation } from "services/roomTypeSlice";
import useAuth from "hooks/useAuth";
import ScrollingTable, {
  ScrollingTableColumn,
} from "components/elements/ScrollingTable/ScrollingTable";
import { getMoment } from "utils/helperFunctions/common";
import { appConfig } from "config/app.config";

interface IRoomAvailability {
  roomType: string;
  totalRoom: number;
  [date: string]: number | string;
}

interface StaySectionProps {
  control: Control<IReservation>;
  roomAvailabilityList: IGetRoomTypeAvailability[];
}

const StaySection: React.FC<StaySectionProps> = ({
  control,
  roomAvailabilityList,
}) => {
  const { users, currentTimeZone } = useAuth();
  const { viewState, roomTypeList } = useContext(AddReservationViewContext)!;

  const [availableRoomsPerId, setAvailableRoomsPerId] = useState<{ [id: number]: number }>({});
  const [selectedRoomsPerId, setSelectedRoomsPerId] = useState<{ [id: number]: number }>({});
  const [openDialogType, setOpenDialogType] = useState<"pricing" | "availableRoom" | null>(null);
  const [openPricingIndex, setOpenPricingIndex] = useState<number | null>(null);
  const [getInventory] = useGetInventoryMutation();

  const maxRoom = 10;

  useEffect(() => {
    const initialAvailable: { [id: number]: number } = {};
    roomAvailabilityList.forEach((item) => {
      initialAvailable[item.roomTypeId] = item.roomsAvailable ?? maxRoom;
    });
    setAvailableRoomsPerId(initialAvailable);
    setSelectedRoomsPerId({});
  }, [roomAvailabilityList, maxRoom]);

  const { fields: stays, append } = useFieldArray({
    control,
    name: `stays`,
  });
  const methods = useFormContext();
  const { setValue, watch } = methods;
  const startDateM = watch("startDate");
  const endDateM = watch("endDate");
  const roomTypeIds = watch("roomTypeIds");
  const rateCodeId = watch("rateCode");
  const isMobile = useMediaQuery("(min-width:768px)");

  const getTotalForDate = <T extends number>(data: any[], date: string | number): number => {
    return data.reduce((sum: number, room: { [x: string]: any }) => {
      return sum + (room[date] || 0);
    }, 0);
  };

  const getRoomTypeAvailability = useCallback(async () => {
    if (users?.defaultPropertyId) {
      await getInventory({ property_id: users.defaultPropertyId.toString() });
    }
  }, [roomTypeIds, rateCodeId, users?.defaultPropertyId, getInventory, roomTypeList]);

  const openDialog = (type: "pricing" | "availableRoom") => {
    setOpenDialogType(type);
  };

  const closeDialog = () => {
    setOpenDialogType(null);
  };

  const handleTogglePricingCollapse = (index: number) => {
    setOpenPricingIndex(openPricingIndex === index ? null : index);
  };

  const handleRoomChange = useCallback(
    (
      roomAvailability: IGetRoomTypeAvailability,
      selectedRoomCount: number,
      totalPrice: number,
      roomTypeId: number
    ) => {
      setSelectedRoomsPerId((prevSelectedRooms) => ({
        ...prevSelectedRooms,
        [roomTypeId]: selectedRoomCount,
      }));
    },
    []
  );

  const roomAvailabilityColumns: ScrollingTableColumn<IRoomAvailability>[] = [
    { field: "roomType", headerName: "Room Type" },
    { field: "totalRoom", headerName: "Total Rooms" },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" component="h2" marginBottom={2}>
          Rooms:
        </Typography>
        {openDialogType === "availableRoom" ? (
          <StyledLink onClick={() => closeDialog()}>
            Hide Room Availability Details
          </StyledLink>
        ) : (
          <StyledLink onClick={() => openDialog("availableRoom")}>
            Show Room Availability Details
          </StyledLink>
        )}
      </Box>

      {roomAvailabilityList.length === 0 ? (
        <Typography
          variant="body1"
          color="textSecondary"
          textAlign="center"
          marginTop={2}
        >
          No Room Details found
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Label>Select Room</Label>
                </TableCell>
                <TableCell>
                  <Label>Room Type</Label>
                </TableCell>
                <TableCell align="center">
                  <Label>Average Daily Rate</Label>
                </TableCell>
                <TableCell align="center">
                  <Label>Available Rooms</Label>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomAvailabilityList.map((roomAvailability, index) => {
                const pricingValues = Object.values(roomAvailability.pricing || {});
                const totalPrice = pricingValues.reduce(
                  (sum, price) => sum + parseFloat(price || "0"),
                  0
                );
                const averagePrice = pricingValues.length ? totalPrice / pricingValues.length : 0;

                const displayAveragePrice = averagePrice.toLocaleString(
                  "en-US",
                  {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 2,
                  }
                );

                return (
                  <React.Fragment key={`roomAvailability-${index}`}>
                    <StyledTableRow>
                      <TableCell>
                        <FormControl fullWidth sx={{ minHeight: 70 }}>
                          <InputLabel id="demo-simple-select-label">
                            Select Room
                          </InputLabel>
                          <Select
                            disabled={
                              (availableRoomsPerId[roomAvailability.roomTypeId] ?? 0) === 0
                            }
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={
                              selectedRoomsPerId[roomAvailability.roomTypeId] ??
                              0
                            }
                            label="Select Room"
                            data-testid={`select-room-${roomAvailability.roomTypeId}`}
                            onChange={(event: SelectChangeEvent<number>) => {
                              const selectedRoom = Number(event.target.value);
                              handleRoomChange(
                                roomAvailability,
                                selectedRoom,
                                totalPrice,
                                roomAvailability.roomTypeId
                              );
                            }}
                          >
                            <MenuItem key={`roomCountSelect-${0}`} value={0}>
                              0
                            </MenuItem>
                            {Array.from(
                              {
                                length: Math.min(
                                  availableRoomsPerId[roomAvailability.roomTypeId] ?? 0,
                                  roomAvailability.roomsAvailable
                                ),
                              },
                              (_, index) => (
                                <MenuItem
                                  key={`roomCountSelect-${index + 1}`}
                                  value={index + 1}
                                >
                                  {index + 1}
                                </MenuItem>
                              )
                            )}
                          </Select>
                          {availableRoomsPerId[roomAvailability.roomTypeId] ===
                            0 && (
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              sx={{
                                fontStyle: "italic",
                                marginTop: "5px",
                                visibility: "visible",
                              }}
                            >
                              {`You have selected all ${maxRoom} of your rooms already`}
                            </Typography>
                          )}
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold" mb={2}>
                          {roomAvailability.roomType?.type}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="bold" mb={"5px"}>
                          {displayAveragePrice}
                        </Typography>
                        <StyledLink
                          onClick={() => handleTogglePricingCollapse(index)}
                        >
                          Nightly Rate Breakdown
                        </StyledLink>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="bold" mb={2}>
                          {roomAvailability.roomsAvailable}
                        </Typography>
                      </TableCell>
                    </StyledTableRow>
                    {openPricingIndex === index && (
                      <StyledTableRow>
                        <StyledTableCell colSpan={9}>
                          <Collapse
                            in={openPricingIndex === index}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box padding={2}>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>
                                      <Typography fontWeight="bold">
                                        Date Range
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography fontWeight="bold">
                                        Nightly Rate
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {Object.entries(roomAvailability.pricing || {}).map(
                                    ([date, rate], idx) => (
                                      <TableRow key={`roomPricing-${idx}`}>
                                        <TableCell>
                                          {moment(date).format("MMM DD, YYYY")}
                                        </TableCell>
                                        <TableCell>
                                          {parseFloat(rate).toLocaleString(
                                            "en-US",
                                            {
                                              style: "currency",
                                              currency: "USD",
                                              maximumFractionDigits: 2,
                                            }
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </StyledTableCell>
                      </StyledTableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {stays.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Customer Details
          </Typography>

          <Controller
            name={`marketSegment`}
            control={control}
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <CustomDropdownMain
                label="Market Segment:"
                placeholder="Market Segment"
                onChange={onChange}
                value={value ?? null}
                isInvalid={invalid}
                helperText={error?.message ?? ""}
                options={marketOptionList}
                fullWidth
                aria-label="Market Segment"
                className="mb-2"
                data-testid="market-segment-dropdown"
              />
            )}
          />

          <Controller
            name={`bookingChannel`}
            control={control}
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <CustomDropdownMain
                label="Booking Channel:"
                placeholder="Booking Channel"
                onChange={onChange}
                value={value ?? null}
                isInvalid={invalid}
                helperText={error?.message ?? ""}
                options={bookingChannelList}
                fullWidth
                aria-label="Booking Channel"
                className="mb-2"
                data-testid="booking-channel-dropdown"
              />
            )}
          />
          <ReservationHolderForm />
          <Controller
            name={`stays`}
            control={control}
            render={({ fieldState: { error } }) => (
              <>
                {stays.map(
                  (
                    value: FieldArrayWithId<IReservation, "stays", "id">,
                    index: number
                  ) => (
                    <StayDetails
                      stay={value}
                      stayIndex={index}
                      key={`stay-${value.id}`}
                      roomAvailabilityList={roomAvailabilityList}
                    />
                  )
                )}
                {error?.message && (
                  <Typography variant="body2" color="error" marginTop={1}>
                    {error?.message ?? "Please Fill Room Detail"}
                  </Typography>
                )}
              </>
            )}
          />
        </>
      )}

      {/* Dialog for Available Room Details */}
      <Dialog
        open={openDialogType === "availableRoom"}
        fullWidth
        maxWidth="xl"
        onClose={closeDialog}
      >
        <DialogTitle>
          Available Room Details
          <IconButton
            aria-label="close"
            onClick={closeDialog}
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
          <ScrollingTable
            columns={roomAvailabilityColumns}
            data={[]}
            pagination={false}
            isLoading={false}
            rowsPerPageOptions={[5, 10, 25]}
            initialRowsPerPage={10}
            tableProps={{ autoHeight: true }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StaySection;

const StyledTableRow = styled(TableRow)(() => ({
  "&:last-child td, &:last-child th": { border: 0 },
  borderBottom: 0,
  verticalAlign: "top",
}));

const StyledTableCell = styled(TableCell)(() => ({
  borderTop: 0,
}));

const StyledLink = styled(Link)(() => ({
  padding: 0,
  textTransform: "none",
  cursor: "pointer",
  textDecoration: "none",
  fontSize: "inherit",
  backgroundColor: "transparent",
  border: "none",
  outline: "none",
}));

const CustomDropdownMain = styled(CustomDropdown)(() => ({
  marginTop: "14px",
  alignItems: "flex-start",
}));

export default StaySection;

const StyledTableRow = styled(TableRow)(() => ({
  "&:last-child td, &:last-child th": { border: 0 },
  borderBottom: 0,
  verticalAlign: "top",
}));

const StyledTableCell = styled(TableCell)(() => ({
  borderTop: 0,
}));

const StyledLink = styled(Link)(() => ({
  padding: 0,
  textTransform: "none",
  cursor: "pointer",
  textDecoration: "none",
  fontSize: "inherit",
  backgroundColor: "transparent",
  border: "none",
  outline: "none",
}));

const CustomDropdownMain = styled(CustomDropdown)(() => ({
  marginTop: "14px",
  alignItems: "flex-start",
}));
