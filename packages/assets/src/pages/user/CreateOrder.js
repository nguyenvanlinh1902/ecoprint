import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Alert,
  AlertTitle,
  IconButton
} from '@mui/material';
import { Add, Trash, Upload } from 'tabler-icons-react';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';

// Component để chọn sản phẩm
const ProductSelection = ({ onProductSelect, selectedProducts = [], onUpdateQuantity, onRemoveProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [variants, setVariants] = useState([]);
  const [quantity, setQuantity] = useState(1);

  // Lấy danh sách sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getProducts({ published: true });
        if (response.success) {
          setProducts(response.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Lấy variants khi chọn sản phẩm
  useEffect(() => {
    if (!selectedProduct) {
      setVariants([]);
      return;
    }

    const fetchVariants = async () => {
      try {
        const response = await productService.getProductVariants(selectedProduct);
        if (response.success) {
          setVariants(response.variants);
          if (response.variants.length > 0) {
            setSelectedVariant(response.variants[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching variants:', error);
      }
    };

    fetchVariants();
  }, [selectedProduct]);

  // Thêm sản phẩm vào đơn hàng
  const handleAddProduct = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const variant = variants.find(v => v.id === selectedVariant);
    
    onProductSelect({
      productId: selectedProduct,
      productName: product.title,
      variantId: selectedVariant,
      variantName: variant ? `${variant.option1Name}: ${variant.option1Value}` : null,
      quantity,
      price: variant ? variant.price : product.price,
      customizations: []
    });

    // Reset form
    setSelectedProduct('');
    setSelectedVariant('');
    setQuantity(1);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Chọn sản phẩm
        </Typography>
        
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sản phẩm</InputLabel>
              <Select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                label="Sản phẩm"
                disabled={loading}
              >
                <MenuItem value="" disabled>
                  Chọn sản phẩm
                </MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth disabled={!selectedProduct || variants.length === 0}>
              <InputLabel>Biến thể</InputLabel>
              <Select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                label="Biến thể"
              >
                {variants.map((variant) => (
                  <MenuItem key={variant.id} value={variant.id}>
                    {variant.option1Name}: {variant.option1Value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              label="Số lượng"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1 }}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleAddProduct}
              disabled={!selectedProduct || (!selectedVariant && variants.length > 0)}
              fullWidth
            >
              Thêm sản phẩm
            </Button>
          </Grid>
        </Grid>

        {selectedProducts.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Sản phẩm đã chọn
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {selectedProducts.map((item, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      {item.productName}
                      {item.variantName && (
                        <Typography variant="body2" color="text.secondary">
                          {item.variantName}
                        </Typography>
                      )}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={2}>
                    <TextField
                      label="Số lượng"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(index, Math.max(1, parseInt(e.target.value) || 1))}
                      inputProps={{ min: 1 }}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={3}>
                    <Typography variant="body2">
                      Đơn giá: ${item.price}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      Thành tiền: ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={1}>
                    <IconButton color="error" onClick={() => onRemoveProduct(index)}>
                      <Trash size={20} />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Component tùy chỉnh in/thêu
const CustomizationForm = ({ productItems, onUpdateCustomizations }) => {
  // Xử lý upload file
  const handleFileUpload = async (file, productIndex, customizationIndex) => {
    try {
      // Upload file lên storage
      // Trong thực tế, bạn sẽ gọi API để upload file
      console.log('Uploading file:', file.name);
      
      // Giả lập upload thành công với URL
      const fileUrl = URL.createObjectURL(file);
      
      // Cập nhật customization
      const updatedCustomizations = [...productItems[productIndex].customizations];
      updatedCustomizations[customizationIndex] = {
        ...updatedCustomizations[customizationIndex],
        fileUrl: fileUrl,
        fileName: file.name
      };
      
      onUpdateCustomizations(productIndex, updatedCustomizations);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Thêm customization mới
  const addCustomization = (productIndex) => {
    const updatedCustomizations = [
      ...(productItems[productIndex].customizations || []),
      {
        type: 'embroidery',
        location: 'large_center',
        fileUrl: '',
        fileName: '',
        notes: ''
      }
    ];
    
    onUpdateCustomizations(productIndex, updatedCustomizations);
  };

  // Xóa customization
  const removeCustomization = (productIndex, customizationIndex) => {
    const updatedCustomizations = [...productItems[productIndex].customizations];
    updatedCustomizations.splice(customizationIndex, 1);
    
    onUpdateCustomizations(productIndex, updatedCustomizations);
  };

  // Cập nhật thông tin customization
  const updateCustomization = (productIndex, customizationIndex, field, value) => {
    const updatedCustomizations = [...productItems[productIndex].customizations];
    updatedCustomizations[customizationIndex] = {
      ...updatedCustomizations[customizationIndex],
      [field]: value
    };
    
    onUpdateCustomizations(productIndex, updatedCustomizations);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Tùy chỉnh in/thêu
        </Typography>
        
        {productItems.map((item, productIndex) => (
          <Box key={productIndex} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              {item.productName} {item.variantName ? `(${item.variantName})` : ''}
            </Typography>
            
            {(item.customizations || []).map((customization, customizationIndex) => (
              <Paper key={customizationIndex} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Loại tùy chỉnh</InputLabel>
                      <Select
                        value={customization.type}
                        onChange={(e) => updateCustomization(productIndex, customizationIndex, 'type', e.target.value)}
                        label="Loại tùy chỉnh"
                      >
                        <MenuItem value="embroidery">Thêu (Embroidery)</MenuItem>
                        <MenuItem value="dtg">DTG Printing</MenuItem>
                        <MenuItem value="dtf">DTF Printing</MenuItem>
                        <MenuItem value="print">In thường</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Vị trí</InputLabel>
                      <Select
                        value={customization.location}
                        onChange={(e) => updateCustomization(productIndex, customizationIndex, 'location', e.target.value)}
                        label="Vị trí"
                      >
                        <MenuItem value="large_center">Giữa trước lớn</MenuItem>
                        <MenuItem value="left_sleeve">Tay trái</MenuItem>
                        <MenuItem value="right_sleeve">Tay phải</MenuItem>
                        <MenuItem value="back_location">Mặt sau</MenuItem>
                        <MenuItem value="special_location">Vị trí đặc biệt</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        border: '1px dashed #ccc',
                        borderRadius: 1,
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        height: '100%',
                        minHeight: 80
                      }}
                    >
                      <input
                        type="file"
                        id={`file-upload-${productIndex}-${customizationIndex}`}
                        hidden
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0], productIndex, customizationIndex);
                          }
                        }}
                      />
                      
                      {customization.fileUrl ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {customization.fileName}
                          </Typography>
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => document.getElementById(`file-upload-${productIndex}-${customizationIndex}`).click()}
                          >
                            Thay đổi
                          </Button>
                        </Box>
                      ) : (
                        <Button
                          startIcon={<Upload size={16} />}
                          onClick={() => document.getElementById(`file-upload-${productIndex}-${customizationIndex}`).click()}
                        >
                          Upload thiết kế
                        </Button>
                      )}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Ghi chú"
                      value={customization.notes || ''}
                      onChange={(e) => updateCustomization(productIndex, customizationIndex, 'notes', e.target.value)}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sx={{ textAlign: 'right' }}>
                    <Button
                      color="error"
                      onClick={() => removeCustomization(productIndex, customizationIndex)}
                    >
                      Xóa
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            ))}
            
            <Button
              startIcon={<Add />}
              onClick={() => addCustomization(productIndex)}
            >
              Thêm tùy chỉnh
            </Button>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

// Component thông tin giao hàng
const ShippingForm = ({ formData, setFormData, errors }) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Thông tin giao hàng
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Địa chỉ đường"
              value={formData.street || ''}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              error={!!errors.street}
              helperText={errors.street}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Thành phố"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              error={!!errors.city}
              helperText={errors.city}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Mã bưu điện"
              value={formData.postalCode || ''}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              error={!!errors.postalCode}
              helperText={errors.postalCode}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tỉnh/Thành"
              value={formData.state || ''}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Quốc gia"
              value={formData.country || 'Vietnam'}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Component tổng kết đơn hàng
const OrderSummary = ({ products, priceDetails, isLoading }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Tổng kết đơn hàng
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : priceDetails ? (
          <Box>
            <Box sx={{ mb: 3 }}>
              {priceDetails.itemDetails.map((item, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    {item.productName} {item.variantName ? `(${item.variantName})` : ''} x {item.quantity}
                  </Typography>
                  
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      Đơn giá: ${item.basePrice}
                    </Typography>
                    
                    {item.customizationFees > 0 && (
                      <Typography variant="body2">
                        Phí tùy chỉnh: ${item.customizationFees}
                      </Typography>
                    )}
                    
                    {item.processingFee > 0 && (
                      <Typography variant="body2">
                        Phí xử lý file: ${item.processingFee}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" fontWeight="bold">
                      Thành tiền: ${item.itemTotal.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                </Box>
              ))}
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography>Tạm tính:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography>${priceDetails.subtotal.toFixed(2)}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography>Phí vận chuyển:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography>${priceDetails.shippingFee.toFixed(2)}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="h6">Tổng cộng:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" color="primary">
                    ${priceDetails.total.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        ) : products.length > 0 ? (
          <Typography variant="body2" color="text.secondary">
            Vui lòng nhấn "Tính giá" để xem chi tiết giá đơn hàng.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Chưa có sản phẩm nào được chọn.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Component chính
const CreateOrder = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [activeStep, setActiveStep] = useState(0);
  const [products, setProducts] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Vietnam'
  });
  const [errors, setErrors] = useState({});
  const [note, setNote] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [priceDetails, setPriceDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPhysicalProducts, setHasPhysicalProducts] = useState(false);
  
  // Kiểm tra và cập nhật hasPhysicalProducts
  useEffect(() => {
    // Giả định: tất cả sản phẩm đều là vật lý trong ví dụ này
    // Trong thực tế, bạn sẽ kiểm tra type của sản phẩm
    setHasPhysicalProducts(products.length > 0);
  }, [products]);

  // Các bước trong stepper
  const steps = [
    'Chọn sản phẩm',
    'Tùy chỉnh in/thêu',
    hasPhysicalProducts ? 'Thông tin giao hàng' : null,
    'Xác nhận đơn hàng'
  ].filter(Boolean);

  // Thêm sản phẩm
  const handleAddProduct = (product) => {
    setProducts([...products, product]);
  };

  // Cập nhật số lượng sản phẩm
  const handleUpdateQuantity = (index, quantity) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], quantity };
    setProducts(updatedProducts);
  };

  // Xóa sản phẩm
  const handleRemoveProduct = (index) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  // Cập nhật customizations
  const handleUpdateCustomizations = (productIndex, customizations) => {
    const updatedProducts = [...products];
    updatedProducts[productIndex] = { ...updatedProducts[productIndex], customizations };
    setProducts(updatedProducts);
  };

  // Tính giá đơn hàng
  const calculatePrice = async () => {
    if (products.length === 0) return;
    
    setIsCalculating(true);
    setPriceDetails(null);
    
    try {
      const orderData = {
        lineItems: products,
        shippingAddress: hasPhysicalProducts ? shippingAddress : null,
        hasPhysicalProducts
      };
      
      const response = await orderService.calculateOrderPrice(orderData);
      
      if (response.success) {
        setPriceDetails(response.priceDetails);
      } else {
        enqueueSnackbar(response.message || 'Không thể tính giá đơn hàng', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error calculating price:', error);
      enqueueSnackbar('Lỗi khi tính giá đơn hàng', { variant: 'error' });
    } finally {
      setIsCalculating(false);
    }
  };

  // Xác thực form
  const validateForm = () => {
    const newErrors = {};
    
    if (products.length === 0) {
      newErrors.products = 'Vui lòng chọn ít nhất một sản phẩm';
    }
    
    if (hasPhysicalProducts) {
      if (!shippingAddress.street) {
        newErrors.street = 'Vui lòng nhập địa chỉ đường';
      }
      
      if (!shippingAddress.city) {
        newErrors.city = 'Vui lòng nhập thành phố';
      }
      
      if (!shippingAddress.postalCode) {
        newErrors.postalCode = 'Vui lòng nhập mã bưu điện';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý tiếp tục
  const handleNext = () => {
    if (activeStep === steps.length - 2 && !validateForm()) {
      return;
    }
    
    if (activeStep === steps.length - 1) {
      handleSubmitOrder();
      return;
    }
    
    setActiveStep(activeStep + 1);
  };

  // Xử lý quay lại
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  // Xử lý gửi đơn hàng
  const handleSubmitOrder = async () => {
    if (!validateForm() || !priceDetails) return;
    
    setIsSubmitting(true);
    
    try {
      const orderData = {
        lineItems: products,
        shippingAddress: hasPhysicalProducts ? shippingAddress : null,
        note,
        hasPhysicalProducts
      };
      
      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        enqueueSnackbar('Đặt hàng thành công!', { variant: 'success' });
        navigate(`/orders/${response.orderId}`);
      } else {
        enqueueSnackbar(response.message || 'Đặt hàng thất bại', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      enqueueSnackbar('Lỗi khi đặt hàng', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render component theo từng bước
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <ProductSelection
            onProductSelect={handleAddProduct}
            selectedProducts={products}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveProduct={handleRemoveProduct}
          />
        );
      case 1:
        return (
          <CustomizationForm
            productItems={products}
            onUpdateCustomizations={handleUpdateCustomizations}
          />
        );
      case 2:
        // Bước này chỉ hiển thị nếu có sản phẩm vật lý
        return hasPhysicalProducts ? (
          <ShippingForm
            formData={shippingAddress}
            setFormData={setShippingAddress}
            errors={errors}
          />
        ) : null;
      case 3:
      case 2: // Nếu không có sản phẩm vật lý, bước 3 sẽ là bước 2
        return (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ghi chú đơn hàng
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Ghi chú"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập các yêu cầu đặc biệt hoặc ghi chú cho đơn hàng của bạn"
                />
              </CardContent>
            </Card>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Button
                variant="contained"
                onClick={calculatePrice}
                disabled={products.length === 0 || isCalculating}
                startIcon={isCalculating ? <CircularProgress size={20} /> : null}
              >
                {isCalculating ? 'Đang tính...' : 'Tính giá'}
              </Button>
            </Box>
            
            <OrderSummary
              products={products}
              priceDetails={priceDetails}
              isLoading={isCalculating}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Tạo đơn hàng mới
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Quay lại
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={(activeStep === steps.length - 1 && (!priceDetails || isSubmitting))}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {activeStep === steps.length - 1 ? 'Đặt hàng' : 'Tiếp tục'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateOrder; 