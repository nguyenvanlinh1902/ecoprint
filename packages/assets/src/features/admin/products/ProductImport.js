import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  LinearProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

/**
 * ProductImport component for importing products
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onProductsImported - Callback when products are imported
 * @returns {JSX.Element} ProductImport component
 */
const ProductImport = ({ onProductsImported }) => {
  const [uploading, setUploading] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [error, setError] = useState(null);
  
  // Handle file change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Only accept CSV or JSON files
    if (!file.name.match(/\.(csv|json)$/)) {
      setError('Please upload a CSV or JSON file');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    // Simulate file reading and processing
    setTimeout(() => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          // For this example, we're just generating mock import results
          const importCount = Math.floor(Math.random() * 10) + 5;
          const mockImportedProducts = Array(importCount).fill(0).map((_, index) => ({
            id: 1000 + index,
            name: `Imported Product ${index + 1}`,
            category: 'Eco-Friendly Materials',
            price: parseFloat((Math.random() * 50 + 5).toFixed(2)),
            description: `This is an imported eco-friendly product #${index + 1}.`,
            inStock: true,
            stockQuantity: Math.floor(Math.random() * 1000) + 100,
            eco: true,
            featured: Math.random() > 0.7
          }));
          
          setImportResults({
            totalCount: importCount,
            successCount: importCount,
            products: mockImportedProducts
          });
          
          setUploading(false);
        } catch (err) {
          setError('Failed to parse the uploaded file. Please check format.');
          setUploading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Error reading file');
        setUploading(false);
      };
      
      reader.readAsText(file);
    }, 1500); // Simulate processing time
  };
  
  // Handle import confirmation
  const handleConfirmImport = () => {
    if (importResults && importResults.products.length > 0) {
      onProductsImported(importResults.products);
      setImportResults(null);
    }
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Import Products
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          Upload a CSV or JSON file with product data to import into the system. The file should include
          the following columns: name, category, price, description, stockQuantity, and eco status.
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
              disabled={uploading}
            >
              Select File to Import
              <input
                type="file"
                accept=".csv, .json"
                hidden
                onChange={handleFileChange}
              />
            </Button>
          </Grid>
          
          <Grid item xs={12}>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            
            {uploading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Processing file...
                </Typography>
                <LinearProgress />
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Import Results */}
      {importResults && (
        <Paper sx={{ p: 3 }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            <AlertTitle>Import Ready</AlertTitle>
            Successfully processed {importResults.successCount} products from the file.
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            Products to Import:
          </Typography>
          
          <List>
            {importResults.products.slice(0, 5).map((product, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={product.name}
                    secondary={`${product.category} • $${product.price.toFixed(2)} • Qty: ${product.stockQuantity}`}
                  />
                </ListItem>
                {index < importResults.products.slice(0, 5).length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {importResults.products.length > 5 && (
              <ListItem>
                <ListItemText
                  primary={`... and ${importResults.products.length - 5} more products`}
                />
              </ListItem>
            )}
          </List>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmImport}
            >
              Confirm Import
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ProductImport; 