# Quản lý sản phẩm (Products Feature)

Module quản lý sản phẩm trong hệ thống B2B Manager cung cấp các chức năng để:
- Hiển thị danh sách sản phẩm với khả năng tìm kiếm, lọc và sắp xếp
- Xem chi tiết thông tin sản phẩm
- Thêm mới sản phẩm
- Chỉnh sửa thông tin sản phẩm
- Xóa sản phẩm

## Cấu trúc thư mục

```
products/
├── components/            # Các components dùng trong module
│   ├── CategoryLabel.js   # Hiển thị nhãn danh mục
│   ├── ProductStatusBadge.js # Badge trạng thái sản phẩm
│   ├── StockStatusBadge.js   # Badge trạng thái tồn kho
│   └── index.js           # Export các components
├── hooks/                 # Custom hooks
│   ├── useProducts.js     # Hook quản lý thao tác với sản phẩm
│   └── index.js           # Export các hooks
├── pages/                 # Các trang
│   ├── ProductListPage.js   # Trang danh sách sản phẩm
│   ├── ProductFormPage.js   # Trang thêm/sửa sản phẩm 
│   └── ProductDetailPage.js # Trang chi tiết sản phẩm
├── services/              # Services giao tiếp với API
│   └── index.js           # Service quản lý API calls
├── styles/                # CSS/SCSS styles
│   ├── product-list.scss    # Style cho trang danh sách
│   ├── product-form.scss    # Style cho form thêm/sửa
│   └── product-detail.scss  # Style cho trang chi tiết
├── constants.js           # Constants và enums
├── productSlice.js        # Redux slice
├── index.js               # Entry point, export tất cả
└── README.md              # Documentation
```

## Cách sử dụng

### Import các components

```jsx
import { 
  ProductListPage, 
  ProductFormPage,
  ProductDetailPage,
  ProductStatusBadge
} from 'features/products';
```

### Sử dụng hooks

```jsx
import { useProducts } from 'features/products';

function MyComponent() {
  const { 
    products, 
    loading, 
    error, 
    getProducts,
    createProduct 
  } = useProducts();
  
  // ...
}
```

### Truy cập services trực tiếp

```jsx
import { productService } from 'features/products';

// Lấy danh sách sản phẩm
productService.getProducts({ category: 'electronics' })
  .then(products => {
    // Xử lý dữ liệu
  });
```

### Sử dụng constants

```jsx
import { 
  PRODUCT_STATUS, 
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS 
} from 'features/products';

// Sử dụng trong component
const categoryName = PRODUCT_CATEGORY_LABELS[product.category];
```

## Thông tin kỹ thuật

### Dữ liệu sản phẩm

Cấu trúc dữ liệu sản phẩm:

```js
{
  id: String,             // ID sản phẩm
  name: String,           // Tên sản phẩm
  description: String,    // Mô tả
  price: Number,          // Giá
  stockQuantity: Number,  // Số lượng tồn kho
  sku: String,            // Mã SKU
  category: String,       // Danh mục
  status: String,         // Trạng thái
  imageUrl: String,       // URL ảnh
  imagePath: String,      // Đường dẫn ảnh trong storage
  attributes: [           // Thuộc tính bổ sung
    {
      name: String,       // Tên thuộc tính
      value: String       // Giá trị
    }
  ],
  createdAt: Timestamp,   // Thời gian tạo
  updatedAt: Timestamp    // Thời gian cập nhật
}
```

### Redux State

```js
{
  products: {
    products: Array,        // Danh sách sản phẩm
    product: Object,        // Chi tiết sản phẩm đang xem
    loading: Boolean,       // Trạng thái loading
    error: String,          // Thông báo lỗi
    success: Boolean,       // Kết quả thao tác
    filters: {              // Bộ lọc
      category: String,     // Lọc theo danh mục
      status: String,       // Lọc theo trạng thái
      sort: String          // Sắp xếp
    }
  }
}
``` 