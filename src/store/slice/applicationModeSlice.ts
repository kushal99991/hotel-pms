import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ApplicationModeState {
  mode: "PMS" | "POS" | null;
  features: ("PMS" | "POS")[];
}

const initialState: ApplicationModeState = {
  mode: "PMS",
  features: ["PMS", "POS"], // Initialize with both features for demonstration
};

const applicationModeSlice = createSlice({
  name: "applicationMode",
  initialState,
  reducers: {
    setMode: (
      state: ApplicationModeState,
      action: PayloadAction<"PMS" | "POS">
    ) => {
      state.mode = action.payload;
    },
    setFeatures: (
      state: ApplicationModeState,
      action: PayloadAction<("PMS" | "POS")[]>
    ) => {
      state.features = action.payload;
    },
  },
});

export const { setMode, setFeatures } = applicationModeSlice.actions;
export default applicationModeSlice.reducer;
