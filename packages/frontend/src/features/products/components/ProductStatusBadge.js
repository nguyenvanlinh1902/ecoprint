import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'react-bootstrap';
import { PRODUCT_STATUS, PRODUCT_STATUS_LABELS, PRODUCT_STATUS_COLORS } from '../constants';

/**
 * Component hiển thị badge trạng thái sản phẩm
 */
const ProductStatusBadge = ({ status }) => {
  // Lấy variant màu dựa vào trạng thái
  const variant = PRODUCT_STATUS_COLORS[status] || 'secondary';
  
  // Lấy tên hiển thị dựa vào trạng thái
  const label = PRODUCT_STATUS_LABELS[status] || 'Không xác định';
  
  return (
    <Badge bg={variant} className="product-status-badge">
      {label}
    </Badge>
  );
};

ProductStatusBadge.propTypes = {
  /**
   * Trạng thái sản phẩm
   */
  status: PropTypes.oneOf(Object.values(PRODUCT_STATUS)).isRequired
};

export default ProductStatusBadge; 