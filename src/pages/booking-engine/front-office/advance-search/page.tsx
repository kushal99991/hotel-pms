import ReservationSearch from "./components/ReservationSearch";
import AdvanceSearchForm from "./components/AdvanceSearchForm";
import { Box, styled } from "@mui/material";
import { useState } from "react";
import { GridFilterModel } from "@mui/x-data-grid";

export default function ReservationPage() {
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  return (
    <MainWrapper>
      <AdvanceSearchForm setFilterModel={setFilterModel} />
      <ReservationSearch
        filterModel={filterModel}
        setFilterModel={setFilterModel}
      />
    </MainWrapper>
  );
}

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  margin: "15px 10px",
}));
