import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Rating,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Tabs,
  Tab,
  Divider,
  Pagination,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  AddShoppingCart as AddCartIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Demo data
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Recycled A4 Paper (500 sheets)',
    category: 'Printing Paper',
    price: 5.99,
    rating: 4.5,
    image: '/products/recycled-paper.jpg',
    description: 'Eco-friendly recycled A4 paper for everyday printing. 80gsm.',
    inStock: true,
    stockQuantity: 1500,
    eco: true
  },
  {
    id: 2,
    name: 'Premium Kraft Paper Bags',
    category: 'Packaging Materials',
    price: 3.49,
    rating: 4.2,
    image: '/products/kraft-bags.jpg',
    description: 'Durable kraft paper bags for packaging. 100% recyclable.',
    inStock: true,
    stockQuantity: 750,
    eco: true
  },
  {
    id: 3,
    name: 'Bamboo Notebooks',
    category: 'Office Supplies',
    price: 7.99,
    rating: 4.8,
    image: '/products/bamboo-notebook.jpg',
    description: 'Sustainable bamboo cover notebooks with recycled paper. Perfect for eco-conscious note-taking.',
    inStock: true,
    stockQuantity: 200,
    eco: true
  },
  {
    id: 4,
    name: 'Recycled Cardboard Boxes (Pack of 10)',
    category: 'Packaging Materials',
    price: 12.99,
    rating: 4.0,
    image: '/products/cardboard-boxes.jpg',
    description: 'Strong recycled cardboard boxes for shipping and storage.',
    inStock: true,
    stockQuantity: 350,
    eco: true
  },
  {
    id: 5,
    name: 'Eco-Friendly Gloss Paper',
    category: 'Specialty Paper',
    price: 8.99,
    rating: 4.3,
    image: '/products/gloss-paper.jpg',
    description: 'High-quality glossy paper made from sustainable sources. Perfect for brochures and presentations.',
    inStock: true,
    stockQuantity: 600,
    eco: true
  },
  {
    id: 6,
    name: 'Biodegradable Bubble Wrap',
    category: 'Packaging Materials',
    price: 15.99,
    rating: 4.6,
    image: '/products/bubble-wrap.jpg',
    description: 'Eco-friendly alternative to traditional bubble wrap. Biodegrades within 24 months.',
    inStock: true,
    stockQuantity: 180,
    eco: true
  },
  {
    id: 7,
    name: 'Recycled Business Cards (Pack of 100)',
    category: 'Printing Paper',
    price: 9.99,
    rating: 4.4,
    image: '/products/business-cards.jpg',
    description: 'Professional business cards printed on 100% recycled card stock.',
    inStock: true,
    stockQuantity: 450,
    eco: true
  },
  {
    id: 8,
    name: 'Plant-based Ink Cartridges',
    category: 'Office Supplies',
    price: 24.99,
    rating: 3.9,
    image: '/products/ink-cartridges.jpg',
    description: 'Eco-friendly printer ink made from plant-based materials.',
    inStock: false,
    stockQuantity: 0,
    eco: true
  }
];

