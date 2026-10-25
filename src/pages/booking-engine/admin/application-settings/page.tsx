import React, { useCallback, useState } from "react";
import { Grid, Box, Paper, Typography } from "@mui/material";
import PairCardReader from "./_components/CardReaders/Stripe/PairReader";
import CardReaderStatus from "./_components/CardReaders/Stripe/CardReaderStatus";
import CardReaderConnection from "./_components/CardReaders/Stripe/CardReaderConnection";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { appConfig } from "config/app.config";

// Define the possible view states as a TypeScript union type
type ViewState =
  | "stripe-pair-reader"
  | "stripe-reader-status"
  | "stripe-reader-connection";

// Props type for SettingsMenu
interface SettingsMenuProps {
  onChange: (id: ViewState) => void;
}

// Component for the Settings Menu
const SettingsMenu: React.FC<SettingsMenuProps> = ({ onChange }) => (
  <Box sx={{ minHeight: 352, minWidth: 250 }}>
    <SimpleTreeView>
      <TreeItem itemId="card-reader-grid" label="Card Readers">
        <TreeItem itemId="stripe-readers" label="Stripe Terminals">
          <TreeItem
            onClick={() => onChange("stripe-pair-reader")}
            itemId="stripe-pair-reader"
            label="Pair Card Reader"
          />
          <TreeItem
            onClick={() => onChange("stripe-reader-status")}
            itemId="stripe-reader-status"
            label="Card Reader Status"
          />
          <TreeItem
            onClick={() => onChange("stripe-reader-connection")}
            itemId="stripe-reader-connection"
            label="Card Reader Connection"
          />
        </TreeItem>
      </TreeItem>
    </SimpleTreeView>
  </Box>
);

// Main Page Component
const Page: React.FC = () => {
  const ConfigValues = () => {
    return (
      <Box sx={{ textAlign: "left", padding: 10 }}>
        <Typography variant="h5">
          Current Version: {appConfig.appName} {appConfig.version}
        </Typography>
        <Typography variant="body1">Config:</Typography>
        <pre
          style={{
            backgroundColor: "#333",
            color: "#f6f6f6",
            fontSize: "12px",
            overflow: "scroll",
          }}
        >
          {JSON.stringify(appConfig, null, 2)}
        </pre>
      </Box>
    );
  };

  const [view, setView] = useState<ViewState | null>(null);

  // Render content based on the selected view
  const renderView = useCallback((): React.ReactNode => {
    switch (view) {
      case "stripe-pair-reader":
        return <PairCardReader />;
      case "stripe-reader-status":
        return <CardReaderStatus />;
      case "stripe-reader-connection":
        return <CardReaderConnection />;
      default:
        return <ConfigValues />;
    }
  }, [view]);

  return (
    <Paper elevation={2} sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        {/* Sidebar Menu */}
        <Grid item xs={3}>
          <SettingsMenu onChange={setView} />
        </Grid>

        {/* Main Content */}
        <Grid item xs={9}>
          {renderView()}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Page;
