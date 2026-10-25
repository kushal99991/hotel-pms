import React from "react";
import { FormControl, Select, MenuItem, Typography } from "@mui/material";

const SelectProperty = () => {
  return (
    <>
      <Typography variant="h6" paddingBottom={2}>
        Current Property
      </Typography>
      <FormControl variant="outlined" sx={{ minWidth: 200 }}>
        <Select defaultValue="" displayEmpty>
          <MenuItem value="" disabled>
            Select Property
          </MenuItem>
          <MenuItem value="Property1">GWC Lodge</MenuItem>
          <MenuItem value="Property2">GCW Cabins</MenuItem>
        </Select>
      </FormControl>
    </>
  );
};

export default SelectProperty;
