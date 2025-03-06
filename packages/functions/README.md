# B2B Manager - Firebase Functions

Module cloud functions cho ứng dụng B2B Manager. Module này cung cấp API RESTful và xử lý các Cloud Functions.

## Cài đặt môi trường phát triển

### Yêu cầu hệ thống

- Node.js v16+ (khuyên dùng v20)
- Yarn v1.22+
- Firebase CLI: `npm install -g firebase-tools`

### Các bước thiết lập

1. **Đăng nhập vào Firebase:**

```bash
firebase login
```

2. **Cài đặt dependencies:**

```bash
yarn install
```

3. **Thiết lập cấu hình local:**

```bash
yarn setup-local
```

Script trên sẽ tạo các file cấu hình `.runtimeConfig.json` và `serviceAccount.json` từ các file mẫu.

4. **Cấu hình Service Account:**

- Đi đến [Firebase Console](https://console.firebase.google.com/) > Project Settings > Service accounts
- Click "Generate new private key"
- Lưu file JSON tải về và sao chép nội dung vào file `serviceAccount.json`

5. **Cấu hình Runtime:**

Mở file `.runtimeConfig.json` và cập nhật các thông số:

```json
{
  "firebase": {
    "databaseURL": "https://your-project-id.firebaseio.com",
    "storageBucket": "your-project-id.appspot.com"
  },
  "api": {
    "port": 5001,
    "host": "localhost"
  },
  "cors": {
    "origin": "http://localhost:3000"
  },
  "environment": "development"
}
```

## Chạy ứng dụng

### Phát triển

Bạn có hai cách để chạy ứng dụng trong môi trường phát triển:

#### 1. Sử dụng nodemon (recommended)

```bash
yarn dev
```

Server sẽ tự động khởi động lại khi có thay đổi code.

#### 2. Sử dụng Firebase Emulator

```bash
yarn serve
```

Sử dụng Firebase Emulator để mô phỏng môi trường Cloud Functions.

### Production

Để deploy lên Firebase:

```bash
yarn deploy
```

## Cấu trúc dự án

```
functions/
├── src/                      # Mã nguồn
│   ├── api/                  # API routes
│   ├── repositories/         # Data access layer
│   ├── services/             # Business logic
│   ├── utils/                # Utilities
│   └── index.js              # Entry point
├── .runtimeConfig.json       # Cấu hình runtime (local only)
├── serviceAccount.json       # Service account key (local only)
└── package.json              # Dependencies
```

## API Endpoints

### Orders

- `GET /orders` - Lấy tất cả đơn hàng
- `GET /orders/:id` - Lấy đơn hàng theo ID
- `POST /orders` - Tạo đơn hàng mới
- `PUT /orders/:id/status` - Cập nhật trạng thái đơn hàng
- `DELETE /orders/:id` - Xóa đơn hàng

### Products

- `GET /products` - Lấy tất cả sản phẩm (hỗ trợ query params: category, type, search)
- `GET /products/:id` - Lấy sản phẩm theo ID
- `POST /products` - Tạo sản phẩm mới
- `PUT /products/:id` - Cập nhật sản phẩm
- `DELETE /products/:id` - Xóa sản phẩm

### Billing

- `GET /billing/balance` - Lấy số dư tài khoản (query param: userId)
- `GET /billing/transactions` - Lấy lịch sử giao dịch (query params: userId, type, limit)
- `POST /billing/topup` - Nạp tiền vào tài khoản
- `POST /billing/withdraw` - Rút tiền từ tài khoản

## Troubleshooting

### Không thể kết nối tới Firebase

Kiểm tra file `serviceAccount.json` và đảm bảo bạn đã cung cấp thông tin Service Account hợp lệ.

### CORS Error

Kiểm tra cấu hình CORS trong `.runtimeConfig.json` và đảm bảo đã cấu hình đúng `origin` phù hợp với URL của frontend.

### Lỗi "Cannot find module"

Nếu gặp lỗi khi chạy, hãy thử:

```bash
yarn install --force
``` 