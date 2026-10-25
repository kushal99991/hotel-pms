import React from "react";
import { IHousekeeperBoard, IHousekeeperView } from "types/houseKeeperTypes";
import DataTable, { Column } from "components/elements/DataTable/DataTable";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";

interface HousekeeperViewProps {
  isLoading: boolean;
  boardList: IHousekeeperBoard[];
}

const HousekeeperView: React.FC<HousekeeperViewProps> = ({
  isLoading,
  boardList,
}) => {
  const calculateBoardSummary = (boards: IHousekeeperBoard[]) => {
    const summary = boards.reduce(
      (
        acc: {
          housekeeperId: number;
          housekeeperName: string;
          totalCredits: number;
        }[],
        board
      ) => {
        const housekeeperId = board.housekeeper.id;
        const housekeeperName =
          board.housekeeper.first_name +
          " " +
          board.housekeeper.last_name?.slice(0, 1) +
          ".";

        // Calculate total credits for this housekeeper on the current board
        const totalCredits = parseFloat(
          board.tasks
            .reduce((creditSum, task) => creditSum + task.credits, 0)
            .toFixed(1)
        );

        // Check if there's already an entry for this housekeeper ID
        const existingEntry = acc.find(
          (entry) => entry.housekeeperId === housekeeperId
        );

        if (existingEntry) {
          // If entry exists for the same housekeeper ID, accumulate credits
          existingEntry.totalCredits += totalCredits;
        } else {
          // If no entry exists, add a new object with housekeeperId, housekeeperName, and totalCredits
          acc.push({
            housekeeperId, // For internal tracking, not included in the final output
            housekeeperName,
            totalCredits,
          });
        }

        return acc;
      },
      []
    );

    // Return only the fields we need (housekeeperName, totalCredits)
    return summary.map(({ housekeeperName, totalCredits }) => ({
      housekeeperName,
      totalCredits,
    }));
  };

  const summary = calculateBoardSummary(boardList || []);

  const footerComponent = (
    <Box
      sx={{
        marginLeft: 8,
        display: "flex",
        justifyContent: "flex-start",
        gap: 2,
        padding: 2,
      }}
    >
      <Typography variant="body2">
        Total Credits:{" "}
        {summary.length > 0
          ? summary
              .reduce((total, { totalCredits }) => total + totalCredits, 0)
              .toFixed(1)
          : "0"}
      </Typography>
    </Box>
  );

  const columns: Column<IHousekeeperView>[] = [
    {
      field: "housekeeperName",
      label: "Name",
      align: "center",
    },
    {
      field: "totalCredits",
      label: "Credits",
      align: "center",
      renderCell: (row) =>
        row.totalCredits !== undefined
          ? `${Number(row.totalCredits).toFixed(1)}`
          : "N/A",
    },
  ];

  return (
    <>
      {/* <Stack
        flexDirection="row"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        pb={9}
      /> */}
      <DataTable
        columns={columns}
        data={boardList?.length ? summary : []}
        isLoading={isLoading}
        minWidth={325}
        rowsPerPageOptions={[5, 10, 20, 50, 100]}
        initialRowsPerPage={5}
        renderFooter={() => footerComponent}
        rowHeight={"74px"}
      />
    </>
  );
};

export default HousekeeperView;
