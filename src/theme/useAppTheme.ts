import { useSelector } from "react-redux";

import { RootState } from "store/store";

import { lightTheme, darkTheme } from "./theme";

export const useAppTheme = () => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  return darkMode ? darkTheme : lightTheme;
};