// Categories
const CATEGORIES = [
  'All Products',
  'Printing Paper',
  'Specialty Paper',
  'Packaging Materials',
  'Office Supplies',
  'Eco-Friendly Materials'
];

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'All Products',
    priceRange: 'all',
    sortBy: 'popularity'
  });
  const [page, setPage] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  
  // Simulating data fetch
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setProducts(MOCK_PRODUCTS);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
    setPage(1); // Reset to first page when filter changes
  };
  
  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when search changes
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Toggle favorite
  const toggleFavorite = (productId) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
    } else {
      setFavorites([...favorites, productId]);
    }
  };
  
  // Add to cart
  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };
  
  // Filter products
  const filteredProducts = products.filter(product => {
    // Search term filter
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = filters.category === 'All Products' || 
                           product.category === filters.category;
    
    // Price range filter
    let matchesPrice = true;
    if (filters.priceRange === 'under-5') {
      matchesPrice = product.price < 5;
    } else if (filters.priceRange === '5-10') {
      matchesPrice = product.price >= 5 && product.price <= 10;
    } else if (filters.priceRange === '10-20') {
      matchesPrice = product.price > 10 && product.price <= 20;
    } else if (filters.priceRange === 'over-20') {
      matchesPrice = product.price > 20;
    }
    
    return matchesSearch && matchesCategory && matchesPrice;
  });
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (filters.sortBy === 'price-low') {
      return a.price - b.price;
    } else if (filters.sortBy === 'price-high') {
      return b.price - a.price;
    } else if (filters.sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      // Default sort by popularity (rating)
      return b.rating - a.rating;
    }
  });
  
  // Pagination
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const displayProducts = sortedProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  
  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Eco-Friendly Products
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Browse our selection of sustainable and eco-friendly printing and packaging materials
        </Typography>
      </Box>
      
      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                label="Category"
              >
                {CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Price</InputLabel>
              <Select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                label="Price"
              >
                <MenuItem value="all">All Prices</MenuItem>
                <MenuItem value="under-5">Under $5</MenuItem>
                <MenuItem value="5-10">$5 - $10</MenuItem>
                <MenuItem value="10-20">$10 - $20</MenuItem>
                <MenuItem value="over-20">Over $20</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                label="Sort By"
              >
                <MenuItem value="popularity">Popularity</MenuItem>
                <MenuItem value="price-low">Price: Low to High</MenuItem>
                <MenuItem value="price-high">Price: High to Low</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {/* Category Tabs - Only show on mobile */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
        <Tabs
          value={CATEGORIES.indexOf(filters.category)}
          onChange={(e, newValue) => handleFilterChange('category', CATEGORIES[newValue])}
          variant="scrollable"
          scrollButtons="auto"
        >
          {CATEGORIES.map((category) => (
            <Tab key={category} label={category} />
          ))}
        </Tabs>
      </Box>
      
      {/* Products Grid */}
      <Box sx={{ mb: 4 }}>
        {loading ? (
          // Loading skeleton
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Card>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton width="80%" />
                    <Skeleton width="40%" />
                    <Skeleton width="60%" />
                  </CardContent>
                  <CardActions>
                    <Skeleton width="100%" height={40} />
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          displayProducts.length > 0 ? (
            <Grid container spacing={3}>
              {displayProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 4
                    }
                  }}>
                    {product.eco && (
                      <Chip
                        label="Eco-Friendly"
                        color="success"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          zIndex: 1
                        }}
                      />
                    )}
                    <IconButton
                      onClick={() => toggleFavorite(product.id)}
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.9)',
                        }
                      }}
                    >
                      {favorites.includes(product.id) ? (
                        <FavoriteIcon color="error" />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                    
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.image || "https://via.placeholder.com/300x200?text=EcoPrint+Product"}
                      alt={product.name}
                      sx={{ objectFit: 'contain', pt: 2 }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" component="h2" fontWeight="bold" gutterBottom>
                        {product.name}
                      </Typography>
                      
                      <Chip 
                        label={product.category} 
                        size="small" 
                        sx={{ mb: 1 }} 
                      />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating 
                          value={product.rating} 
                          precision={0.5} 
                          size="small" 
                          readOnly 
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({product.rating})
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {product.description.length > 80 
                          ? `${product.description.substring(0, 80)}...` 
                          : product.description}
                      </Typography>
                      
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ${product.price.toFixed(2)}
                      </Typography>
                      
                      {!product.inStock && (
                        <Typography variant="body2" color="error">
                          Out of stock
                        </Typography>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        startIcon={<AddCartIcon />}
                        fullWidth
                        disabled={!product.inStock}
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No products found
              </Typography>
              <Typography color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    category: 'All Products',
                    priceRange: 'all',
                    sortBy: 'popularity'
                  });
                }}
              >
                Clear Filters
              </Button>
            </Box>
          )
        )}
      </Box>
      
      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>
      )}
      
      {/* Results summary */}
      {!loading && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {displayProducts.length} of {filteredProducts.length} products
          </Typography>
        </Box>
      )}
      
      {/* Fixed cart button */}
      <Tooltip title="View Cart">
        <IconButton
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            zIndex: 1000,
            boxShadow: 3
          }}
        >
          <Badge badgeContent={cartItems.reduce((sum, item) => sum + item.quantity, 0)} color="error">
            <CartIcon />
          </Badge>
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ProductCatalog; 