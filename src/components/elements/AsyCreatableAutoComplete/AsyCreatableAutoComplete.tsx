import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { AutocompleteValue } from "@mui/material";

export interface IOptionType {
  inputValue?: string;
  label: string;
  value: string;
}

const filter = createFilterOptions<IOptionType>();

interface AsyCreatableAutoCompleteProps {
  label: string;
  placeholder: string;
  value: string[] | null;
  options: IOptionType[];
  onChange: (value: string[] | null) => void;
  onChangeCreated?: (newValue: IOptionType | null) => void;
  multiple?: boolean;
}

const AsyCreatableAutoComplete: React.FC<AsyCreatableAutoCompleteProps> = ({
  label,
  placeholder,
  value,
  options,
  onChange,
  multiple = false,
}) => {
  const [optionList, setOptionList] = React.useState<IOptionType[]>(options);

  React.useEffect(() => {
    setOptionList(options);
  }, [options]);

  const selectedOptionValues = optionList.filter((option) => {
    return value?.includes(option.value);
  });

  return (
    <Autocomplete
      multiple={multiple}
      value={selectedOptionValues}
      onChange={(
        event: React.SyntheticEvent,
        newValue: AutocompleteValue<IOptionType, boolean, boolean, boolean>
      ) => {
        if (Array.isArray(newValue)) {
          // Handle multiple selection or single selection with created value
          const selected = newValue.map((item) => {
            // Check if it's a string that starts with "Add ", and remove it
            if (typeof item === "string" && item.startsWith("Add ")) {
              const cleanItem = item.replace(/^Add\s+/, "");
              return { label: cleanItem, value: cleanItem };
            } else if (
              typeof item === "object" &&
              item.label.startsWith("Add ")
            ) {
              const cleanItem = item.label.replace(/^Add\s+/, "");
              return { label: cleanItem, value: cleanItem };
            }
            // If it's already an IOptionType, return it as is
            return item;
          });

          // Ensure selected only contains IOptionType objects before mapping to values
          const selectedValues = selected
            .filter((item): item is IOptionType => typeof item !== "string") // Type guard to filter out strings
            .map((item) => item.value);

          // Filter new options that don't already exist in the option list
          const newOptions = selected.filter(
            (item): item is IOptionType =>
              typeof item !== "string" && // Type guard to ensure it's an IOptionType
              !optionList.some((opt: IOptionType) => opt.value === item.value)
          );

          // Only update the option list if there are new items to add
          if (newOptions.length > 0) {
            setOptionList((prev) => [...prev, ...newOptions]);
          }

          // Pass selected values to the parent onChange handler
          onChange(selectedValues);
        } else if (newValue && typeof newValue === "object") {
          // Single selection with object value
          onChange([newValue.value]);
        } else {
          // Handle null case
          onChange(null);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        if (params.inputValue !== "") {
          filtered.push({
            inputValue: params.inputValue,
            label: `Add ${params.inputValue}`,
            value: params.inputValue,
          });
        }
        return filtered;
      }}
      options={optionList}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.label
      }
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      renderOption={(props, option) => (
        <li {...props}>
          {typeof option === "object" && "label" in option ? option.label : ""}
        </li>
      )}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder={placeholder} />
      )}
      fullWidth
    />
  );
};

export default AsyCreatableAutoComplete;
