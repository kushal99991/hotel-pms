import { Box } from "@mui/material";

// TabPanel component to display the content of each tab
export interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabContent: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      <Box>
        <div>{children}</div>
      </Box>
    </div>
  );
};

export default TabContent;
