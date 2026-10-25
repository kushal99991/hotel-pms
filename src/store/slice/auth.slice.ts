import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RouteList } from "config/sidebarmenu.config";
import { IUserResponse } from "types/authTypes";

export interface AuthState {
  isAuthenticated: boolean;
  user: IUserResponse | null;
  menuList: RouteList[];
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  menuList: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    saveSession(state: AuthState, action: PayloadAction<IUserResponse | null>) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout(state: AuthState) {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { saveSession, logout } = authSlice.actions;
export default authSlice.reducer;
