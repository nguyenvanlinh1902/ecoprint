import React from 'react';
import PropTypes from 'prop-types';
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS } from '../constants';

/**
 * Component hiển thị nhãn danh mục sản phẩm
 */
const CategoryLabel = ({ category }) => {
  // Lấy tên hiển thị dựa vào mã danh mục
  const label = PRODUCT_CATEGORY_LABELS[category] || 'Danh mục khác';
  
  return (
    <span className="category-label">
      {label}
    </span>
  );
};

CategoryLabel.propTypes = {
  /**
   * Mã danh mục sản phẩm
   */
  category: PropTypes.oneOf(Object.values(PRODUCT_CATEGORIES)).isRequired
};

export default CategoryLabel; 