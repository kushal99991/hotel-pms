import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import { IRate } from "types/rateTypes";

import RateRow from "./RateRow";
import EditableRateRow from "./EditableRateRow";

interface RateTableProps {
  rates: IRate[];
  handleStatusChange: (
    _event: React.ChangeEvent<HTMLInputElement>,
    _index: number
  ) => void;
  editIndex: number | null;
  handleEditRateChange: (
    _event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    _index: number
  ) => void;
  handleSaveEditRate: (_index: number) => void;
  handleEditClick: (_index: number) => void;
  handleCancelEditRate: () => void;
  errors: { [key: string]: string };
  newRate?: IRate | null;
  handleAddNewRateChange?: (
    _event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSaveNewRate?: () => void;
  handleCancelAddNewRate?: () => void;
}

const RateTable: React.FC<RateTableProps> = ({
  rates,
  handleStatusChange,
  editIndex,
  handleEditRateChange,
  handleSaveEditRate,
  handleEditClick,
  handleCancelEditRate,
  errors,
  newRate,
  handleAddNewRateChange,
  handleSaveNewRate,
  handleCancelAddNewRate,
}) => {
  const isAnyEditing = editIndex !== null || newRate !== null;

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rates.map((rate, index) =>
            editIndex === index ? (
              <EditableRateRow
                key={index}
                rate={rate}
                index={index}
                handleEditRateChange={handleEditRateChange}
                handleStatusChange={handleStatusChange}
                handleSaveEditRate={handleSaveEditRate}
                handleCancelEditRate={handleCancelEditRate}
                errors={errors}
              />
            ) : (
              <RateRow
                key={index}
                rate={rate}
                index={index}
                handleEditClick={handleEditClick}
                isEditing={isAnyEditing}
              />
            )
          )}
          {newRate && (
            <EditableRateRow
              rate={newRate}
              index={0}
              handleEditRateChange={handleAddNewRateChange!}
              handleStatusChange={handleAddNewRateChange!}
              handleSaveEditRate={handleSaveNewRate!}
              handleCancelEditRate={handleCancelAddNewRate!}
              errors={errors}
              isNewRate
            />
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RateTable;
