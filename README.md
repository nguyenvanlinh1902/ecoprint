# B2B Manager - Monorepo

Hệ thống quản lý B2B E-commerce được xây dựng theo mô hình Monorepo.

## Cấu trúc dự án

```
B2BManager/
├── packages/               # Thư mục chứa các package 
│   ├── frontend/           # Ứng dụng ReactJS
│   ├── backend/            # API Koa.js 
│   └── shared/             # Thư viện dùng chung
├── package.json            # Root package.json
├── .eslintrc.js            # ESLint config chung
├── .prettierrc             # Prettier config chung
├── tsconfig.json           # TypeScript config chung
└── README.md               # Tài liệu dự án
```

## Công nghệ sử dụng

- **Frontend**: ReactJS, Redux Toolkit, Styled Components
- **Backend**: Koa.js, MongoDB, JWT Authentication
- **Shared**: TypeScript, Utilities, Types
- **DevOps**: Yarn Workspaces, ESLint, Prettier

## Cài đặt

1. Cài đặt Yarn (nếu chưa có)
```bash
npm install -g yarn
```

2. Cài đặt dependencies
```bash
yarn install
```

3. Khởi chạy ứng dụng trong chế độ development
```bash
# Chạy cả frontend và backend
yarn dev

# Chạy riêng frontend
yarn frontend:dev

# Chạy riêng backend
yarn backend:dev
```

## Hướng dẫn phát triển

### Quy tắc chung

- Tuân thủ ESLint và Prettier
- Indent: 2 spaces
- Dòng code không quá 100 ký tự
- Sử dụng dấu chấm phẩy (;) kết thúc câu lệnh
- Sử dụng dấu nháy đơn (') cho string

### Quy tắc đặt tên

- **Components**: PascalCase
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Files**:
  - Components: `ProductList.jsx`
  - Utilities: `formatCurrency.js`
  - Tests: `ProductList.test.js`
  - Styles: `product-list.scss`

### Cấu trúc thư mục Frontend

```
frontend/
├── src/
│   ├── components/             # Shared components
│   │   ├── common/
│   │   └── layout/
│   ├── features/               # Các tính năng chính
│   │   ├── orders/
│   │   ├── shipments/
│   │   ├── catalog/
│   │   ├── billing/
│   │   ├── affiliates/
│   │   └── logistics/
│   ├── hooks/                  # Custom hooks
│   ├── services/               # API services
│   ├── utils/                  # Helper functions
│   ├── constants/              # Các hằng số
│   └── styles/                 # Global styles
```

## Cách đóng góp

1. Tạo branch mới từ `main`
2. Commit theo quy ước Conventional Commits
3. Tạo Pull Request và yêu cầu review code

## Phiên bản

Xem lịch sử phiên bản đầy đủ tại [Changelog](CHANGELOG.md). 