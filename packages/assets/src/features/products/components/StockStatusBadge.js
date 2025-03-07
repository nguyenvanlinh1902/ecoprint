import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'react-bootstrap';
import { STOCK_STATUS, LOW_STOCK_THRESHOLD } from '../constants';

/**
 * Component hiển thị badge trạng thái tồn kho
 */
const StockStatusBadge = ({ stockQuantity }) => {
  // Xác định trạng thái tồn kho
  let status = STOCK_STATUS.IN_STOCK;
  let label = `Còn hàng (${stockQuantity})`;
  let variant = 'success';
  
  if (stockQuantity <= 0) {
    status = STOCK_STATUS.OUT_OF_STOCK;
    label = 'Hết hàng';
    variant = 'danger';
  } else if (stockQuantity <= LOW_STOCK_THRESHOLD) {
    status = STOCK_STATUS.LOW_STOCK;
    label = `Sắp hết (${stockQuantity})`;
    variant = 'warning';
  }
  
  return (
    <Badge bg={variant} className="stock-status-badge">
      {label}
    </Badge>
  );
};

StockStatusBadge.propTypes = {
  /**
   * Số lượng tồn kho
   */
  stockQuantity: PropTypes.number.isRequired
};

export default StockStatusBadge; 