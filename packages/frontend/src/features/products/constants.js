/**
 * Trạng thái sản phẩm
 */
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock'
};

/**
 * Tên hiển thị cho trạng thái sản phẩm
 */
export const PRODUCT_STATUS_LABELS = {
  [PRODUCT_STATUS.ACTIVE]: 'Đang bán',
  [PRODUCT_STATUS.INACTIVE]: 'Ngừng bán',
  [PRODUCT_STATUS.OUT_OF_STOCK]: 'Hết hàng'
};

/**
 * Màu sắc cho trạng thái sản phẩm
 */
export const PRODUCT_STATUS_COLORS = {
  [PRODUCT_STATUS.ACTIVE]: 'success',
  [PRODUCT_STATUS.INACTIVE]: 'danger',
  [PRODUCT_STATUS.OUT_OF_STOCK]: 'warning'
};

/**
 * Danh mục sản phẩm
 */
export const PRODUCT_CATEGORIES = {
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  FURNITURE: 'furniture',
  HOME_APPLIANCES: 'home_appliances',
  BEAUTY: 'beauty',
  SPORTS: 'sports',
  TOYS: 'toys',
  BOOKS: 'books',
  GROCERIES: 'groceries',
  OTHER: 'other'
};

/**
 * Tên hiển thị cho danh mục sản phẩm
 */
export const PRODUCT_CATEGORY_LABELS = {
  [PRODUCT_CATEGORIES.ELECTRONICS]: 'Điện tử',
  [PRODUCT_CATEGORIES.CLOTHING]: 'Thời trang',
  [PRODUCT_CATEGORIES.FURNITURE]: 'Nội thất',
  [PRODUCT_CATEGORIES.HOME_APPLIANCES]: 'Thiết bị gia dụng',
  [PRODUCT_CATEGORIES.BEAUTY]: 'Làm đẹp',
  [PRODUCT_CATEGORIES.SPORTS]: 'Thể thao',
  [PRODUCT_CATEGORIES.TOYS]: 'Đồ chơi',
  [PRODUCT_CATEGORIES.BOOKS]: 'Sách',
  [PRODUCT_CATEGORIES.GROCERIES]: 'Thực phẩm',
  [PRODUCT_CATEGORIES.OTHER]: 'Khác'
};

/**
 * Tùy chọn sắp xếp sản phẩm
 */
export const PRODUCT_SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc'
};

/**
 * Tên hiển thị cho tùy chọn sắp xếp
 */
export const PRODUCT_SORT_LABELS = {
  [PRODUCT_SORT_OPTIONS.NEWEST]: 'Mới nhất',
  [PRODUCT_SORT_OPTIONS.OLDEST]: 'Cũ nhất',
  [PRODUCT_SORT_OPTIONS.PRICE_ASC]: 'Giá tăng dần',
  [PRODUCT_SORT_OPTIONS.PRICE_DESC]: 'Giá giảm dần',
  [PRODUCT_SORT_OPTIONS.NAME_ASC]: 'Tên A-Z',
  [PRODUCT_SORT_OPTIONS.NAME_DESC]: 'Tên Z-A'
};

/**
 * Trạng thái stock
 */
export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock'
};

/**
 * Ngưỡng stock thấp (dưới ngưỡng này sẽ được coi là hàng sắp hết)
 */
export const LOW_STOCK_THRESHOLD = 10; 