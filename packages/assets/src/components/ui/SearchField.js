import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

/**
 * Reusable search field component
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Search field value
 * @param {Function} props.onChange - Function to call when search field changes
 * @param {string} props.placeholder - Search field placeholder
 * @returns {JSX.Element} SearchField component
 */
const SearchField = ({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  fullWidth = true,
  ...props 
}) => {
  return (
    <TextField
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      fullWidth={fullWidth}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        )
      }}
      {...props}
    />
  );
};

export default SearchField; 