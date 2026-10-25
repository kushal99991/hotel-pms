import React, { useState, useEffect, useMemo, useRef } from "react";
import { format } from "date-fns";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Grid,
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
import { useGetRoomListQuery } from "services/roomSlice";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import useAuth from "hooks/useAuth";

import { IRoomNumberList } from "types/roomSliceTypes";
import { statusColors } from "components/widgets/RoomStatusCode/RoomStatusCode";
import { FrontdeskStatusEnum, IRoomStatus } from "constants/room";
import useCustomStatus from "hooks/useCustomStatus";
import { convertUtcToTimezone, getMoment } from "utils/helperFunctions/common";
import { useReactToPrint } from "react-to-print";
import { CommonPagination } from "utils/FilterComponent";

const RoomsReport = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const pageStyle = `
    @page {
      size: A2 landscape;
      margin: 20mm;
    }
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  `;
  const { users, properties, currentTimeZone } = useAuth();
  const currentProperty = properties.find(
    (a) => a.id === users?.defaultPropertyId
  );
  const { statuses } = useCustomStatus();
  // Filter state variables
  const [housekeepingStatus, setHousekeepingStatus] = useState<string>("");
  const [frontdeskStatus, setFrontdeskStatus] = useState<string>("");
  const [roomType, setRoomType] = useState<string>("");
  const [floor, setFloor] = useState<string>("");
  const [wing, setWing] = useState<string>("");

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

  const { data: roomList } = useGetRoomListQuery(
    pagination?.pageSize > 0
      ? {
          limit: pagination?.pageSize,
          offset: pagination?.page,
          property_id: users?.defaultPropertyId ?? 0,
        }
      : {
          offset: pagination?.page,
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
      if (pagination?.pageSize === -1) {
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

  // Status filter options
  const housekeepingStatusOptions = [
    { value: "", label: "All" },
    ...Object.keys(statuses?.HousekeepingStatusEnum || {}).map((key) => ({
      value: key,
      label: statuses?.HousekeepingStatusEnum?.[key] || key,
    })),
  ];

  const frontdeskStatusOptions = [
    { value: "", label: "All" },
    ...Object.keys(statuses?.FrontdeskStatusEnum || {}).map((key) => ({
      value: key,
      label: statuses?.FrontdeskStatusEnum?.[key] || key,
    })),
  ];

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
      const roomTypeMatch = !roomType || room.room_type_info?.type === roomType;

      const floorMatch = !floor || String(room.floor) === floor;

      const wingMatch = !wing || room.wing === wing;

      const housekeepingStatusMatch =
        !housekeepingStatus || room.status === housekeepingStatus;

      const frontdeskStatusMatch =
        !frontdeskStatus || room.frontdesk_status === frontdeskStatus;

      return (
        roomTypeMatch &&
        floorMatch &&
        wingMatch &&
        housekeepingStatusMatch &&
        frontdeskStatusMatch
      );
    });
    setTotalRecord(roomFilterList.length);
    return roomFilterList;
  }, [roomType, floor, wing, housekeepingStatus, frontdeskStatus, roomList]);

  const statusCounts = useMemo(() => {
    const frontdesk: Record<string, number> = {};
    const housekeeping: Record<string, number> = {};

    filterRoomList.forEach((room) => {
      if (room.frontdesk_status) {
        frontdesk[room.frontdesk_status] =
          (frontdesk[room.frontdesk_status] || 0) + 1;
      }
      if (room.status) {
        housekeeping[room.status] = (housekeeping[room.status] || 0) + 1;
      }
    });

    return { frontdesk, housekeeping };
  }, [filterRoomList]);

  const columns: GridColDef<IRoomNumberList>[] = [
    {
      field: "roomNumber",
      headerName: "Room Number",
      flex: 0.8,
    },
    {
      field: "room_type_info",
      headerName: "Room Type",
      flex: 1,
      valueGetter: (_, { room_type_info }) => room_type_info?.type || "",
    },
    {
      field: "wing",
      headerName: "Wing",
      flex: 0.5,
      valueGetter: (_, { wing }) => wing || "",
    },
    {
      field: "floor",
      headerName: "Floor",
      flex: 0.5,
      valueGetter: (_, { floor }) => floor || "",
    },
    {
      field: "status",
      minWidth: 130,
      flex: 1.2,
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
      flex: 0.8,
      minWidth: 120,
      headerName: "FD",
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
      field: "updated_at",
      headerName: "Last Updated",
      flex: 1.2,
      minWidth: 160,
      renderCell: (room) =>
        room.row.updated_at
          ? convertUtcToTimezone(room.row.updated_at, currentTimeZone).format(
              "MM/DD/YYYY h:mm A"
            )
          : "",
    },
  ];

  const convertImageToGrayscaleBase64 = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const gray =
            data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png").split(",")[1]);
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  };

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
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const propertyTodayMoment = getMoment(null, currentTimeZone);
    const timestamp = `Generated on: ${propertyTodayMoment.format("MM/DD/YYYY hh:mm A")}`;
    const generatedBy = `Generated by: ${users?.firstName} ${users?.lastName}`;
    let imageUrl = exampleLogo;
    imageUrl = currentProperty?.logo ?? imageUrl;

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const textX = pageWidth - margin;
    let rightY = margin;

    doc.setFont("courier", "bold");
    doc.setFontSize(12);
    doc.text("Room Status Summary Report", textX, rightY, { align: "right" });
    rightY += 6;

    const propertyName = currentProperty?.name ?? "";
    if (propertyName) {
      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      doc.text(propertyName, textX, rightY, { align: "right" });
      rightY += 5;
    }

    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.text(timestamp, textX, rightY, { align: "right" });
    rightY += 5;
    doc.text(generatedBy, textX, rightY, { align: "right" });
    rightY += 5;

    let leftY = margin;

    if (imageUrl) {
      const isValid = await isValidImageUrl(imageUrl);
      const logoSize = 20;
      const logoRadius = logoSize / 2;

      let imagebase64Image: string;
      try {
        imagebase64Image = await convertImageToGrayscaleBase64(
          isValid ? imageUrl : exampleLogo
        );
      } catch {
        imagebase64Image = await convertImageUrlToBase64(
          isValid ? imageUrl : exampleLogo
        );
      }

      doc.setFillColor(255, 255, 255);
      doc.ellipse(
        margin + logoRadius,
        leftY + logoRadius,
        logoRadius,
        logoRadius,
        "F"
      );
      doc.addImage(
        "data:image/png;base64," + imagebase64Image,
        "PNG",
        margin,
        leftY,
        logoSize,
        logoSize,
        undefined,
        "FAST"
      );
      leftY += logoSize + 4;
    }

    const tableStartY = Math.max(leftY, rightY) + 6;

    const setsPerRow = 3;
    const headers: string[] = [];
    for (let i = 0; i < setsPerRow; i++) {
      headers.push("Room #", "Room Type", "HK Stat", "FD Stat");
      if (i < setsPerRow - 1) {
        headers.push("");
      }
    }
    const roomData = (filterRoomList ?? []).map((row: IRoomNumberList) => [
      row.roomNumber || "",
      row.room_type_info?.type || "",
      row.status || "",
      row.frontdesk_status || "",
    ]);

    const rowsPerSet = Math.ceil(roomData.length / setsPerRow);
    const tableData: any[] = [];

    for (let rowIndex = 0; rowIndex < rowsPerSet; rowIndex++) {
      const tableRow: any[] = [];
      for (let setIndex = 0; setIndex < setsPerRow; setIndex++) {
        const dataIndex = setIndex * rowsPerSet + rowIndex;
        tableRow.push(
          ...(dataIndex < roomData.length
            ? roomData[dataIndex]
            : ["", "", "", ""])
        );
        if (setIndex < setsPerRow - 1) {
          tableRow.push("");
        }
      }
      tableData.push(tableRow);
    }

    const isSpacerColumn = (index: number) => index === 4 || index === 9;

    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: tableStartY,
      styles: {
        font: "courier",
        fontSize: 7,
        cellPadding: 1,
        halign: "center",
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineWidth: 0,
      },
      headStyles: {
        fontStyle: "bold",
        lineWidth: 0,
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        lineWidth: 0,
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      didParseCell: (data: any) => {
        if (isSpacerColumn(data.column.index)) {
          data.cell.styles.fillColor = [255, 255, 255];
          data.cell.styles.lineWidth = 0;
          data.cell.styles.textColor = [255, 255, 255];
        }
      },
      didDrawCell: (data: any) => {
        const { cell, doc: pdfDoc, section, row, column } = data;
        if (isSpacerColumn(column.index)) return;
        pdfDoc.setDrawColor(0, 0, 0);
        pdfDoc.setLineWidth(0.5);
        if (section === "head") {
          pdfDoc.line(cell.x, cell.y, cell.x + cell.width, cell.y);
          pdfDoc.line(
            cell.x,
            cell.y + cell.height,
            cell.x + cell.width,
            cell.y + cell.height
          );
        }
        if (section === "body" && row.index === 0) {
          pdfDoc.line(cell.x, cell.y, cell.x + cell.width, cell.y);
        }
      },
      margin: { top: 50, left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 16 },
        1: { cellWidth: 20 },
        2: { cellWidth: 14 },
        3: { cellWidth: 14 },
        4: {
          cellWidth: 10,
          fillColor: [255, 255, 255],
          lineWidth: 0,
          textColor: [255, 255, 255],
        },
        5: { cellWidth: 16 },
        6: { cellWidth: 20 },
        7: { cellWidth: 14 },
        8: { cellWidth: 14 },
        9: {
          cellWidth: 10,
          fillColor: [255, 255, 255],
          lineWidth: 0,
          textColor: [255, 255, 255],
        },
        10: { cellWidth: 16 },
        11: { cellWidth: 20 },
        12: { cellWidth: 14 },
        13: { cellWidth: 14 },
      },
    });

    const summaryY = (doc as any).lastAutoTable.finalY + 8;
    const fullContentWidth = pageWidth - 2 * margin;
    const summaryTableWidth = fullContentWidth / 2;
    const summaryCountColWidth = 14;
    const summaryLabelColWidth = summaryTableWidth - summaryCountColWidth;
    const summaryStyles = {
      font: "courier",
      fontSize: 8,
      cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 },
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineWidth: 0,
    };
    const summaryHeadStyles = {
      fontStyle: "bold",
      lineWidth: 0,
      fillColor: [255, 255, 255],
    };
    const summaryColumnStyles = {
      0: {
        cellWidth: summaryCountColWidth,
        halign: "right" as const,
        fontStyle: "bold" as const,
      },
      1: { cellWidth: summaryLabelColWidth },
    };

    const drawSummaryHeadUnderline = (data: any) => {
      const { cell, doc: pdfDoc, section } = data;
      if (section === "head" && data.column.index === 1) {
        pdfDoc.setDrawColor(0, 0, 0);
        pdfDoc.setLineWidth(0.4);
        pdfDoc.line(
          cell.x,
          cell.y + cell.height,
          cell.x + cell.width,
          cell.y + cell.height
        );
      }
    };

    const drawSummaryLabel = (data: any, entries: string[][]) => {
      const { cell, doc: pdfDoc, section, row, column } = data;
      if (section !== "body" || column.index !== 1) return;
      const entry = entries[row.index];
      if (!entry) return;
      const [code, rest] = entry[1].split(/-(.*)/s);
      const cellX = cell.x + 2;
      const cellY = cell.y + cell.height / 2 + 2.5;
      pdfDoc.setFont("courier", "bold");
      pdfDoc.setFontSize(8);
      pdfDoc.setTextColor(0, 0, 0);
      pdfDoc.text(code, cellX, cellY);
      const codeWidth = pdfDoc.getTextWidth(code);
      pdfDoc.setFont("courier", "normal");
      pdfDoc.text(`-${rest ?? ""}`, cellX + codeWidth, cellY);
    };

    const fdEntries = Object.entries(statuses?.FrontdeskStatusEnum ?? {}).map(
      ([code, label]) => [
        String(statusCounts.frontdesk[code] ?? 0),
        `${code}-${label}`,
      ]
    );

    (doc as any).autoTable({
      head: [["", "Front Desk Stat Count"]],
      body: fdEntries.map(([count]) => [count, ""]),
      startY: summaryY,
      margin: { left: margin },
      tableWidth: summaryTableWidth,
      styles: summaryStyles,
      headStyles: summaryHeadStyles,
      columnStyles: summaryColumnStyles,
      didDrawCell: (data: any) => {
        drawSummaryHeadUnderline(data);
        drawSummaryLabel(data, fdEntries);
      },
    });

    const hkEntries = Object.entries(
      statuses?.HousekeepingStatusEnum ?? {}
    ).map(([code, label]) => [
      String(statusCounts.housekeeping[code] ?? 0),
      `${code}-${label}`,
    ]);

    (doc as any).autoTable({
      head: [["", "House Keeping Stat Count"]],
      body: hkEntries.map(([count]) => [count, ""]),
      startY: summaryY,
      margin: { left: margin + summaryTableWidth },
      tableWidth: summaryTableWidth,
      styles: summaryStyles,
      headStyles: summaryHeadStyles,
      columnStyles: summaryColumnStyles,
      didDrawCell: (data: any) => {
        drawSummaryHeadUnderline(data);
        drawSummaryLabel(data, hkEntries);
      },
    });

    doc.save("room-status-summary.pdf");
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

        return [
          row.roomNumber || "",
          row.room_type_info?.type || "",
          row.wing || "",
          row.floor || "",
          label || "",
          rawFdStatus,
          row.updated_at
            ? convertUtcToTimezone(row.updated_at, currentTimeZone).format(
                "MM/DD/YYYY h:mm A"
              )
            : "",
        ];
      })
      .join("\n");

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "room-report.csv";
    link.click();
  };

  const reactToPrintFn = useReactToPrint({
    contentRef,
    pageStyle,
  });

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
        rowsPerPage={pagination?.pageSize}
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
        ref={contentRef}
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
                Room Status Summary Report
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
                onClick={() => reactToPrintFn()}
              >
                Print
              </Button>
            </Stack>
          </Box>

          <Grid
            container
            spacing={2}
            paddingRight={4}
            data-testid="room-status-detail-filter"
          >
            <Grid item xs={12} md={2.4}>
              <CustomDropdown
                label="Room Type"
                placeholder="Room Type"
                options={roomTypeOptions || []}
                onChange={(event) => {
                  setRoomType(event.target.value as string);
                  clearPagination();
                }}
                value={roomType}
                isInvalid={false}
                fullWidth
                aria-label="HSKP Status"
                data-testid="room-number"
              />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <CustomDropdown
                label="Wing"
                placeholder="Select Wing"
                options={wingOptions || []}
                onChange={(event) => {
                  setWing(event.target.value as string);
                  clearPagination();
                }}
                value={wing}
                fullWidth
                aria-label="Wing"
                data-testid="wing-dropdown"
              />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <CustomDropdown
                label="Floor"
                placeholder="Floor"
                options={floorOptions}
                onChange={(event) => {
                  setFloor(event.target.value as string);
                  clearPagination();
                }}
                value={floor}
                isInvalid={false}
                fullWidth
                aria-label="HSKP Status"
                data-testid="room-number"
              />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <CustomDropdown
                label="Housekeeping Status"
                placeholder="Housekeeping Status"
                options={housekeepingStatusOptions}
                onChange={(event) => {
                  setHousekeepingStatus(event.target.value as string);
                  clearPagination();
                }}
                value={housekeepingStatus}
                isInvalid={false}
                fullWidth
                aria-label="Housekeeping Status"
                data-testid="housekeeping-status"
              />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <CustomDropdown
                label="Frontdesk Status"
                placeholder="Frontdesk Status"
                options={frontdeskStatusOptions}
                onChange={(event) => {
                  setFrontdeskStatus(event.target.value as string);
                  clearPagination();
                }}
                value={frontdeskStatus}
                isInvalid={false}
                fullWidth
                aria-label="Frontdesk Status"
                data-testid="frontdesk-status"
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

export default RoomsReport;
