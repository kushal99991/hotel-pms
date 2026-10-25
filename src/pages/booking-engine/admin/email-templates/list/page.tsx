import React, { useEffect } from "react";
import { Box, IconButton, Link, Stack, styled } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import { useGetEmailTemplateListQuery } from "services/emailTemplateSlice";
import { EmailTemplate } from "types/emailTemplateTypes";
import Input from "components/elements/TextInput/TextInput";
import DataTable, { Column } from "components/elements/DataTable/DataTable";
import PrimaryButton from "components/elements/Button/PrimaryButton";

const EmailTemplateTable: React.FC = () => {
  const {
    isLoading,
    data: emailTemplateList,
    refetch,
  } = useGetEmailTemplateListQuery();

  useEffect(() => {
    refetch();
  }, []);

  const columns: Column<EmailTemplate>[] = [
    {
      field: "name",
      label: "Template Name",
      align: "center",
    },
    {
      field: "category",
      label: "Category",
      align: "center",
    },
    {
      field: "subject",
      label: "Subject",
    },
    {
      field: "createdBy",
      label: "Created By",
    },
    {
      field: "id",
      label: "Action",
      renderCell: (value: EmailTemplate) => {
        return (
          <>
            <Link href={`/booking-engine/admin/email-templates/${value.id}`}>
              <IconButton aria-label="edit" color="primary">
                <EditIcon />
              </IconButton>
            </Link>
          </>
        );
      },
    },
  ];

  return (
    <MainWrapper>
      <Stack
        flexDirection="row"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        pb={3}
      >
        <Input
          isInvalid={false}
          label="Search"
          onChange={() => {}}
          placeholder="Search"
        />
        <Link href="/booking-engine/admin/email-templates/add">
          <PrimaryButton
            buttonStyles={{
              backgroundColor: "#32A1AE",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
            label="Add Template"
            isLoading={isLoading}
          />
        </Link>
      </Stack>
      <DataTable
        columns={columns}
        data={emailTemplateList ?? []}
        isLoading={isLoading}
        rowsPerPageOptions={[5, 10, 25]}
        initialRowsPerPage={10}
      />
    </MainWrapper>
  );
};

export default EmailTemplateTable;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  margin: "15px 10px",
}));
