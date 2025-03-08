import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook quản lý trạng thái tìm kiếm, lọc và phân trang
 * @param {Object} options
 * @param {Function} options.fetchData - Hàm gọi API để lấy dữ liệu
 * @param {number} options.defaultRowsPerPage - Số lượng bản ghi trên mỗi trang, mặc định là 10
 * @param {string} options.defaultFilterStatus - Trạng thái lọc mặc định, mặc định là 'all'
 * @returns {Object} Các giá trị và handler cho tìm kiếm, lọc và phân trang
 */
const useSearchFilters = ({
  fetchData,
  defaultRowsPerPage = 10,
  defaultFilterStatus = 'all'
}) => {
  // Quản lý trạng thái tìm kiếm, lọc và phân trang
  const [state, setState] = useState({
    page: 1,
    rowsPerPage: defaultRowsPerPage,
    searchTerm: '',
    filterStatus: defaultFilterStatus,
    isSearching: false
  });
  
  // Refs for managing data loading
  const searchTimeoutRef = useRef(null);
  const isComponentMountedRef = useRef(true);
  
  // Handle unmount
  useEffect(() => {
    isComponentMountedRef.current = true;
    
    return () => {
      isComponentMountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  // Create search parameters object
  const searchParams = {
    page: state.page,
    limit: state.rowsPerPage,
    searchTerm: state.searchTerm,
    status: state.filterStatus,
    sortByApproval: true
  };
  
  // Perform search with debounce
  const performSearch = useCallback(async (forceRefresh = false) => {
    if (!isComponentMountedRef.current || !fetchData) return;
    
    // Cancel previous search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    setState(prev => ({ ...prev, isSearching: true }));
    
    try {
      await fetchData(searchParams, forceRefresh);
    } catch (error) {
      // Error handling is done by the hook calling fetchData
    } finally {
      if (isComponentMountedRef.current) {
        setState(prev => ({ ...prev, isSearching: false }));
      }
    }
  }, [fetchData, searchParams]);
  
  // Create debounced search function
  const debouncedSearch = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => performSearch(false), 800);
  }, [performSearch]);
  
  // Search and filter handlers
  const handleSearchChange = useCallback((event) => {
    setState(prev => ({
      ...prev,
      searchTerm: event.target.value,
      page: 1
    }));
    debouncedSearch();
  }, [debouncedSearch]);
  
  const handleFilterChange = useCallback((event) => {
    setState(prev => ({
      ...prev,
      filterStatus: event.target.value,
      page: 1
    }));
    debouncedSearch();
  }, [debouncedSearch]);
  
  // Pagination handlers
  const handlePageChange = useCallback((event, newPage) => {
    setState(prev => ({ ...prev, page: newPage }));
    debouncedSearch();
  }, [debouncedSearch]);
  
  const handleRowsPerPageChange = useCallback((event) => {
    setState(prev => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 1
    }));
    debouncedSearch();
  }, [debouncedSearch]);
  
  // Force refresh handler
  const handleRefresh = useCallback(async () => {
    return performSearch(true);
  }, [performSearch]);
  
  return {
    ...state,
    searchParams,
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleRefresh,
    performSearch
  };
};

export default useSearchFilters; 