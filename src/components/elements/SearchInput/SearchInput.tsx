import debounce from "utils/helperFunctions/debounce";
import React, { useState, ChangeEvent } from "react";
import { TextField, InputAdornment, IconButton, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchInputProps {
  onSearch: (_query: string) => void;
  disabled?: boolean;
  size?: "small" | "medium" | undefined;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  disabled,
  size,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Debounce the search function
  const debouncedSearch = debounce((query: string) => {
    onSearch(query);
  }, 200);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchQuery(newValue);
    debouncedSearch(newValue); // Call the debounced search function
  };

  const handleSearchSubmit = () => {
    onSearch(searchQuery);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <TextField
        id="search-input"
        label="Search"
        variant="outlined"
        size={size}
        value={searchQuery}
        onChange={handleSearchChange}
        disabled={disabled}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleSearchSubmit} disabled={disabled}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default SearchInput;
