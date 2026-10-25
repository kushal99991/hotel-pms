import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ISelectedNightAudit {
  audit_date: string;
  comments: string;
  step: string;
}

export interface NightAuditState {
  selectedNightAudit: ISelectedNightAudit | null;
}

const initialState: NightAuditState = {
  selectedNightAudit: null,
};

const nightAuditReducer = createSlice({
  name: "nightAuditReducer",
  initialState,
  reducers: {
    saveNightAudit(
      state: NightAuditState,
      action: PayloadAction<ISelectedNightAudit | null>
    ) {
      state.selectedNightAudit = action.payload;
    },
  },
});

export const { saveNightAudit } = nightAuditReducer.actions;
export default nightAuditReducer.reducer;
