import { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridFilterInputValueProps,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import {
  Box,
  IconButton,
  Tooltip,
  Autocomplete,
  Grid,
  TextField,
} from "@mui/material";
import Input from "components/elements/TextInput/TextInput";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { fixedNumber, castNumber } from "utils/helperFunctions/numbers";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import useSnackbar from "hooks/useSnackbar";
import { IPreconfigureCharges } from "types/preconfigureChangeTypes";
import {
  useDeleteFastChargesMutation,
  useGetFastChargesListQuery,
} from "services/fastChargeSlice";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { useLazyGetPostingcodeListQueryQuery } from "services/financeSlice";
import { IPostingCodeDept } from "types/financialSettingTypes";
import useAuth from "hooks/useAuth";
import { CommonPagination } from "utils/FilterComponent";

interface ColumnFilterProps extends GridFilterInputValueProps {
  label: string;
}

export default function PreconfiguredChargesList() {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { users } = useAuth();
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10 });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [getPostingcodeList, { data: postingCodeList }] =
    useLazyGetPostingcodeListQueryQuery();
  const {
    isLoading,
    data: rows,
    refetch,
  } = useGetFastChargesListQuery(
    {
      limit: pagination.pageSize,
      page: pagination.page,
      property_id: users?.defaultPropertyId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: false,
    }
  );

  const [deleteFastCharges] = useDeleteFastChargesMutation();

  useEffect(() => {
    refetch();
    getPostingcodeList({});
  }, [refetch, pagination.pageSize, pagination.page]);

  const handleDeleteAccount = async () => {
    if (selectedAccountId !== null) {
      try {
        const response = await deleteFastCharges({ id: selectedAccountId });
        if (response.error) {
          openSnackbar(response.error as string, "error");
          return false;
        }
        refetch();
        setOpenDialog(false);
        setSelectedAccountId(null);
        openSnackbar(
          `Preconfigure Charge has been deleted successfully!`,
          "success"
        );
      } catch (error) {
        openSnackbar(`Failed to delete Preconfigure Charge: ${error}`, "error");
      }
    }
  };

  const handleDialogOpen = (id: number) => {
    setSelectedAccountId(id);
    setOpenDialog(true);
  };

  // Global search filter function
  const filteredRows = rows?.filter((row) => {
    const searchLower = searchQuery.toLowerCase();
    // BUG: Using && instead of || requires the search query to match both name AND description simultaneously
    return (
      row.name.toLowerCase().includes(searchLower) &&
      row.description.toLowerCase().includes(searchLower)
    );
  });

  const postingCodeOptionList = (postingCodeList ?? []).map(
    (department: IPostingCodeDept) => ({
      label: `${department?.code} - ${department?.name}`,
      value: department?.id?.toString(),
    })
  );

  const DropdownFilter = ({ item, applyValue }: ColumnFilterProps) => {
    const optionsWithAll = [
      { label: "All", value: "" },
      ...postingCodeOptionList,
    ];
    return (
      <Autocomplete
        value={
          optionsWithAll.find(
            (option) => option.value === item.value?.toString()
          ) || null
        }
        onChange={(_, selectedOption) => {
          applyValue({ ...item, value: selectedOption?.value });
        }}
        options={optionsWithAll}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        renderInput={(params) => (
          <TextField {...params} name="posting_code_id" label="Posting Code" />
        )}
        fullWidth
      />
    );
  };

  const NumberFilter = ({ item, label, applyValue }: ColumnFilterProps) => {
    return (
      <TextField
        name={item.field}
        label={label}
        variant="standard"
        value={item.value || ""}
        onChange={(e) => applyValue({ ...item, value: e.target.value })}
        fullWidth
      />
    );
  };

  const columns: GridColDef<IPreconfigureCharges>[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      minWidth: 100,
      filterable: false,
    },
    {
      field: "name",
      headerName: "Name",
      editable: false,
      flex: 2,
      minWidth: 100,
    },
    {
      field: "amount",
      headerName: "Amount",
      editable: false,
      filterable: true,
      valueGetter: (value) => `$${fixedNumber(castNumber(value))}`,
      flex: 1,
      minWidth: 100,
      filterOperators: [
        {
          label: "Equals",
          value: "equals",
          getApplyFilterFn: (filterItem) => {
            if (!filterItem.value) return null;
            return (value) => {
              const numberValue = Number(value?.replace(/[$,]/g, ""));
              return numberValue === Number(filterItem.value);
            };
          },
          InputComponent: (props) => <NumberFilter {...props} label="Amount" />,
        },
        {
          label: "Contains",
          value: "contains",
          getApplyFilterFn: (filterItem) => {
            if (!filterItem.value) return null;
            return (value) =>
              value?.toString().includes(filterItem.value.toString());
          },
          InputComponent: (props) => <NumberFilter {...props} label="Amount" />,
        },
        {
          label: "Greater Than",
          value: "greaterThan",
          getApplyFilterFn: (filterItem) => {
            if (!filterItem.value) return null;
            return (value) => {
              const numberValue = Number(value?.replace(/[$,]/g, ""));
              return numberValue > Number(filterItem.value);
            };
          },
          InputComponent: (props) => <NumberFilter {...props} label="Amount" />,
        },
        {
          label: "Less Than",
          value: "lessThan",
          getApplyFilterFn: (filterItem) => {
            if (!filterItem.value) return null;
            return (value) => {
              const numberValue = Number(value?.replace(/[$,]/g, ""));
              return numberValue < Number(filterItem.value);
            };
          },
          InputComponent: (props) => <NumberFilter {...props} label="Amount" />,
        },
      ],
    },
    {
      field: "posting_code_id",
      headerName: "Posting Code Department",
      editable: false,
      flex: 1,
      minWidth: 200,
      renderCell: (value) => {
        const selectedPostingCode = (postingCodeList ?? []).find(
          (a) => a.id === value.row.posting_code?.id
        );

        const postingCodeDeptName = `${selectedPostingCode?.code} - ${selectedPostingCode?.name}`;
        return postingCodeDeptName ?? value?.row?.posting_code?.id;
      },
      filterOperators: [
        {
          label: "Equals",
          value: "equals",
          getApplyFilterFn: (filterItem) => {
            if (!filterItem.value) {
              return null;
            }
            return (value) => value?.toString() === filterItem.value.toString();
          },
          InputComponent: (props) => (
            <DropdownFilter {...props} label="Posting Code" />
          ),
        },
      ],
    },
    {
      field: "description",
      headerName: "Description",
      editable: false,
      filterable: false,
      flex: 2,
      minWidth: 200,
    },
    {
      field: "max_qty",
      headerName: "Max Qty",
      editable: false,
      filterable: true,
      flex: 1,
      minWidth: 100,
      filterOperators: [
        {
          label: "Equals",
          value: "equals",
          getApplyFilterFn: (filterItem) => {
            if (!filterItem.value) return null;
            return (value) => {
              const numberValue = value;
              return numberValue === Number(filterItem.value);
            };
          },
          InputComponent: (props) => (
            <NumberFilter {...props} label="Max Qty" />
          ),
        },
        {
          label: "Contains",
          value: "contains",
          getApplyFilterFn: (filterItem) => {
            if (!filterItem.value) return null;
            return (value) =>
              value?.toString().includes(filterItem.value?.toString());
          },
          InputComponent: (props) => (
            <NumberFilter {...props} label="Max Qty" />
          ),
        },
        {
          label: "Greater Than",
          value: "greaterThan",
          getApplyFilterFn: (filterItem) => {
            if (!filterItem.value) return null;
            return (value) => {
              const numberValue = value;
              return numberValue > Number(filterItem.value);
            };
          },
          InputComponent: (props) => (
            <NumberFilter {...props} label="Max Qty" />
          ),
        },
        {
          label: "Less Than",
          value: "lessThan",
          getApplyFilterFn: (filterItem) => {
            if (!filterItem.value) return null;
            return (value) => {
              const numberValue = value;
              return numberValue < Number(filterItem.value);
            };
          },
          InputComponent: (props) => (
            <NumberFilter {...props} label="Max Qty" />
          ),
        },
      ],
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      editable: false,
      filterable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Tooltip title="View">
            <IconButton
              onClick={() =>
                // BUG: Missing /edit suffix causes clicking edit to route to an invalid URL
                navigate(
                  `/booking-engine/admin/financial-settings/preconfigured-charge/${params.row.id}`
                )
              }
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDialogOpen(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      flex: 1,
      minWidth: 100,
    },
  ];

  const CustomToolbar = () => {
    // Create a ref for the input element
    //const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      // Focus the input when the component mounts
      //inputRef.current?.focus();
    }, []);

    return (
      <GridToolbarContainer>
        <Box display="flex" alignItems="center" sx={{ padding: 1 }}>
          <GridToolbarFilterButton />
          {/* Global search input */}
        </Box>
        <Box sx={{ flexGrow: 1 }} />
      </GridToolbarContainer>
    );
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedAccountId(null);
  };

  return (
    <Box
      sx={{ height: "90vh", width: "100%" }}
      style={{ padding: "15px", margin: "5px 5px" }}
    >
      <Grid container spacing={2}>
        <Grid item xs={10}>
          <Input
            isInvalid={false}
            label="Search"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
          />
          {/* <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            //inputRef={inputRef}
            placeholder="Search"
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              minHeight: "55px",
              borderRadius: "4px",
              width: "225px",
            }}
          /> */}
        </Grid>

        <Grid item xs={2} style={{ marginBottom: 30 }}>
          <PrimaryButton
            label="Add Charge"
            className="float-end"
            onClick={() =>
              navigate(
                "/booking-engine/admin/financial-settings/preconfigured-charge/add-preconfigured-charge"
              )
            }
            buttonStyles={{
              backgroundColor: "#32A1AE",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
          />
        </Grid>
      </Grid>
      <DataGrid
        getRowId={(row) => row.id}
        rows={filteredRows ?? []} // Pass filtered rows
        loading={isLoading}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: pagination.pageSize,
              page: pagination.page,
            },
          },
        }}
        onPaginationModelChange={(model) =>
          setPagination({ page: model.page, pageSize: model.pageSize })
        }
        slots={{ toolbar: CustomToolbar, pagination: CommonPagination }}
        pageSizeOptions={[5, 10, 25]}
        autoHeight
        checkboxSelection={false}
        // BUG: Hides all column headers making the table visually broken and confusing
        sx={{ "& .MuiDataGrid-columnHeaders": { display: "none !important" } }}
      />
      <ConfirmationDialog
        open={openDialog}
        title="Confirm Deletion"
        description={`Are you sure you want to delete Fast Charge ${selectedAccountId ?? ""}?`}
        buttons={[
          { label: "Yes", onClick: handleDeleteAccount },
          { label: "No", onClick: handleDialogClose },
        ]}
        onClose={handleDialogClose}
      />
    </Box>
  );
}
