import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, styled } from "@mui/material";
import TabContent from "./TabContent";

// Define the interface for the TabItem
interface TabItem {
  label: string;
  content: React.ReactNode;
}

// Define the props for the CommonTabs component
interface CommonTabsProps {
  tabs: TabItem[];
  initialTab?: number;
  onChange?: (event: React.SyntheticEvent, newValue: number) => void; // Add onChange prop
}

// CommonTabs component
const CommonTabs: React.FC<CommonTabsProps> = ({
  tabs,
  initialTab = 0,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update active tab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Handle tab change event
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (onChange) {
      onChange(event, newValue); // Call the onChange handler passed from parent
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Tab Headers */}
      <Tabs
        value={activeTab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="common tabs"
      >
        {tabs.map((tab, index) => (
          <StyledTab key={index} label={tab.label} />
        ))}
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ marginTop: 2 }}>
        {tabs.map((tab, index) => (
          <TabContent key={index} value={activeTab} index={index}>
            {tab.content}
          </TabContent>
        ))}
      </Box>
    </Box>
  );
};

export default CommonTabs;

// Create a styled Tab component with bold labels and selected state background color change
const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: "bold",
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.light, // Change the selected tab background color here
    color: theme.palette.primary.contrastText, // Change the selected tab text color here
  },
  border: "1px",
  borderStyle: "solid",
  borderColor: "rgb(78, 78, 78)",
}));
