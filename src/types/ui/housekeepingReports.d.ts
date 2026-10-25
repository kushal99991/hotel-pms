import { IHousekeeperBoard } from "types/houseKeeperTypes";

export interface BoardWithTotals extends IHousekeeperBoard {
  totalCredits: number;
}

export interface ShiftGroup {
  shift: IHousekeeperBoard["shift"];
  boards: BoardWithTotals[];
  totalCredits: number;
}
