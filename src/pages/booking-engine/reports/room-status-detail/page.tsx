import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Grid,
  Chip,
  TablePagination,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Download, PrintOutlined } from "@mui/icons-material";
import { FaTable } from "react-icons/fa";
import exampleLogo from "assets/images/logo.png";

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useGetReservationListQuery } from "services/reservationSlice";
import { IReservationFilter } from "types/reservationTypes";
import { useGetRoomListQuery } from "services/roomSlice";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import useAuth from "hooks/useAuth";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { IRoomNumberList } from "types/roomSliceTypes";
import {
  reservationStatusDisplayValues,
  ReservationStatusEnum,
} from "constants/reservation";
import { statusColors } from "components/widgets/RoomStatusCode/RoomStatusCode";
import { FrontdeskStatusEnum, IRoomStatus } from "constants/room";
import useCustomStatus from "hooks/useCustomStatus";
import { CommonPagination } from "utils/FilterComponent";

const RoomStatusDetailReport = () => {
  const { users, properties } = useAuth();
  const currentProperty = properties.find(
    (a) => a.id === users?.defaultPropertyId
  );
  const { statuses } = useCustomStatus();
  const [filters, setFilters] = useState<IReservationFilter>({
    floor: "",
    room_type: "",
    wing: "",
    start_date: "",
    end_date: "",
    property_id: users?.defaultPropertyId ?? 0,
    reservation_status: null,
  });
  const [totalRecord, setTotalRecord] = useState<number>(0);
  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
  }>({
    page: 0,
    pageSize: -1,
  });

  const [wingOptions, setWingOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [floorOptions, setFloorOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const {
    data: reservationList,
    isFetching,
    isLoading,
  } = useGetReservationListQuery(filters, {
    skip: false,
    refetchOnMountOrArgChange: true,
  });

  const { data: roomList } = useGetRoomListQuery(
    pagination.pageSize > 0
      ? {
          limit: pagination.pageSize,
          offset: pagination.page,
          property_id: users?.defaultPropertyId ?? 0,
        }
      : {
          offset: pagination.page,
          property_id: users?.defaultPropertyId ?? 0,
        }
  );
  const [getRoomTypeByPropertyId, { data: roomTypeList }] =
    useGetRoomTypeByPropertyIdMutation();

  useEffect(() => {
    getRoomTypeByPropertyId({
      propertyId: users?.defaultPropertyId ?? 1,
    });
  }, [users?.defaultPropertyId]);

  const roomTypeOptions = [
    { label: "All", value: "" },
    ...(roomTypeList ?? []).map((room) => ({
      label: room.type,
      value: room.type,
    })),
  ];

  useEffect(() => {
    // Gather unique floors from roomList
    if (roomList?.length) {
      const uniqueFloors = Array.from(
        new Set(roomList.map((room) => String(room.floor)))
      ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      const floorDropdownOptions = uniqueFloors.map((floor) => ({
        value: floor,
        label: floor,
      }));

      // Set the floor options with "All" included
      setFloorOptions([{ value: "", label: "All" }, ...floorDropdownOptions]);

      const uniqueWings = Array.from(
        new Set(
          roomList
            .map((room) => room.wing)
            .filter((wing): wing is string => !!wing)
        ) // Filter out undefined values
      ).sort();

      const wingDropdownOptions = uniqueWings.map((wing) => ({
        value: wing,
        label: wing,
      }));
      if (pagination.pageSize === -1) {
        setTotalRecord(roomList?.length ?? 0);
      }

      // Set the wing options with "All" included
      setWingOptions([{ value: "", label: "All" }, ...wingDropdownOptions]);
    }
  }, [roomList]);

  const clearPagination = () => {
    setPagination({
      page: 0,
      pageSize: -1,
    });
  };

  // Handle start date change
  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setFilters((prev) => ({
        ...prev,
        start_date: date.format("YYYY-MM-DD"),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        start_date: "",
      }));
    }
    clearPagination();
  };

  // Handle end date change
  const handleEndDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setFilters((prev) => ({
        ...prev,
        end_date: date.format("YYYY-MM-DD"),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        end_date: "",
      }));
    }
    clearPagination();
  };

  const getHouseKeepingStatus = (
    fdStatus: keyof typeof FrontdeskStatusEnum,
    hkStatus: string
  ) => {
    switch (fdStatus) {
      case "OCC":
        return [...new Set([hkStatus, "OD", "OC", "IP"])] as IRoomStatus[];
      case "VAC":
        return [
          ...new Set([hkStatus, "VD", "VC", "VCI", "PUP", "IP"]),
        ] as IRoomStatus[];
      case "OOO":
        return [...new Set([hkStatus, "VD", "VC", "PUP"])] as IRoomStatus[];
      case "OOS":
        return [...new Set([hkStatus, "VD", "VC", "PUP"])] as IRoomStatus[];
      default:
        return Object.keys(
          statuses?.HousekeepingStatusEnum || {}
        ) as IRoomStatus[];
    }
  };

  const filterRoomList = useMemo(() => {
    const roomsToDisplay = roomList ?? [];

    const roomFilterList = roomsToDisplay.filter((room) => {
      const roomTypeMatch =
        !filters.room_type || room.room_type_info?.type === filters.room_type;

      const floorMatch = !filters.floor || room.floor === filters.floor;

      const wingMatch = !filters.wing || room.wing === filters.wing;

      return roomTypeMatch && floorMatch && wingMatch;
    });
    setTotalRecord(roomFilterList.length);
    return roomFilterList;
  }, [filters, roomList]);

  const columns: GridColDef<IRoomNumberList>[] = [
    {
      field: "roomNumber",
      headerName: "Room Number",
      flex: 1,
    },
    {
      field: "room_type_info",
      headerName: "Room Type",
      flex: 1,
      valueGetter: (_, { room_type_info }) => room_type_info?.type || "",
    },
    {
      field: "status",
      minWidth: 130,
      flex: 1,
      headerName: "HK",
      renderCell: (value) => {
        const statusList = getHouseKeepingStatus(
          value.row.frontdesk_status as keyof typeof FrontdeskStatusEnum,
          value.row.status
        );
        const rawStatus = statusList.find(
          (status) => status === value.row.status
        );
        const { color, label } = statusColors[rawStatus as IRoomStatus] || {
          color: "black",
          label: rawStatus,
        };
        return (
          <Typography
            component="span"
            style={{ color: color, textAlign: "center", fontWeight: "bold" }}
          >
            {label}
          </Typography>
        );
      },
    },
    {
      field: "frontdesk_status",
      flex: 1,
      headerName: "FD",
      align: "center",
      renderCell: (value) => {
        const rawStatus = value.row.frontdesk_status;
        const { color, label } = statusColors[rawStatus as IRoomStatus] || {
          color: "black",
          label: rawStatus,
        };
        return (
          <Typography
            component="span"
            style={{ color: color, textAlign: "center", fontWeight: "bold" }}
          >
            {label}
          </Typography>
        );
      },
    },
    {
      field: "room_type_info.id",
      headerName: "Reservation Status",
      minWidth: 180,
      renderCell: (value) => {
        const currentResevation = (reservationList ?? []).find(
          (a) => a?.current_room_info?.room_number === value.row.roomNumber
        );
        if (currentResevation?.status) {
          const rawStatus = currentResevation.status;
          const displayInfo = reservationStatusDisplayValues[rawStatus];
          return (
            <Chip
              label={displayInfo?.label ?? rawStatus}
              size="small"
              sx={{
                backgroundColor: displayInfo?.color,
                color: displayInfo?.contrastColor,
              }}
            ></Chip>
          );
        }

        return `Not Assign`;
      },
      flex: 1,
    },
    {
      field: "room_type.typeDescription",
      headerName: "Room Type Details",
      minWidth: 180,
      flex: 1,
      valueGetter: (_, { room_type_info }) => room_type_info?.name || "",
    },
    {
      field: "room_type.name",
      headerName: "Notes",
    },
  ];

  const convertImageUrlToBase64 = (imageUrl: string): Promise<string> => {
    return fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      })
      .catch(() => {
        /** empty catch error */
        throw new Error("Failed to load image");
      });
  };

  async function isValidImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return (
        response.ok &&
        /image\/*/.test(response.headers.get("Content-Type") ?? "")
      );
    } catch {
      return false;
    }
  }

  const exportPDF = async () => {
    const doc = new jsPDF();
    const title = "Room Status Detail Report";
    const subtitle =
      filters.start_date && filters.end_date
        ? `Period: ${format(new Date(filters.start_date), "MM/dd/yyyy")} to ${format(new Date(filters.end_date), "MM/dd/yyyy")}`
        : filters.start_date
          ? `Period: From ${format(new Date(filters.start_date), "MM/dd/yyyy")}`
          : filters.end_date
            ? `Period: Until ${format(new Date(filters.end_date), "MM/dd/yyyy")}`
            : "Period: ";

    const timestamp = `Generated on: ${format(new Date(), "PPpp")}`;
    const generatedBy = `Generator By : ${users?.firstName} ${users?.lastName}`;
    let imageUrl = exampleLogo;
    imageUrl = currentProperty?.logo ?? imageUrl;

    // Extract the file extension from the image URL
    if (imageUrl) {
      const isValid = await isValidImageUrl(imageUrl);

      const x = 10;
      const y = 10;
      const size = 40;
      const radius = size / 2;
      let imagebase64Image = await convertImageUrlToBase64(exampleLogo);
      let imageExtension = "PNG";
      if (isValid) {
        const base64Image = await convertImageUrlToBase64(imageUrl);
        const extension = imageUrl?.split(".")?.pop()?.toLowerCase() ?? "PNG";

        if (extension.toUpperCase() !== "AVIF") {
          imagebase64Image = base64Image;
          imageExtension = extension.toUpperCase();
        }
      }
      doc.setFillColor(255, 255, 255);
      doc.ellipse(x + radius, y + radius, radius, radius, "F");
      doc.addImage(
        "data:image/png;base64," + imagebase64Image,
        imageExtension,
        x,
        y,
        size,
        size,
        undefined,
        "FAST"
      );
    }

    // Add title and subtitle
    const textX = 120;
    let textY = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, textX, textY);
    textY += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(subtitle, textX, textY);
    textY += 7;
    doc.text(timestamp, textX, textY);
    textY += 7;

    doc.text(generatedBy, textX, textY);
    textY += 30;

    // Table headers and data
    const headers = [
      "Room Number",
      "Room Type",
      "HK",
      "FD",
      "Reservation Status",
      "Room Type Detail",
      "Notes",
    ]; // Essential columns
    const tableData = (filterRoomList ?? []).map((row: IRoomNumberList) => {
      // HK Status Update
      const statusList = getHouseKeepingStatus(
        row.frontdesk_status as keyof typeof FrontdeskStatusEnum,
        row.status
      );
      const rawStatus = statusList.find((status) => status === row.status);
      const { label } = statusColors[rawStatus as IRoomStatus] || {
        color: "black",
        label: rawStatus,
      };

      // FD Status Update
      const rawFdStatus = row.frontdesk_status;

      // Reservation Status Update
      let reservationStatus = "Not Assign";
      const currentResevation = (reservationList ?? []).find(
        (a) => a?.current_room_info?.room_number === row.roomNumber
      );
      if (currentResevation?.status) {
        const rawStatus = currentResevation.status;
        const displayInfo = reservationStatusDisplayValues[rawStatus];
        reservationStatus = displayInfo?.label ?? rawStatus;
      }
      return [
        row.roomNumber || "",
        row.room_type_info?.type || "",
        label || "",
        rawFdStatus,
        reservationStatus,
        row.room_type_info?.name || "",
        ``,
      ];
    });

    // Add table to the PDF
    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: textY,
      styles: { fontSize: 8 },
      margin: { top: 50 },
    });

    // Save the file
    doc.save("housekeeping-room-status.pdf");
  };

  const exportExcel = () => {
    const headers = columns.map((col) => col.headerName).join(",");

    const rows = (filterRoomList ?? [])
      .map((row: IRoomNumberList) => {
        // HK Status Update
        const statusList = getHouseKeepingStatus(
          row.frontdesk_status as keyof typeof FrontdeskStatusEnum,
          row.status
        );
        const rawStatus = statusList.find((status) => status === row.status);
        const { label } = statusColors[rawStatus as IRoomStatus] || {
          color: "black",
          label: rawStatus,
        };

        // FD Status Update
        const rawFdStatus = row.frontdesk_status;

        // Reservation Status Update
        let reservationStatus = "Not Assign";
        const currentResevation = (reservationList ?? []).find(
          (a) => a?.current_room_info?.room_number === row.roomNumber
        );
        if (currentResevation?.status) {
          const rawStatus = currentResevation.status;
          const displayInfo = reservationStatusDisplayValues[rawStatus];
          reservationStatus = displayInfo?.label ?? rawStatus;
        }
        return [
          row.roomNumber || "",
          row.room_type_info?.type || "",
          label || "",
          rawFdStatus,
          reservationStatus,
          row.room_type_info?.name || "",
          ``,
        ];
      })
      .join("\n");

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "housekeeping-room-status.csv";
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const reservationStatusOptions = [
    { label: "All", value: "ALL" },
    ...Object.values(ReservationStatusEnum)
      .filter((status) => !["DEPARTED", "ARRIVAL", "in_house"].includes(status))
      .map((status) => ({
        label: status.replace(/_/g, " "),
        value: status,
      })),
  ];

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarFilterButton />
      </GridToolbarContainer>
    );
  };

  const CustomFooter = () => {
    return (
      <TablePagination
        component="div"
        count={totalRecord}
        page={pagination.page}
        showFirstButton
        onPageChange={(_, newPage) =>
          setPagination({ ...pagination, page: newPage })
        }
        rowsPerPage={pagination.pageSize}
        rowsPerPageOptions={[{ label: "All", value: -1 }, 10, 25, 50, 100, 500]}
        onRowsPerPageChange={(
          event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
          setPagination({
            ...pagination,
            pageSize: parseInt(event.target.value, 10),
            page: 0,
          });
        }}
        color="primary"
        sx={{ marginTop: 2, display: "flex", justifyContent: "flex-end" }}
      />
    );
  };

  return (
    <Box
      sx={{
        "@media print": {
          margin: 0,
          padding: "20px",
        },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          "@media print": {
            boxShadow: "none",
          },
        }}
      >
        <Stack spacing={3}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                {filters.start_date && filters.end_date
                  ? `Period: ${format(new Date(filters.start_date), "MM/dd/yyyy")} to ${format(new Date(filters.end_date), "MM/dd/yyyy")}`
                  : filters.start_date
                    ? `Period: From ${format(new Date(filters.start_date), "MM/dd/yyyy")}`
                    : filters.end_date
                      ? `Period: Until ${format(new Date(filters.end_date), "MM/dd/yyyy")}`
                      : "Period: "}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Generated on: {format(new Date(), "PPpp")}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={2}
              sx={{
                "@media print": {
                  display: "none",
                },
              }}
            >
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={exportPDF}
              >
                Export PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<FaTable />}
                onClick={exportExcel}
              >
                Export Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintOutlined />}
                onClick={handlePrint}
              >
                Print
              </Button>
            </Stack>
          </Box>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid
              container
              spacing={2}
              paddingRight={4}
              data-testid="room-status-detail-date-filter"
            >
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={filters.start_date ? dayjs(filters.start_date) : null}
                  onChange={handleStartDateChange}
                  maxDate={
                    filters.end_date ? dayjs(filters.end_date) : undefined
                  }
                  format="YYYY-MM-DD"
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "Start Date",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={filters.end_date ? dayjs(filters.end_date) : null}
                  onChange={handleEndDateChange}
                  format="YYYY-MM-DD"
                  minDate={
                    filters.start_date ? dayjs(filters.start_date) : undefined
                  }
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
          <Grid
            container
            spacing={2}
            paddingRight={4}
            data-testid="room-status-detail-filter"
          >
            <Grid item xs={12} md={3}>
              <CustomDropdown
                label="Room Type"
                placeholder="Room Type"
                options={roomTypeOptions || []}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    room_type: event.target.value as string,
                  }));
                  clearPagination();
                }}
                value={filters?.room_type}
                isInvalid={false}
                fullWidth
                aria-label="HSKP Status"
                data-testid="room-number"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <CustomDropdown
                label="Wing"
                placeholder="Select Wing"
                options={wingOptions || []}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    wing: event.target.value as string,
                  }));
                  clearPagination();
                }}
                value={filters?.wing}
                fullWidth
                aria-label="Wing"
                data-testid="wing-dropdown"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <CustomDropdown
                label="Floor"
                placeholder="Floor"
                options={floorOptions}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    floor: event.target.value as string,
                  }));
                  clearPagination();
                }}
                value={filters?.floor}
                isInvalid={false}
                fullWidth
                aria-label="HSKP Status"
                data-testid="room-number"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <CustomDropdown
                label="Reservation Status"
                placeholder="Reservation Status"
                options={reservationStatusOptions}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    reservation_status: event.target.value as string,
                  }));
                  clearPagination();
                }}
                value={filters?.reservation_status}
                isInvalid={false}
                fullWidth
                aria-label="Reservation Status"
                data-testid="reservation-status"
              />
            </Grid>
          </Grid>

          <Box data-testid="room-status-detail-datatable">
            <DataGrid
              rows={filterRoomList}
              columns={columns}
              initialState={{
                sorting: {
                  sortModel: [{ field: "arrivalDate", sort: "asc" }],
                },
              }}
              slots={{
                toolbar: CustomToolbar,
                footer: CustomFooter,
                pagination: CommonPagination,
              }}
              loading={isFetching || isLoading}
              autoHeight
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  fontWeight: "bold",
                  fontSize: 17,
                },
              }}
            />
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default RoomStatusDetailReport;
