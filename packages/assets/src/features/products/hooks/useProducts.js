import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProducts,
  fetchProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  resetProductState,
  setProductFilters
} from '../productSlice';

/**
 * Custom hook để quản lý các thao tác với sản phẩm
 * @returns {Object} Các state và function cho quản lý sản phẩm
 */
const useProducts = () => {
  const dispatch = useDispatch();
  const {
    products,
    product,
    loading,
    error,
    success,
    filters
  } = useSelector((state) => state.products);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  /**
   * Lấy danh sách sản phẩm
   * @param {Object} options - Tùy chọn lọc và sắp xếp
   */
  const getProducts = useCallback((options = {}) => {
    dispatch(fetchProducts(options));
  }, [dispatch]);

  /**
   * Lấy thông tin sản phẩm theo ID
   * @param {string} productId - ID sản phẩm
   */
  const getProductById = useCallback((productId) => {
    dispatch(fetchProductById(productId));
  }, [dispatch]);

  /**
   * Thêm sản phẩm mới
   * @param {Object} productData - Dữ liệu sản phẩm
   * @param {File} image - Ảnh sản phẩm (optional)
   */
  const createProduct = useCallback((productData, image) => {
    dispatch(addProduct({ productData, image }));
  }, [dispatch]);

  /**
   * Cập nhật thông tin sản phẩm
   * @param {string} productId - ID sản phẩm
   * @param {Object} productData - Dữ liệu cập nhật
   * @param {File} image - Ảnh mới (optional)
   */
  const editProduct = useCallback((productId, productData, image) => {
    dispatch(updateProduct({ productId, productData, image }));
  }, [dispatch]);

  /**
   * Xóa sản phẩm
   * @param {string} productId - ID sản phẩm
   */
  const removeProduct = useCallback((productId) => {
    dispatch(deleteProduct(productId));
  }, [dispatch]);

  /**
   * Reset trạng thái sản phẩm
   */
  const resetState = useCallback(() => {
    dispatch(resetProductState());
  }, [dispatch]);

  /**
   * Cập nhật bộ lọc sản phẩm
   * @param {Object} newFilters - Bộ lọc mới
   */
  const updateFilters = useCallback((newFilters) => {
    dispatch(setProductFilters(newFilters));
  }, [dispatch]);

  /**
   * Lọc sản phẩm theo từ khóa tìm kiếm
   */
  useEffect(() => {
    if (!products || !searchTerm.trim()) {
      setFilteredProducts(products || []);
      return;
    }

    const lowercaseSearchTerm = searchTerm.toLowerCase().trim();
    const filtered = products.filter(product => {
      return (
        (product.name && product.name.toLowerCase().includes(lowercaseSearchTerm)) ||
        (product.sku && product.sku.toLowerCase().includes(lowercaseSearchTerm)) ||
        (product.description && product.description.toLowerCase().includes(lowercaseSearchTerm))
      );
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  return {
    // State
    products,
    product,
    loading,
    error,
    success,
    filters,
    searchTerm,
    filteredProducts,
    
    // Actions
    getProducts,
    getProductById,
    createProduct,
    editProduct,
    removeProduct,
    resetState,
    updateFilters,
    setSearchTerm
  };
};

export default useProducts; 