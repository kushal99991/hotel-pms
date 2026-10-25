import React, { useEffect, useState } from "react";
import { Box, Stack, styled } from "@mui/material";

import DataTable, { Column } from "components/elements/DataTable/DataTable";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { useGetNightAuditListQuery } from "services/nightAuditSlice";
import useAuth from "hooks/useAuth";
import { INightAuditResponse } from "types/nightAuditTypes";
import Modal from "components/widgets/ModalWindows/Modal";
import AuditHeader from "../add/component/AuditHeader";
import { useDispatch } from "react-redux";
import { saveNightAudit } from "store/slice/nightAuditStateSlice";
import { convertUtcToTimezone } from "utils/helperFunctions/common";
import { appConfig } from "config/app.config";

const NightAuditTable: React.FC = () => {
  const Navigate = useNavigate();
  const dispatch = useDispatch();
  const { users, currentTimeZone } = useAuth();
  const [viewModal, setViewModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const {
    isLoading,
    data: nightAuditList,
    refetch,
  } = useGetNightAuditListQuery({
    property_id: users?.defaultPropertyId,
  });

  useEffect(() => {
    refetch();
  }, []);

  const handleStartNightAudit = (audit_date: string, comments: string) => {
    const currentDateNightAudit = nightAuditList?.find(
      (a) => a.audit_date === audit_date && a.status === "IN_PROGRESS"
    );
    let commentText = "";
    if (comments) {
      commentText = comments;
    }
    dispatch(
      saveNightAudit({
        audit_date,
        comments: commentText,
        step: currentDateNightAudit?.step ?? "",
      })
    );
    const navigateUrl = `/booking-engine/night-audit/add`;

    Navigate(navigateUrl);
  };

  const columns: Column<INightAuditResponse>[] = [
    {
      field: "audit_date",
      label: "Audit Date",
    },
    {
      field: "description",
      label: "Description",
    },
    {
      field: "step",
      label: "Step",
    },
    {
      field: "dependencies_to_resolve",
      label: "Dependencies To Resolve",
    },
    {
      field: "status",
      label: "Status",
    },
    {
      field: "created_at",
      label: "Created At",
      renderCell: (value: INightAuditResponse) =>
        `${convertUtcToTimezone(value.created_at, currentTimeZone)?.format(appConfig.displayDateFormat + " " + appConfig.dateApiTimeOfDayFormat)}`,
    },
    {
      field: "updated_at",
      label: "Updated At",
      renderCell: (value: INightAuditResponse) =>
        `${convertUtcToTimezone(value.updated_at, currentTimeZone)?.format(appConfig.displayDateFormat + " " + appConfig.dateApiTimeOfDayFormat)}`,
    },
  ];

  return (
    <MainWrapper>
      <Stack
        flexDirection="row"
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        pb={3}
      >
        <PrimaryButton
          buttonStyles={{
            backgroundColor: "#32A1AE",
            color: "#FFFFFF",
            fontWeight: "bold",
          }}
          onClick={() => setViewModal(true)}
          label="Run Night Audit"
          isLoading={isLoading}
        />
      </Stack>
      <DataTable
        columns={columns}
        data={nightAuditList ?? []}
        isLoading={isLoading}
        rowsPerPageOptions={[5, 10, 25]}
        initialRowsPerPage={10}
        currentPage={currentPage}
        onChangePage={(newPage: number) => setCurrentPage(newPage)}
      />
      <Modal
        open={viewModal}
        title={"Run Audit"}
        size="xs"
        onClose={() => setViewModal(false)}
        isHideCloseButton={true}
      >
        <AuditHeader
          onStart={handleStartNightAudit}
          onCancel={() => setViewModal(false)}
          nightAuditList={nightAuditList || []}
        />
      </Modal>
    </MainWrapper>
  );
};

export default NightAuditTable;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  margin: "15px 10px",
}));
