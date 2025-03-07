import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, addProduct, updateProduct, resetProductState } from '../productSlice';
import { FaSave, FaUpload, FaArrowLeft } from 'react-icons/fa';
import '../styles/product-form.scss';

const ProductFormPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading, error, success } = useSelector(state => state.products);
  
  // State cho form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    category: '',
    status: 'active',
    attributes: []
  });
  
  // State cho ảnh
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // State cho thuộc tính động
  const [newAttribute, setNewAttribute] = useState({ key: '', value: '' });
  
  // Chế độ chỉnh sửa hay thêm mới
  const isEditMode = !!productId;
  
  // Reset state khi unmount
  useEffect(() => {
    return () => {
      dispatch(resetProductState());
    };
  }, [dispatch]);
  
  // Lấy dữ liệu sản phẩm khi ở chế độ chỉnh sửa
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchProductById(productId));
    }
  }, [dispatch, isEditMode, productId]);
  
  // Điền dữ liệu vào form khi có sản phẩm
  useEffect(() => {
    if (isEditMode && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        sku: product.sku || '',
        category: product.category || '',
        status: product.status || 'active',
        attributes: product.attributes || []
      });
      
      if (product.imageUrl) {
        setImagePreview(product.imageUrl);
      }
    }
  }, [isEditMode, product]);
  
  // Chuyển hướng sau khi thành công
  useEffect(() => {
    if (success) {
      navigate('/san-pham/danh-sach');
    }
  }, [success, navigate]);
  
  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  // Xử lý thay đổi ảnh
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setImage(selectedImage);
      
      // Tạo URL xem trước
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedImage);
    }
  };
  
  // Xử lý thay đổi thuộc tính mới
  const handleAttributeChange = (e) => {
    const { name, value } = e.target;
    setNewAttribute(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Thêm thuộc tính mới
  const addAttribute = () => {
    if (newAttribute.key.trim() && newAttribute.value.trim()) {
      setFormData(prev => ({
        ...prev,
        attributes: [...prev.attributes, { ...newAttribute }]
      }));
      setNewAttribute({ key: '', value: '' });
    }
  };
  
  // Xóa thuộc tính
  const removeAttribute = (index) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };
  
  // Xử lý gửi form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Chuyển đổi giá và tồn kho thành số
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10)
    };
    
    if (isEditMode) {
      dispatch(updateProduct({ productId, productData, image }));
    } else {
      dispatch(addProduct({ productData, image }));
    }
  };
  
  return (
    <div className="product-form-page">
      <div className="page-header">
        <button 
          className="btn btn-back" 
          onClick={() => navigate('/san-pham/danh-sach')}
        >
          <FaArrowLeft /> Quay lại
        </button>
        <h1>{isEditMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h1>
      </div>
      
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-layout">
          <div className="form-main">
            <div className="form-group">
              <label htmlFor="name">Tên sản phẩm *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả sản phẩm"
                rows="5"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Giá (VNĐ) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Nhập giá sản phẩm"
                  min="0"
                  step="1000"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="stock">Số lượng tồn kho *</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="Nhập số lượng tồn kho"
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sku">Mã SKU</label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Nhập mã SKU"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Danh mục *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  <option value="electronics">Điện tử</option>
                  <option value="clothing">Quần áo</option>
                  <option value="home">Đồ gia dụng</option>
                  <option value="books">Sách</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Trạng thái *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="active">Đang bán</option>
                <option value="inactive">Ngừng bán</option>
                <option value="out_of_stock">Hết hàng</option>
              </select>
            </div>
            
            <div className="form-section">
              <h3>Thuộc tính sản phẩm</h3>
              
              <div className="attributes-list">
                {formData.attributes.map((attr, index) => (
                  <div key={index} className="attribute-item">
                    <div className="attribute-name">{attr.key}:</div>
                    <div className="attribute-value">{attr.value}</div>
                    <button 
                      type="button" 
                      className="btn-remove" 
                      onClick={() => removeAttribute(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="add-attribute">
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      name="key"
                      value={newAttribute.key}
                      onChange={handleAttributeChange}
                      placeholder="Tên thuộc tính"
                    />
                  </div>
                  
                  <div className="form-group">
                    <input
                      type="text"
                      name="value"
                      value={newAttribute.value}
                      onChange={handleAttributeChange}
                      placeholder="Giá trị"
                    />
                  </div>
                  
                  <button 
                    type="button" 
                    className="btn btn-add-attribute" 
                    onClick={addAttribute}
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-sidebar">
            <div className="image-upload">
              <h3>Ảnh sản phẩm</h3>
              
              <div className="image-preview">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" />
                ) : (
                  <div className="upload-placeholder">
                    <FaUpload />
                    <p>Chọn ảnh để tải lên</p>
                  </div>
                )}
              </div>
              
              <input
                type="file"
                id="productImage"
                accept="image/*"
                onChange={handleImageChange}
              />
              <label htmlFor="productImage" className="btn btn-upload">
                <FaUpload /> Tải ảnh lên
              </label>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-cancel" 
            onClick={() => navigate('/san-pham/danh-sach')}
          >
            Hủy
          </button>
          <button type="submit" className="btn btn-save" disabled={loading}>
            {loading ? 'Đang xử lý...' : (
              <>
                <FaSave /> {isEditMode ? 'Cập nhật' : 'Tạo sản phẩm'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage; 