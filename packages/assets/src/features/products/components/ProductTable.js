import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import '../styles/product-table.scss';

/**
 * Component hiển thị danh sách sản phẩm dưới dạng bảng
 */
const ProductTable = ({ 
  products, 
  onDelete, 
  loading,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onSort
}) => {
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Xử lý việc thay đổi trường sắp xếp
  const handleSort = (field) => {
    const newSortOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newSortOrder);
    
    if (onSort) {
      onSort(field, newSortOrder);
    }
  };

  // Hiển thị biểu tượng sắp xếp
  const renderSortIcon = (field) => {
    if (field !== sortField) {
      return <FaSort className="sort-icon" />;
    }
    return sortOrder === 'asc' ? <FaSortUp className="sort-icon" /> : <FaSortDown className="sort-icon" />;
  };

  // Định dạng giá tiền
  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  // Hiển thị trạng thái sản phẩm
  const renderStatus = (status) => {
    let badgeClass = '';
    let statusText = '';

    switch (status) {
      case 'active':
        badgeClass = 'badge-success';
        statusText = 'Đang bán';
        break;
      case 'inactive':
        badgeClass = 'badge-secondary';
        statusText = 'Tạm ngừng';
        break;
      case 'out_of_stock':
        badgeClass = 'badge-warning';
        statusText = 'Hết hàng';
        break;
      default:
        badgeClass = 'badge-info';
        statusText = status;
    }

    return <span className={`status-badge ${badgeClass}`}>{statusText}</span>;
  };

  // Hiển thị trạng thái tồn kho
  const renderStock = (quantity) => {
    if (quantity <= 0) {
      return <span className="stock-badge out-of-stock">Hết hàng</span>;
    } else if (quantity <= 10) {
      return <span className="stock-badge low-stock">Sắp hết ({quantity})</span>;
    } else {
      return <span className="stock-badge in-stock">Còn hàng ({quantity})</span>;
    }
  };

  // Tính toán số lượng trang
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="product-table-wrapper">
      {loading ? (
        <div className="product-table-loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="product-table-empty">
          <p>Không có sản phẩm nào được tìm thấy</p>
        </div>
      ) : (
        <>
          <div className="product-table-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th className="product-image">Hình ảnh</th>
                  <th 
                    className="product-name sortable" 
                    onClick={() => handleSort('name')}
                  >
                    <span>Tên sản phẩm</span>
                    {renderSortIcon('name')}
                  </th>
                  <th className="product-sku">SKU</th>
                  <th 
                    className="product-category sortable" 
                    onClick={() => handleSort('category')}
                  >
                    <span>Danh mục</span>
                    {renderSortIcon('category')}
                  </th>
                  <th 
                    className="product-price sortable" 
                    onClick={() => handleSort('price')}
                  >
                    <span>Giá</span>
                    {renderSortIcon('price')}
                  </th>
                  <th 
                    className="product-stock sortable" 
                    onClick={() => handleSort('stockQuantity')}
                  >
                    <span>Tồn kho</span>
                    {renderSortIcon('stockQuantity')}
                  </th>
                  <th 
                    className="product-status sortable" 
                    onClick={() => handleSort('status')}
                  >
                    <span>Trạng thái</span>
                    {renderSortIcon('status')}
                  </th>
                  <th className="product-actions">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="product-image">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} />
                      ) : (
                        <div className="image-placeholder">
                          <span>{product.name.charAt(0)}</span>
                        </div>
                      )}
                    </td>
                    <td className="product-name">
                      <Link to={`/san-pham/chi-tiet/${product.id}`} className="product-name-link">
                        {product.name}
                      </Link>
                    </td>
                    <td className="product-sku">{product.sku}</td>
                    <td className="product-category">
                      {product.category === 'electronics' && 'Điện tử'}
                      {product.category === 'fashion' && 'Thời trang'}
                      {product.category === 'home' && 'Gia dụng'}
                      {product.category === 'books' && 'Sách'}
                      {product.category === 'food' && 'Thực phẩm'}
                      {!['electronics', 'fashion', 'home', 'books', 'food'].includes(product.category) && product.category}
                    </td>
                    <td className="product-price">{formatCurrency(product.price)}</td>
                    <td className="product-stock">
                      {renderStock(product.stockQuantity)}
                    </td>
                    <td className="product-status">
                      {renderStatus(product.status)}
                    </td>
                    <td className="product-actions">
                      <div className="action-buttons">
                        <Link to={`/san-pham/chi-tiet/${product.id}`} className="action-button view-button" title="Xem chi tiết">
                          <FaEye />
                        </Link>
                        <Link to={`/san-pham/chinh-sua/${product.id}`} className="action-button edit-button" title="Chỉnh sửa">
                          <FaEdit />
                        </Link>
                        <button 
                          className="action-button delete-button" 
                          onClick={() => onDelete(product.id, product.name)}
                          title="Xóa sản phẩm"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="product-table-pagination">
              <button 
                className="pagination-button" 
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                Trước
              </button>
              
              <div className="pagination-pages">
                {[...Array(totalPages).keys()].map(page => (
                  <button 
                    key={page + 1}
                    className={`pagination-page ${currentPage === page + 1 ? 'active' : ''}`}
                    onClick={() => onPageChange(page + 1)}
                  >
                    {page + 1}
                  </button>
                ))}
              </div>
              
              <button 
                className="pagination-button" 
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                Tiếp
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

ProductTable.propTypes = {
  products: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  totalItems: PropTypes.number,
  currentPage: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func,
  onSort: PropTypes.func
};

ProductTable.defaultProps = {
  loading: false,
  totalItems: 0,
  currentPage: 1,
  pageSize: 10
};

export default ProductTable; 