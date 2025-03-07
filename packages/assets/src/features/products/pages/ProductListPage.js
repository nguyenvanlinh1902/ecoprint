import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts, deleteProduct } from '../productSlice';
import { FaPlus, FaSearch, FaFilter, FaFileImport } from 'react-icons/fa';
import ProductTable from '../components/ProductTable';
import ProductImporter from '../components/ProductImporter';
import '../styles/product-list.scss';

const ProductListPage = () => {
  const dispatch = useDispatch();
  const { products, loading, error, totalItems } = useSelector(state => state.products);
  
  // State cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [filterData, setFilterData] = useState({
    category: '',
    status: '',
    sort: 'newest',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showImporter, setShowImporter] = useState(false);
  
  // Lấy danh sách sản phẩm khi component mount hoặc filter thay đổi
  useEffect(() => {
    dispatch(fetchProducts({ 
      category: filterData.category, 
      status: filterData.status,
      sort: filterData.sort,
      page: currentPage,
      limit: pageSize
    }));
  }, [dispatch, filterData.category, filterData.status, filterData.sort, currentPage, pageSize]);
  
  // Xử lý tìm kiếm
  const filteredProducts = products?.filter(product => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(term) ||
      product.sku?.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term)
    );
  });
  
  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterData(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi bộ lọc
  };
  
  // Xử lý reset bộ lọc
  const resetFilters = () => {
    setFilterData({
      category: '',
      status: '',
      sort: 'newest'
    });
    setSearchTerm('');
    setCurrentPage(1);
  };
  
  // Xử lý xóa sản phẩm
  const handleDeleteProduct = (productId, productName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}"?`)) {
      dispatch(deleteProduct(productId));
    }
  };
  
  // Xử lý phân trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Xử lý sắp xếp
  const handleSort = (field, order) => {
    let sortValue = '';
    
    switch(field) {
      case 'name':
        sortValue = order === 'asc' ? 'name_asc' : 'name_desc';
        break;
      case 'price':
        sortValue = order === 'asc' ? 'price_asc' : 'price_desc';
        break;
      case 'createdAt':
        sortValue = order === 'asc' ? 'oldest' : 'newest';
        break;
      default:
        sortValue = 'newest';
    }
    
    setFilterData(prev => ({
      ...prev,
      sort: sortValue
    }));
  };
  
  // Đóng form nhập hàng loạt và refresh danh sách sản phẩm
  const handleImportComplete = (results) => {
    if (results && results.success > 0) {
      dispatch(fetchProducts({ 
        category: filterData.category, 
        status: filterData.status,
        sort: filterData.sort 
      }));
    }
    setShowImporter(false);
  };
  
  return (
    <div className="product-list-page">
      <div className="page-header">
        <h1>Quản lý sản phẩm</h1>
        <div className="page-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowImporter(!showImporter)}
          >
            <FaFileImport /> Import CSV
          </button>
          <Link to="/san-pham/them-moi" className="btn btn-primary">
            <FaPlus /> Thêm sản phẩm
          </Link>
        </div>
      </div>
      
      {showImporter ? (
        <ProductImporter onComplete={handleImportComplete} />
      ) : (
        <>
          <div className="filters-section">
            <div className="search-group">
              <FaSearch />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              <div className="filter-group">
                <label htmlFor="category">Danh mục:</label>
                <select
                  id="category"
                  name="category"
                  value={filterData.category}
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả</option>
                  <option value="electronics">Điện tử</option>
                  <option value="fashion">Thời trang</option>
                  <option value="home">Đồ gia dụng</option>
                  <option value="books">Sách</option>
                  <option value="food">Thực phẩm</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="status">Trạng thái:</label>
                <select
                  id="status"
                  name="status"
                  value={filterData.status}
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả</option>
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                  <option value="out_of_stock">Hết hàng</option>
                </select>
              </div>
              
              <button className="btn-filter" onClick={resetFilters}>
                <FaFilter /> Đặt lại
              </button>
            </div>
          </div>
          
          <ProductTable
            products={filteredProducts || []}
            onDelete={handleDeleteProduct}
            loading={loading}
            error={error}
            totalItems={totalItems || filteredProducts?.length || 0}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onSort={handleSort}
          />
        </>
      )}
    </div>
  );
};

export default ProductListPage; 