import React, {
  useEffect,
  useState,
  useMemo,
  MouseEvent as ReactMouseEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Link,
  Stack,
  styled,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";
import {
  useGetTaxListQuery,
  useDeleteTaxByidMutation,
} from "services/financeSlice";
import { ITaxTypes } from "types/financialSettingTypes";
import Input from "components/elements/TextInput/TextInput";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import useAuth from "hooks/useAuth";
import { appConfig } from "config/app.config";
import { getMoment } from "utils/helperFunctions/common";
import { CommonPagination } from "utils/FilterComponent";

const TaxList: React.FC = () => {
  const { users, currentTimeZone } = useAuth();
  const navigate = useNavigate();
  const {
    isLoading,
    data: taxList,
    refetch,
  } = useGetTaxListQuery({
    property_id: users?.defaultPropertyId ?? 1,
  });
  const [deleteTaxByid] = useDeleteTaxByidMutation();
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTaxId, setSelectedTaxId] = useState<number | null>(null);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const filteredTaxes = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return (
      taxList?.filter((tax) => {
        return (
          tax?.name?.toLowerCase().includes(term) ||
          tax?.rate?.toLowerCase().includes(term) ||
          tax?.description?.toLowerCase().includes(term)
        );
      }) ?? []
    );
  }, [searchTerm, taxList]);

  function handleDeleteClick(
    params: GridRenderCellParams<ITaxTypes, any, any, GridTreeNodeWithRender>
  ) {
    return (evt: ReactMouseEvent) => {
      evt.stopPropagation();
      handleDialogOpen(params.row?.id ?? 0);
    };
  }

  const handleDelete = async () => {
    if (selectedTaxId === null) return;

    setErrorMessage("");
    const response = await deleteTaxByid({ id: selectedTaxId });
    if (response.error) {
      setErrorMessage(response.error.message || "Failed to Delete Tax");
    } else {
      refetch();
    }
    setOpenDialog(false);
    setSelectedTaxId(null);
  };

  const handleDialogOpen = (id: number) => {
    setSelectedTaxId(id);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedTaxId(null);
  };

  const handleRowClick = (params: GridRowParams) => {
    navigate(`/booking-engine/admin/financial-settings/${params.row.id}`);
  };

  const columns: GridColDef<ITaxTypes>[] = [
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "rate",
      headerName: "Rate",
      flex: 1,
      renderCell: (params) => {
        const versions = (params.row?.versions ?? []) as any[];
        const today = getMoment(null, currentTimeZone).format(
          appConfig.dateApiFormat
        );
        const latestNonFutureVersion =
          versions
            .filter((v) => v && v.starts_from && String(v.starts_from) <= today)
            .sort((a, b) =>
              String(a.starts_from).localeCompare(String(b.starts_from))
            )
            .at(-1) ?? null;
        return latestNonFutureVersion?.rate ?? "-";
      },
    },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "starts_from",
      headerName: "Start Date",
      flex: 1,
      renderCell: (params) => {
        const versions = (params.row?.versions ?? []) as any[];
        const today = getMoment(null, currentTimeZone).format(
          appConfig.dateApiFormat
        );
        const latestNonFutureVersion =
          versions
            .filter((v) => v && v.starts_from && String(v.starts_from) <= today)
            .sort((a, b) =>
              String(a.starts_from).localeCompare(String(b.starts_from))
            )
            .at(-1) ?? null;
        return latestNonFutureVersion?.starts_from ?? "-";
      },
    },
    { field: "type", headerName: "Type", flex: 1 },
    {
      field: "active",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.row.active ? "Active" : "Inactive"}
          color={params.row.active ? "success" : "default"}
          size="small"
          sx={{
            fontWeight: 600,
            borderRadius: "8px",
            backgroundColor: params.row.active ? "#E6F4EA" : "#F5F5F5",
            color: params.row.active ? "#2E7D32" : "#616161",
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      sortable: false,
      flex: 1,
      renderCell: (params) => (
        <>
          <Link
            href={`/booking-engine/admin/financial-settings/${params.row.id}`}
          >
            <IconButton aria-label="edit" color="primary">
              <EditIcon />
            </IconButton>
          </Link>
          <IconButton
            onClick={handleDeleteClick(params)}
            aria-label="delete"
            color="primary"
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <MainWrapper>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}
      <Stack
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        pb={3}
      >
        <Input
          isInvalid={false}
          label="Search"
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search"
        />
        <Link href="/booking-engine/admin/financial-settings/tax/add">
          <PrimaryButton
            buttonStyles={{
              backgroundColor: "#32A1AE",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
            label="Add TAX/FEE"
            isLoading={isLoading}
          />
        </Link>
      </Stack>
      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={filteredTaxes}
          columns={columns}
          loading={isLoading}
          autoHeight
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          onRowClick={handleRowClick}
          rowSelection={false}
          slots={{ pagination: CommonPagination }}
          sx={{
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },

            "& .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
            "& .MuiDataGrid-row:hover": {
              cursor: "pointer",
            },
          }}
        />
      </Box>
      <ConfirmationDialog
        open={openDialog}
        title="Confirm Deletion"
        description="Are you sure you want to delete this Tax?"
        buttons={[
          { label: "No", onClick: handleDialogClose },
          {
            label: "Yes",
            onClick: handleDelete,
            color: "secondary",
            variant: "contained",
          },
        ]}
        onClose={handleDialogClose}
      />
    </MainWrapper>
  );
};

export default TaxList;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  margin: "5px 5px",
}));
