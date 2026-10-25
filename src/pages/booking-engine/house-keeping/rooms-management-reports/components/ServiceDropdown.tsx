import React, { useState, useRef } from "react";
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useGetServiceCreditsQuery } from "services/houseKeeperSlice";

interface EditableServiceDropdownProps {
  serviceType: string;
  rowData: any; // Replace `any` with the specific type for rowData
  onUpdate: (newServiceType: string, value: number) => void;
  setEditFlag: (isEditing: boolean) => void;
}

const EditableServiceDropdown: React.FC<EditableServiceDropdownProps> = ({
  serviceType,
  rowData,
  onUpdate,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [value, setValue] = useState(serviceType);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: serviceList } = useGetServiceCreditsQuery({
    roomTypeId: rowData.roomTypeId,
    property_id: rowData.property_id,
  });

  const serviceOptions = serviceList?.map((service) => ({
    label: service.service_type, // service_type as label
    value: service.id, // id as value
  }));

  const handleBlur = () => {
    timerRef.current = setTimeout(() => {
      setIsEditMode(false);
    }, 200);
  };

  const handleFocus = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newValue = Number(event.target.value); // Ensure value is treated as a number
    const selectedOption = serviceOptions?.find(
      (option) => option.value === newValue
    );
    const label = selectedOption?.label || ""; // Fallback to "N/A" if no label is found
    setValue(label);
    onUpdate(label, newValue); // Pass both the new value (id) and its label to the parent
    setIsEditMode(false); // Exit edit mode
  };

  return (
    <Box
      onDoubleClick={(event) => {
        setIsEditMode(true);
        event.stopPropagation();
      }}
    >
      {isEditMode ? (
        <FormControl
          fullWidth
          size="small"
          onBlur={handleBlur}
          onFocus={handleFocus}
        >
          <Select value={value} onChange={handleChange} autoFocus>
            {serviceOptions?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        // Render the static label for the service type
        serviceOptions?.find((option) => option.label === value)?.label || "N/A"
      )}
    </Box>
  );
};

export default EditableServiceDropdown;
