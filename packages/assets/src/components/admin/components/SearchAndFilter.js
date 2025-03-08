import React from 'react';
import {
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

/**
 * Component hiển thị thanh tìm kiếm và lọc theo trạng thái
 * @param {Object} props
 * @param {string} props.searchTerm - Từ khóa tìm kiếm hiện tại
 * @param {Function} props.onSearchChange - Callback khi thay đổi từ khóa tìm kiếm
 * @param {string} props.filterStatus - Trạng thái lọc hiện tại
 * @param {Function} props.onFilterChange - Callback khi thay đổi bộ lọc
 */
const SearchAndFilter = React.memo(({ 
  searchTerm, 
  onSearchChange, 
  filterStatus, 
  onFilterChange 
}) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, email, or phone"
          value={searchTerm}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth variant="outlined">
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={filterStatus}
            onChange={onFilterChange}
            label="Status"
            startAdornment={
              <InputAdornment position="start">
                <FilterIcon />
              </InputAdornment>
            }
            variant="filled">
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
});

export default SearchAndFilter; 