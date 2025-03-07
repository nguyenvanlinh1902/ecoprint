import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, resetProductState, deleteProduct } from '../productSlice';
import { FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import '../styles/product-detail.scss';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading, error } = useSelector(state => state.products);
  
  useEffect(() => {
    dispatch(fetchProductById(productId));
    
    // Cleanup khi unmount
    return () => {
      dispatch(resetProductState());
    };
  }, [dispatch, productId]);
  
  // Hàm format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };
  
  // Xử lý xóa sản phẩm với xác nhận
  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      dispatch(deleteProduct(productId))
        .unwrap()
        .then(() => {
          navigate('/san-pham/danh-sach');
        });
    }
  };
  
  // Hiển thị trạng thái dưới dạng badge
  const renderStatusBadge = (status) => {
    let badgeClass = 'badge ';
    
    switch (status) {
      case 'active':
        badgeClass += 'badge-success';
        return <span className={badgeClass}>Đang bán</span>;
      case 'inactive':
        badgeClass += 'badge-secondary';
        return <span className={badgeClass}>Ngừng bán</span>;
      case 'out_of_stock':
        badgeClass += 'badge-danger';
        return <span className={badgeClass}>Hết hàng</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };
  
  // Đặt tên hiển thị cho danh mục
  const getCategoryDisplayName = (category) => {
    const categories = {
      'electronics': 'Điện tử',
      'clothing': 'Quần áo',
      'home': 'Đồ gia dụng',
      'books': 'Sách'
    };
    
    return categories[category] || category;
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <h2>Đã xảy ra lỗi!</h2>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/san-pham/danh-sach')}
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }
  
  // Không tìm thấy sản phẩm
  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <h2>Không tìm thấy sản phẩm</h2>
          <p>Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/san-pham/danh-sach')}
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="product-detail-page">
      <div className="page-header">
        <button 
          className="btn btn-back" 
          onClick={() => navigate('/san-pham/danh-sach')}
        >
          <FaArrowLeft /> Quay lại
        </button>
        <h1>Chi tiết sản phẩm</h1>
        
        <div className="page-actions">
          <Link to={`/san-pham/chinh-sua/${productId}`} className="btn btn-edit">
            <FaEdit /> Chỉnh sửa
          </Link>
          <button onClick={handleDelete} className="btn btn-delete">
            <FaTrash /> Xóa
          </button>
        </div>
      </div>
      
      <div className="product-detail-container">
        <div className="product-image-container">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="product-image" 
            />
          ) : (
            <div className="no-image-placeholder">
              <p>Không có ảnh</p>
            </div>
          )}
        </div>
        
        <div className="product-info">
          <div className="product-header">
            <h2 className="product-name">{product.name}</h2>
            {renderStatusBadge(product.status)}
          </div>
          
          <div className="product-price">
            {formatCurrency(product.price)}
          </div>
          
          <div className="product-meta">
            <div className="meta-item">
              <span className="meta-label">SKU:</span>
              <span className="meta-value">{product.sku || 'Chưa có mã SKU'}</span>
            </div>
            
            <div className="meta-item">
              <span className="meta-label">Danh mục:</span>
              <span className="meta-value">{getCategoryDisplayName(product.category)}</span>
            </div>
            
            <div className="meta-item">
              <span className="meta-label">Tồn kho:</span>
              <span className="meta-value">{product.stock} sản phẩm</span>
            </div>
          </div>
          
          {product.description && (
            <div className="product-description">
              <h3>Mô tả</h3>
              <p>{product.description}</p>
            </div>
          )}
          
          {product.attributes && product.attributes.length > 0 && (
            <div className="product-attributes">
              <h3>Thuộc tính sản phẩm</h3>
              <ul className="attributes-list">
                {product.attributes.map((attr, index) => (
                  <li key={index} className="attribute-item">
                    <span className="attribute-name">{attr.key}:</span>
                    <span className="attribute-value">{attr.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 