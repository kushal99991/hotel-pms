import React, { useEffect, useState } from "react";
import { Stack } from "@mui/material";

import Input from "components/elements/TextInput/TextInput";
import DataTable, { Column } from "components/elements/DataTable/DataTable";
import { useRoleQuery } from "services/roleSlice";
import { Role } from "types/authTypes";

const RoleTemplateList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const {
    isLoading,
    data: roleTemplateList,
    refetch,
  } = useRoleQuery({ limit: 100, offset: 0 });

  useEffect(() => {
    refetch();
  }, []);

  const columns: Column<Role>[] = [
    {
      field: "name",
      label: "Role Name",
      align: "center",
    },
    {
      field: "description",
      label: "Descripton",
      align: "center",
    },
  ];

  // Filter the roles based on the search term
  const filteredRoles = roleTemplateList?.filter(
    (role: Role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
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
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search"
        />
      </Stack>
      <DataTable
        columns={columns}
        data={filteredRoles ?? []}
        isLoading={isLoading}
        rowsPerPageOptions={[5, 10, 25]}
        initialRowsPerPage={10}
      />
    </>
  );
};

export default RoleTemplateList;
