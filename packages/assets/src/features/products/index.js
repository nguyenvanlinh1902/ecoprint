// Pages
import ProductListPage from './pages/ProductListPage';
import ProductFormPage from './pages/ProductFormPage';
import ProductDetailPage from './pages/ProductDetailPage';

// Components
import {
  ProductStatusBadge,
  StockStatusBadge,
  CategoryLabel
} from './components';

// Services
import { productService } from './services';

// Hooks
import { useProducts } from './hooks';

// Redux
import { productReducer } from './productSlice';

// Constants
import {
  PRODUCT_STATUS,
  PRODUCT_STATUS_LABELS,
  PRODUCT_STATUS_COLORS,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_SORT_OPTIONS,
  PRODUCT_SORT_LABELS,
  STOCK_STATUS,
  LOW_STOCK_THRESHOLD
} from './constants';

// Export các components
export {
  // Pages
  ProductListPage,
  ProductFormPage,
  ProductDetailPage,
  
  // Components
  ProductStatusBadge,
  StockStatusBadge,
  CategoryLabel,
  
  // Services
  productService,
  
  // Hooks
  useProducts,
  
  // Redux
  productReducer,
  
  // Constants
  PRODUCT_STATUS,
  PRODUCT_STATUS_LABELS,
  PRODUCT_STATUS_COLORS,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_SORT_OPTIONS,
  PRODUCT_SORT_LABELS,
  STOCK_STATUS,
  LOW_STOCK_THRESHOLD
}; 