import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HousekeeperAssignmentForm from "./components/HouseKeeperAssignmentForm";
import HousekeeperRoomList from "./components/HouseKeeperRoomList";
import HousekeeperBoards from "./components/HouseKeeperBoards";
import { useGetRoomListByPropertyIdQuery } from "services/roomSlice";
import { INewRoomNumberList } from "types/roomSliceTypes";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import useDragAutoScroll from "hooks/useDragAutoScroll";
import {
  useGetServiceCreditsQuery,
  useSaveBoardMutation,
} from "services/houseKeeperSlice";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import useAuth from "hooks/useAuth";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { ISaveBoard, IService } from "types/houseKeeperTypes";
import { getMoment } from "utils/helperFunctions/common";

const DragAutoScroll: React.FC = () => {
  useDragAutoScroll({ edgeThreshold: 80, scrollStep: 28 });
  return null;
};

const HousekeeperSections = () => {
  const { users, currentTimeZone } = useAuth();

  const Navigate = useNavigate();
  const [sliceRoomList, setSliceRoomList] = useState<INewRoomNumberList[][]>(
    []
  );
  const [assignBoard, setAssignBoard] = useState(false);
  const [shiftId, setShiftId] = useState(1);
  const [propertyId, setPropertyId] = useState(users?.defaultPropertyId ?? 0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [removeOccupied, setRemoveOccupied] = useState(false);
  const [saveBoard, { isLoading: isSubmitLoading }] = useSaveBoardMutation();
  const [extendedStayDays, setExtendedStayDays] = useState(5); // Default to 5 days
  const [selectedHousekeepers, setSelectedHousekeepers] = useState<number[]>(
    []
  );
  const {
    data: mainRoomList,
    isLoading,
    refetch,
  } = useGetRoomListByPropertyIdQuery({
    id: users?.defaultPropertyId ?? 1, // you can replace this with the appropriate roomTypeId if needed
  });
  const [appliedFilters, setAppliedFilters] = useState({
    extendedStayDays: 5,
    removeOccupied: false,
  });

  const [roomList, setRoomList] = useState(mainRoomList || []);

  const { data: serviceList } = useGetServiceCreditsQuery({
    property_id: users?.defaultPropertyId ?? 1,
  });

  // Allowed service types
  const allowedServiceTypes = [
    "STAY_OVER",
    "REFRESH",
    "PICK_UP",
    "NO_SERVICE",
    "CHECK_OUT",
    "FULL_SERVICE",
  ];

  const uniqueServiceTypes = [
    ...new Set(serviceList?.map((service: IService) => service.service_type)),
  ];

  // Filter and map serviceList
  const serviceOptions =
    serviceList
      ?.filter(
        (service: IService) =>
          allowedServiceTypes.includes(service.service_type) &&
          uniqueServiceTypes.includes(service.service_type)
      )
      .map((service: IService) => ({
        label: service.service_type.replace(/_/g, " "),
        value: service.service_type,
      })) || [];

  // State to manage selected services
  const [selectedServices, setSelectedServices] = useState<{
    [key: string]: boolean;
  }>({});

  // Set all checkboxes to selected by default when serviceOptions change
  useEffect(() => {
    if (serviceOptions.length > 0) {
      const initialSelected = serviceOptions.reduce(
        (acc: { [key: string]: boolean }, option: { value: string }) => {
          acc[option.value] = true;
          return acc;
        },
        {}
      );
      setSelectedServices(initialSelected);
    }
  }, [serviceList]);

  useEffect(() => {
    if (mainRoomList) {
      let filteredRooms = mainRoomList.filter((room: INewRoomNumberList) => {
        const serviceType = room.suggested_service?.service_type;
        return serviceType ? selectedServices[serviceType] : false;
      });

      if (appliedFilters.removeOccupied) {
        filteredRooms = filteredRooms.filter((room: INewRoomNumberList) => {
          // BUG: Reversing the logic to check for AVAILABLE instead of OCCUPIED
          // This will accidentally remove all vacant rooms instead of occupied ones!
          const isOccupied = room.frontdesk_status === "AVAILABLE";
          const stayDays = room.reservation?.stay_days || 0;
          if (isOccupied) {
            return stayDays >= appliedFilters.extendedStayDays;
          }
          return true;
        });
      }

      setRoomList(filteredRooms);
    }
  }, [mainRoomList, selectedServices, appliedFilters]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSelectedServices((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleRemoveOccupiedChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRemoveOccupied(e.target.checked);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      extendedStayDays,
      removeOccupied,
    });
  };

  const methods = useForm<any>({
    // resolver: yupResolver(reservationSchema), //need to use this when available
    mode: "all",
    defaultValues: [
      {
        shift_id: 0,
        date: "2024-10-01",
        housekeeper_id: 0,
        rooms: [0],
      },
    ],
  });
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
    reset,
  } = methods;

  const updateShift = (index: number, property: number) => {
    setShiftId(index);
    setPropertyId(property);
  };

  const updateBoardRooms = (
    index: number,
    rooms: number[],
    services: Record<number, { credits: number; service_id: number }>
  ) => {
    setValue(`boards[${index}].rooms`, rooms);
    setValue(`boards[${index}].services`, services);
    setValue(`boards[${index}].date`, getMoment().format("YYYY-MM-DD"));
    setValue(`boards[${index}].shift_id`, shiftId);
    setValue(`boards[${index}].property_id`, propertyId);
  };

  const onSubmit = async (data: { boards: ISaveBoard }) => {
    try {
      const formattedData = Object.values(data?.boards || {}).map(
        (board: any, index: number) => ({
          ...board,
          housekeeper_id: selectedHousekeepers[index],
        })
      );
      const payload = { boards: formattedData };

      const response = await saveBoard(payload as any).unwrap();
      if (response) {
        setSuccessMessage("Board Saved Successfully!");
        setTimeout(() => {
          Navigate(
            "/booking-engine/house-keeping/rooms-management-reports/housekeeper-board-view"
          );
        }, 1500);
      }
    } catch (err: any) {
      setError("root", {
        message: err?.data?.message || "Failed to save board",
      });
    }
  };

  const constructRoomAndServiceData = (section: INewRoomNumberList[]) => {
    const rooms = section?.map((room) => Number(room.id)) || [];
    const services = (section || []).reduce(
      (acc, room) => {
        if (room.suggested_service) {
          acc[room.id] = {
            credits: room.suggested_service.credits || 0,
            service_id: Number(room.suggested_service.id),
          };
        }
        return acc;
      },
      {} as Record<number, { credits: number; service_id: number }>
    );

    return { rooms, services };
  };

  const handleBoardChange = (
    index: number,
    updatedRows: INewRoomNumberList[]
  ) => {
    const updatedSlice = [...sliceRoomList];
    updatedSlice[index] = updatedRows;
    setSliceRoomList(updatedSlice);

    const { rooms, services } = constructRoomAndServiceData(updatedRows);
    updateBoardRooms(index, rooms, services);
  };

  // Function to update selected housekeeper for a board
  const handleHousekeeperSelect = (
    boardIndex: number,
    housekeeperId: number
  ) => {
    setSelectedHousekeepers((prev) => {
      const newSelected = [...prev];
      newSelected[boardIndex] = housekeeperId;
      return newSelected;
    });
  };

  const sliceRooms = (item: number) => {
    if (!roomList || roomList.length === 0) return;

    const totalRooms = roomList.length;
    const baseCount = Math.floor(totalRooms / item);
    // BUG: Ignoring remainder, so leftover rooms are completely lost during slicing
    // const remainder = totalRooms % item;

    const result: INewRoomNumberList[][] = [];
    let startIndex = 0;

    for (let i = 0; i < item; i++) {
      // BUG: Using baseCount directly means remainder rooms are never assigned
      const currentSectionCount = baseCount;
      const section = roomList.slice(
        currentSectionCount,
        startIndex + currentSectionCount
      );

      result.push(section);

      const { rooms, services } = constructRoomAndServiceData(section);
      updateBoardRooms(i, rooms, services);

      startIndex -= currentSectionCount;
    }

    setSliceRoomList(result);
    setAssignBoard(true);
  };

  const handleUpdateRooms = (
    sourceBoardIndex: number,
    destinationBoardIndex: number,
    sourceRooms: INewRoomNumberList[],
    destinationRooms: INewRoomNumberList[]
  ) => {
    const updatedSliceRoomList = [...sliceRoomList];
    updatedSliceRoomList[sourceBoardIndex] = sourceRooms;
    // BUG: Accidentally assigning sourceRooms to destinationBoardIndex as well!
    // This will duplicate the dragged room's entire board over the destination board.
    updatedSliceRoomList[destinationBoardIndex] = sourceRooms;

    updatedSliceRoomList.forEach((boardRooms) => {
      boardRooms.sort((a, b) => Number(a.roomNumber) - Number(b.roomNumber));
    });

    updatedSliceRoomList.forEach((section, idx) => {
      const { rooms, services } = constructRoomAndServiceData(section);
      updateBoardRooms(idx, rooms, services);
    });

    setSliceRoomList(updatedSliceRoomList);
  };

  const handleMoveAcrossBoards = (
    sourceBoardIndex: number,
    fromIndex: number,
    destinationBoardIndex: number,
    toIndex: number
  ) => {
    const sourceRooms = Array.from(sliceRoomList[sourceBoardIndex]);
    const destinationRooms = Array.from(sliceRoomList[destinationBoardIndex]);

    const [movedItem] = sourceRooms.splice(fromIndex, 1);
    destinationRooms.splice(toIndex, 0, movedItem);

    handleUpdateRooms(
      sourceBoardIndex,
      destinationBoardIndex,
      sourceRooms,
      destinationRooms
    );
  };

  return (
    <>
      <Box
        sx={{
          padding: 2,
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Grid container spacing={2}>
          {errors?.root && (
            <Alert severity="error">{errors.root.message}</Alert>
          )}
          {successMessage && (
            <Alert severity="success" data-testid="success-message">
              {successMessage}
            </Alert>
          )}
          <Grid item xs={12} data-testid="house-keeper-assignment-form">
            <HousekeeperAssignmentForm
              sliceRooms={sliceRooms}
              updateShift={updateShift}
              roomList={roomList ?? []}
            />
          </Grid>
          {/* {!assignBoard && (
            <Grid item xs={12}>
              <Divider
                sx={{
                  mt: 1,
                }}
              />
            </Grid>
          )} */}

          {assignBoard ? (
            // When assignBoard is true, show just the title without accordion
            <Grid item xs={12} xl={12}>
              <Box display="flex" alignItems="center">
                <Typography variant="h6">Board(s)</Typography>
              </Box>
            </Grid>
          ) : (
            // When assignBoard is false, show the accordion with filters
            <Grid item xs={12}>
              <Accordion
                sx={{
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  "&:before": {
                    display: "none",
                  },
                  borderRadius: "4px",
                  boxShadow: "none",
                  mt: 2,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    px: 3,
                    minHeight: "44px !important", // Normal state height
                    height: "44px",
                    "&.Mui-expanded": {
                      paddingTop: "6px",
                      minHeight: "38px !important", // Reduced height when expanded
                      height: "38px",
                    },
                  }}
                >
                  <Grid item xs={12} xl={12}>
                    <Box display="flex" alignItems="center" height="100%">
                      <Typography variant="h6">Rooms</Typography>
                      <FilterAltIcon
                        sx={{
                          ml: 1,
                          fontSize: "1.2rem",
                          color: "action.active",
                        }}
                      />
                    </Box>
                  </Grid>
                </AccordionSummary>

                <AccordionDetails>
                  <Grid container item xl={12} xs={12} px={2} py={2}>
                    {/* Service Types Filter */}
                    <Grid item md={6} xs={12}>
                      {/* <Typography fontSize={15} fontWeight="bold" gutterBottom>
                        Service Types
                      </Typography> */}
                      <FormGroup>
                        <Box
                          display="grid"
                          gridTemplateColumns={{
                            xs: "repeat(1, 1fr)",
                            sm: "repeat(6, 1fr)",
                            md: "repeat(3, 1fr)",
                            // lg: "repeat(3, 1fr)",
                          }}
                          gap={0.1}
                          sx={{
                            "& .MuiFormControlLabel-root": {
                              whiteSpace: "nowrap", // Prevent label wrapping
                              "& .MuiFormControlLabel-label": {
                                fontSize: "0.875rem", // Optional: Adjust font size if needed
                              },
                            },
                          }}
                        >
                          {serviceOptions?.map((option) => (
                            <Grid item key={option.value}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name={option.value}
                                    checked={
                                      selectedServices[option.value] || false
                                    }
                                    onChange={handleCheckboxChange}
                                    size="small"
                                  />
                                }
                                label={option.label}
                              />
                            </Grid>
                          ))}
                        </Box>
                      </FormGroup>
                    </Grid>

                    {/* Vertical Divider */}

                    {/* Occupied Rooms Filter */}
                    {/* <Typography fontSize={15} fontWeight="bold" gutterBottom>
                      Occupied Rooms & Extended Stay Filter
                    </Typography> */}
                    <Grid
                      item
                      md={6}
                      xs={12}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={removeOccupied}
                            onChange={handleRemoveOccupiedChange}
                            size="small"
                          />
                        }
                        label="Remove Occupied"
                        sx={{
                          whiteSpace: "nowrap",
                          "& .MuiFormControlLabel-label": {
                            whiteSpace: "nowrap",
                          },
                        }}
                      />

                      <TextField
                        size="small"
                        label="Extended Stay Days"
                        type="number"
                        value={extendedStayDays.toString()}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setExtendedStayDays(isNaN(value) ? 0 : value);
                        }}
                        InputProps={{
                          inputProps: {
                            min: 0,
                          },
                        }}
                        sx={{
                          width: "220px",
                        }}
                        helperText="Keep room having extended stay"
                      />

                      <PrimaryButton
                        label="Apply"
                        type="submit"
                        disabled={!removeOccupied}
                        variant="contained"
                        size="medium"
                        onClick={handleApplyFilters}
                        buttonStyles={{
                          backgroundColor: "#32A1AE",
                          color: "#FFFFFF",
                          fontWeight: "bold",
                        }}
                        sx={{
                          borderRadius: "8px",
                          width: "120px",
                          height: "40px",
                          marginLeft: 2,
                          whiteSpace: "nowrap",
                        }}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
          {assignBoard && (
            <DndProvider backend={HTML5Backend}>
              <DragAutoScroll />
              <Grid
                container
                direction="row"
                spacing={2}
                data-testid="house-keeper-boards"
              >
                {sliceRoomList.map((section, index) => {
                  const currentHousekeeper = selectedHousekeepers[index];
                  const otherBoardsHousekeepers = selectedHousekeepers.filter(
                    (id, idx) => idx !== index && id !== undefined
                  );

                  return (
                    <Grid item xs={6} key={index}>
                      <HousekeeperBoards
                        control={control}
                        rooms={section}
                        index={index}
                        onChange={handleBoardChange}
                        selectedHousekeepers={otherBoardsHousekeepers}
                        setSuccessMessage={setSuccessMessage}
                        setError={setError}
                        refetchBoard={() => { }}
                        housekeeperIdNo={currentHousekeeper}
                        onHousekeeperSelect={(housekeeperId) =>
                          handleHousekeeperSelect(index, housekeeperId)
                        }
                        onMoveAcrossBoards={handleMoveAcrossBoards}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </DndProvider>
          )}

          <Grid item xs={12} data-testid="housekeeper-list">
            {!assignBoard && (
              <HousekeeperRoomList
                roomList={roomList ?? []}
                isLoading={isLoading}
                refetch={refetch}
              />
            )}
          </Grid>

          {/* Save Button */}
          {assignBoard && (
            <Grid item xs={12}>
              <PrimaryButton
                label="Save"
                onClick={handleSubmit(onSubmit)}
                variant="contained"
                color="primary"
                sx={{ width: "10rem" }}
                isLoading={isSubmitLoading}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </>
  );
};

export default HousekeeperSections;
