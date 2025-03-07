import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchOrders, 
  fetchOrderById, 
  createOrder, 
  updateOrder, 
  deleteOrder,
  setFilters,
  setPagination,
  resetFilters,
  clearOrderState
} from '../orderSlice';

/**
 * Custom hook for working with orders
 * @returns {Object} Order methods and state
 */
export const useOrders = () => {
  const dispatch = useDispatch();
  const { 
    orders, 
    order, 
    loading, 
    error,
    totalCount,
    filters,
    pagination
  } = useSelector(state => state.orders);

  // Load orders with current filters and pagination
  const loadOrders = useCallback((options = {}) => {
    return dispatch(fetchOrders(options));
  }, [dispatch]);

  // Get a specific order by ID
  const getOrder = useCallback((orderId) => {
    return dispatch(fetchOrderById(orderId));
  }, [dispatch]);

  // Create a new order
  const addOrder = useCallback((orderData) => {
    return dispatch(createOrder(orderData));
  }, [dispatch]);

  // Update an existing order
  const editOrder = useCallback((orderId, orderData) => {
    return dispatch(updateOrder({ orderId, orderData }));
  }, [dispatch]);

  // Delete an order
  const removeOrder = useCallback((orderId) => {
    return dispatch(deleteOrder(orderId));
  }, [dispatch]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    dispatch(setPagination(newPagination));
  }, [dispatch]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  // Clear current order details
  const clearOrder = useCallback(() => {
    dispatch(clearOrderState());
  }, [dispatch]);

  return {
    // State
    orders,
    order,
    loading,
    error,
    totalCount,
    filters,
    pagination,
    
    // Actions
    loadOrders,
    getOrder,
    addOrder,
    editOrder,
    removeOrder,
    updateFilters,
    updatePagination,
    clearFilters,
    clearOrder
  };
};

export default useOrders; 