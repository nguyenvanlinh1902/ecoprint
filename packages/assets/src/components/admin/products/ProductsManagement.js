import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import ProductList from './ProductList';
import ProductEditForm from './ProductEditForm';
import ProductImport from './ProductImport';
import { useProductsService } from '../../../hooks/api/useProductsService';
import { useNotification } from '../../../hooks/ui/useNotification';
import { Notification } from '../../common';
import { SearchField } from '../../ui';

// Categories for filter select
const CATEGORIES = [
  'All Categories',
  'Printing Paper',
  'Specialty Paper',
  'Packaging Materials',
  'Office Supplies',
  'Eco-Friendly Materials'
];

/**
 * ProductsManagement component for managing products
 * 
 * @returns {JSX.Element} ProductsManagement component
 */
const ProductsManagement = () => {
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'All Categories',
    stockStatus: 'all',
    sortBy: 'newest'
  });
  const { notification, showNotification, hideNotification } = useNotification();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  
  const { fetchProducts, updateProduct, deleteProduct } = useProductsService();
  
  // Load products
  useEffect(() => {
    loadProducts();
  }, []);
  
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      showNotification('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
    setPage(1);
  };
  
  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Open product edit drawer
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditDrawerOpen(true);
  };
  
  // Close product edit drawer
  const handleCloseEditDrawer = () => {
    setIsEditDrawerOpen(false);
    setSelectedProduct(null);
  };
  
  // Save edited product
  const handleSaveProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      // Update product via service
      await updateProduct(selectedProduct);
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === selectedProduct.id ? selectedProduct : product
        )
      );
      
      showNotification('Product updated successfully', 'success');
      setIsEditDrawerOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      showNotification('Failed to update product', 'error');
    }
  };
  
  // Delete product
  const handleDeleteProduct = async (productId) => {
    try {
      // Delete product via service
      await deleteProduct(productId);
      
      // Update local state
      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
      
      showNotification('Product deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete product', 'error');
    }
  };
  
  // Receive products from import tab
  const handleReceiveImportedProducts = (importedProducts) => {
    setProducts(prevProducts => [...prevProducts, ...importedProducts]);
    
    showNotification(`Successfully imported ${importedProducts.length} products`, 'success');
    
    // Switch to products tab
    setTabValue(0);
  };
  
  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    // Text search
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = filters.category === 'All Categories' || 
      product.category === filters.category;
    
    // Stock status filter
    const matchesStock = filters.stockStatus === 'all' || 
      (filters.stockStatus === 'instock' && product.inStock) || 
      (filters.stockStatus === 'outofstock' && !product.inStock);
    
    return matchesSearch && matchesCategory && matchesStock;
  });
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default: // newest
        return b.id - a.id;
    }
  });
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="product management tabs"
        >
          <Tab label="Products" />
          <Tab label="Import" />
        </Tabs>
      </Box>
      
      {/* Products Tab */}
      {tabValue === 0 && (
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Product Inventory
            </Typography>
            
            {/* Controls */}
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <SearchField
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search products..."
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="category-filter-label">Category</InputLabel>
                  <Select
                    labelId="category-filter-label"
                    value={filters.category}
                    label="Category"
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    size="small"
                  >
                    {CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="stock-filter-label">Stock Status</InputLabel>
                  <Select
                    labelId="stock-filter-label"
                    value={filters.stockStatus}
                    label="Stock Status"
                    onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                    size="small"
                  >
                    <MenuItem value="all">All Items</MenuItem>
                    <MenuItem value="instock">In Stock</MenuItem>
                    <MenuItem value="outofstock">Out of Stock</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => handleEditProduct({
                    id: Math.max(0, ...products.map(p => p.id)) + 1,
                    name: '',
                    category: '',
                    price: 0,
                    description: '',
                    inStock: true,
                    stockQuantity: 0,
                    eco: false,
                    featured: false,
                  })}
                >
                  Add New
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          <ProductList 
            products={sortedProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            page={page}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </Box>
      )}
      
      {/* Import Tab */}
      {tabValue === 1 && (
        <ProductImport onProductsImported={handleReceiveImportedProducts} />
      )}
      
      {/* Edit Drawer */}
      <Drawer
        anchor="right"
        open={isEditDrawerOpen}
        onClose={handleCloseEditDrawer}
        sx={{
          '& .MuiDrawer-paper': { 
            width: { xs: '100%', sm: 400 },
            p: 2
          },
        }}
      >
        {selectedProduct && (
          <ProductEditForm
            product={selectedProduct}
            onProductChange={setSelectedProduct}
            onSave={handleSaveProduct}
          />
        )}
      </Drawer>
      
      {/* Notifications */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={hideNotification}
      />
    </Box>
  );
};

export default ProductsManagement; 