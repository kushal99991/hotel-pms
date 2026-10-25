import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

export interface IOptionType {
  inputValue?: string;
  label: string;
  value: string;
}

const filter = createFilterOptions<IOptionType>();

interface AsyCreatableAutoCompleteProps {
  label: string;
  placeholder: string;
  value: string | null;
  options: IOptionType[];
  onChange: (value: string | null) => void;
  onChangeCreated: (newValue: string) => void;
}

const SingleSelectAutoComplete: React.FC<AsyCreatableAutoCompleteProps> = ({
  label,
  placeholder,
  value,
  options,
  onChange,
  onChangeCreated,
}) => {
  const [optionList, setOptionList] = React.useState<IOptionType[]>(options);
  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => {
        if (typeof newValue === "string") {
          const createdValue = { label: newValue, value: newValue };
          onChangeCreated(createdValue.value);
          onChange(createdValue.value);
          setOptionList((prev) => [...prev, ...[createdValue]]);
        } else if (newValue && newValue.inputValue) {
          const createdValue = {
            label: newValue.inputValue,
            value: newValue.inputValue,
          };
          onChangeCreated(createdValue.value);
          onChange(createdValue.value);
          setOptionList((prev) => [...prev, ...[createdValue]]);
        } else {
          onChange(newValue?.value ?? null);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        if (params.inputValue !== "") {
          filtered.push({
            inputValue: params.inputValue,
            label: `Add "${params.inputValue}"`,
            value: params.inputValue,
          });
        }

        return filtered;
      }}
      options={optionList}
      getOptionLabel={(option) => {
        if (typeof option === "string") {
          return option;
        }
        if (option.inputValue) {
          return option.inputValue;
        }
        return option.label;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            {option.label}
          </li>
        );
      }}
      sx={{ width: 300 }}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder={placeholder} />
      )}
    />
  );
};

export default SingleSelectAutoComplete;
