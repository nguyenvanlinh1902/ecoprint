import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  IconButton,
  Popover,
  Grid,
  Tooltip
} from '@mui/material';
import { ColorLens as ColorIcon } from '@mui/icons-material';

// Predefined color options
const COLOR_PRESETS = [
  '#1976d2', '#2196f3', '#03a9f4', '#00bcd4', // Blues
  '#009688', '#4caf50', '#8bc34a', '#cddc39', // Greens
  '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', // Yellows to Oranges
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', // Reds to Purples
  '#3f51b5', '#607d8b', '#795548', '#212121'  // Indigo to Dark
];

/**
 * Color picker component with hex input and presets
 * @param {Object} props - Component props
 * @param {string} props.color - Current color value (hex)
 * @param {Function} props.onChange - Color change handler
 * @returns {JSX.Element} ColorPicker component
 */
const ColorPicker = ({ color, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [inputValue, setInputValue] = useState(color);
  
  const handleOpenPicker = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClosePicker = () => {
    setAnchorEl(null);
  };
  
  const handleSelectColor = (selectedColor) => {
    onChange(selectedColor);
    setInputValue(selectedColor);
    handleClosePicker();
  };
  
  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
    
    // Update parent if it's a valid hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
      onChange(value);
    }
  };
  
  const open = Boolean(anchorEl);
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: /^#([0-9A-F]{3}){1,2}$/i.test(color) ? color : '#cccccc',
          mr: 1,
          cursor: 'pointer'
        }}
        onClick={handleOpenPicker}
      />
      
      <TextField
        value={inputValue}
        onChange={handleInputChange}
        placeholder="#RRGGBB"
        size="small"
        sx={{ width: 120 }}
        InputProps={{
          endAdornment: (
            <IconButton 
              size="small" 
              onClick={handleOpenPicker}
              sx={{ mr: -1 }}
            >
              <ColorIcon fontSize="small" />
            </IconButton>
          )
        }}
      />
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePicker}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{ mt: 1 }}
      >
        <Box sx={{ p: 2, width: 220 }}>
          <Grid container spacing={1}>
            {COLOR_PRESETS.map((presetColor) => (
              <Grid item key={presetColor} xs={3}>
                <Tooltip title={presetColor} arrow>
                  <Box
                    sx={{
                      width: '100%',
                      height: 30,
                      backgroundColor: presetColor,
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: (theme) => theme.shadows[3],
                        transform: 'scale(1.05)'
                      }
                    }}
                    onClick={() => handleSelectColor(presetColor)}
                  />
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Popover>
    </Box>
  );
};

export default ColorPicker; 