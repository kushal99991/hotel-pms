import React, { useCallback, useEffect, useState } from "react";
import { Box, styled } from "@mui/material";
import BoardIndex from "../../house-keeping/housekeeping-dashboard/_components/BoardIndex";
import { useLazyGetHousekeepingBoardsQuery } from "services/houseKeeperSlice";
import useAuth from "hooks/useAuth";
import { IHousekeeperBoard } from "types/houseKeeperTypes";

const MainWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const ArchivedBoardsPage: React.FC = () => {
  const { users } = useAuth();

  const [boardList, setBoardList] = useState<IHousekeeperBoard[]>([]);
  const [getHouseKeepingBoards, { isLoading }] =
    useLazyGetHousekeepingBoardsQuery();

  const fetchBoardData = useCallback(async () => {
    const response = await getHouseKeepingBoards({
      property_id: users?.defaultPropertyId ?? 1,
      include_archived: true,
    });
    if (response?.error) {
      setBoardList([]);
      return false;
    }
    setBoardList(response?.data ?? []);
  }, [getHouseKeepingBoards, users?.defaultPropertyId]);

  useEffect(() => {
    fetchBoardData();
  }, [users?.defaultPropertyId, fetchBoardData]);

  return (
    <MainWrapper>
      <BoardIndex
        boardList={boardList || []}
        isLoading={isLoading}
        refetchBoards={fetchBoardData}
        showOnlyArchived={true}
      />
    </MainWrapper>
  );
};

export default ArchivedBoardsPage;
