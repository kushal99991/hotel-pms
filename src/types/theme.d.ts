import {
  Palette as PaletteProps,
  PaletteOptions as PaletteOptionsProps,
} from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette extends PaletteProps {
    button: {
      bgHover: string;
    };
  }
  interface PaletteOptions extends PaletteOptionsProps {
    button: {
      bgHover: string;
    };
  }
}
