import { createTheme } from "@mui/material/styles";

import { Colors } from "./Colors";

export const lightTheme = createTheme({
  typography: {},
  palette: {
    primary: {
      main: Colors.light.primary,
    },
    secondary: {
      main: Colors.light.secondary,
    },
    button: {
      bgHover: Colors.light.button.hoverBackground,
    },
    background: {
      default: Colors.light.background,
      paper: Colors.light.surface,
    },
    error: {
      main: Colors.light.error,
    },
    text: {
      primary: Colors.light.text,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: Colors.light.primary || "#1976d2", // Set your desired AppBar color
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          // Prevent error text appearing and pushing content down
          marginTop: 0,
          height: 0,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          padding: "0 0.5rem",
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  typography: {},
  palette: {
    primary: {
      main: Colors.dark.primary,
    },
    button: {
      bgHover: Colors.dark.button.hoverBackground,
    },
    secondary: {
      main: Colors.dark.secondary,
    },
    background: {
      default: Colors.dark.background,
      paper: Colors.dark.surface,
    },
    error: {
      main: Colors.dark.error,
    },
    text: {
      primary: Colors.dark.text,
    },
  },
});

export type AppTheme = typeof lightTheme;
