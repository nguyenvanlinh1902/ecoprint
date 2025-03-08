import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

// Categories for select
const CATEGORIES = [
  'Printing Paper',
  'Specialty Paper',
  'Packaging Materials',
  'Office Supplies',
  'Eco-Friendly Materials'
];

/**
 * ProductEditForm component for editing product details
 * 
 * @param {Object} props - Component props
 * @param {Object} props.product - Product object to edit
 * @param {Function} props.onProductChange - Function to update product object
 * @param {Function} props.onSave - Function to save changes
 * @returns {JSX.Element} ProductEditForm component
 */
const ProductEditForm = ({ product, onProductChange, onSave }) => {
  if (!product) return null;

  const handleChange = (field, value) => {
    onProductChange({ ...product, [field]: value });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Edit Product
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Product Name"
            value={product.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              value={product.category || ''}
              label="Category"
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Price"
            type="number"
            value={product.price || 0}
            onChange={(e) => handleChange('price', parseFloat(e.target.value))}
            fullWidth
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Description"
            value={product.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            fullWidth
            multiline
            rows={4}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Stock Quantity"
            type="number"
            value={product.stockQuantity || 0}
            onChange={(e) => handleChange('stockQuantity', parseInt(e.target.value, 10))}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={product.inStock || false}
                onChange={(e) => handleChange('inStock', e.target.checked)}
              />
            }
            label="In Stock"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={product.featured || false}
                onChange={(e) => handleChange('featured', e.target.checked)}
              />
            }
            label="Featured Product"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={product.eco || false}
                onChange={(e) => handleChange('eco', e.target.checked)}
              />
            }
            label="Eco-Friendly"
          />
        </Grid>
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={onSave}
            startIcon={<SaveIcon />}
          >
            Save Product
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductEditForm; 