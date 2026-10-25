import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "store/store";
import App from "./App";
import ThemeProvider from "./ThemeProvider";
import "rsuite/dist/rsuite-no-reset.min.css";
import "./index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { SnackbarProvider } from "contexts/SnackbarContext";
import { SocketProvider } from "contexts/SocketContext";
import { CommandPaletteProvider } from "contexts/CommandPaletteContext";
import ErrorBoundary from "./ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <Provider store={store}>
      <BrowserRouter>
        <SocketProvider>
          <ThemeProvider>
            <SnackbarProvider>
              <CommandPaletteProvider>
                <App />
              </CommandPaletteProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </SocketProvider>
      </BrowserRouter>
    </Provider>
  </ErrorBoundary>
);
