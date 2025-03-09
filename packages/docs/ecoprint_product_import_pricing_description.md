# EcoPrint - Mô tả hệ thống nhập sản phẩm và tính giá đơn hàng

## 1. Tổng quan hệ thống

EcoPrint là một nền tảng thương mại điện tử chuyên về dịch vụ in ấn theo yêu cầu và cho thuê sản phẩm. Hệ thống hiện tại bao gồm các module và tính năng chính:

- Quản lý tài khoản người dùng và xác thực
- Hệ thống credit (tiền điện tử nội bộ) cho thanh toán
- Quản lý sản phẩm (vật lý và kỹ thuật số)
- Quản lý đơn hàng với tính năng tính giá tự động
- Dịch vụ in ấn: DTF (Direct to Film), DTG (Direct to Garment), Thêu (Embroidery)
- Xử lý và thiết kế file
- Hệ thống cho thuê sản phẩm

## 2. Cấu trúc sản phẩm

### 2.1 Phân loại sản phẩm

Sản phẩm trong hệ thống được phân thành các nhóm chính:

1. **Sản phẩm kỹ thuật số (Digital Products)**
   - File thiết kế thêu 3D (3D Custom Text Puff Embroidery)
   - File thiết kế thêu logo (Custom Embroidery Logo Digitizing)
   - File thêu Outline (Custom Outline Embroidery)
   - File thêu chân dung/thú cưng (Custom Pets/People Portrait Embroidery)

2. **Sản phẩm vật lý (Physical Products)**
   - Áo thun thêu (Embroidered T-shirts)
   - Áo hoodie thêu (Embroidered Hoodies)
   - Áo sweatshirt thêu (Embroidered Sweatshirts)
   - Và các sản phẩm vật lý khác...

3. **Phí dịch vụ (Service Fees)**
   - Phí in vị trí đặc biệt (Special Location)
   - Phí in vị trí trung tâm lớn (Large Center)
   - Phí in tay áo (Left/Right Sleeve)
   - Phí xử lý file DTG/DTF/EMB
   - Và các phí dịch vụ khác...

### 2.2 Thuộc tính sản phẩm

Mỗi sản phẩm có thể có nhiều biến thể (variants) với các thuộc tính:
- **Màu sắc (Color)**: dark-heather, light-blue, light-pink, forest-green, navy, white, black...
- **Kích thước (Size)**: S, M, L, XL, 2XL, 3XL, 4XL, 5XL
- **Vị trí in/thêu (Location)**: Large Center, Left Sleeve, Right Sleeve, Back Center, Special Location...
- **Loại file**: DTG Printing, EMB file, Printing file

## 3. Tính năng hiện có và cần phát triển

### 3.1 Tính năng hiện có

1. **Hệ thống quản lý người dùng**:
   - Đăng ký, đăng nhập, quên mật khẩu
   - Quản lý thông tin cá nhân
   - Phân quyền người dùng (user, admin)

2. **Hệ thống Credit**:
   - Nạp và rút credit
   - Quản lý lịch sử giao dịch
   - Kiểm tra số dư trước khi thanh toán

3. **Quản lý đơn hàng cơ bản**:
   - Tạo đơn hàng mới
   - Lấy thông tin đơn hàng
   - Cập nhật trạng thái đơn hàng
   - Tính toán phí bổ sung cho sản phẩm

4. **Tính toán giá cơ bản**:
   - Tính giá dựa trên sản phẩm cơ bản
   - Tính phí bổ sung cho vị trí in/thêu
   - Ước tính tổng giá đơn hàng

### 3.2 Tính năng cần phát triển

#### 3.2.1 Nhập sản phẩm vào hệ thống (Product Import)

1. **Giao diện Import**:
   - Upload file CSV
   - Tùy chọn cập nhật sản phẩm hiện có hoặc chỉ thêm mới
   - Hiển thị preview dữ liệu trước khi import
   - Tích hợp validation để kiểm tra lỗi trước khi import

2. **Xử lý dữ liệu**:
   - Mapping các trường dữ liệu từ CSV sang mô hình dữ liệu hệ thống
   - Xử lý các trường hợp đặc biệt (ví dụ: variants, options)
   - Xử lý URLs ảnh và tải ảnh từ URLs nếu cần

3. **Quy trình xử lý**:
   ```
   Bắt đầu Import
      ↓
   Kiểm tra định dạng file
      ↓
   Validate dữ liệu
      ↓
   Hiển thị preview và lỗi (nếu có)
      ↓
   Xác nhận import
      ↓
   Thực hiện import (có thể chạy background job)
      ↓
   Thông báo kết quả
   ```

4. **Xử lý lỗi và logging**:
   - Log chi tiết các lỗi trong quá trình import
   - Cho phép retry các sản phẩm bị lỗi
   - Export danh sách sản phẩm bị lỗi

5. **Tích hợp API**:
   - `POST /api/products/import` - Import sản phẩm từ file CSV
   - `GET /api/products/import-templates` - Tải mẫu file import

#### 3.2.2 Import Order

1. **Cấu trúc file import đơn hàng**:
   - Định dạng CSV/Excel với các trường:
     - Order ID (tùy chọn)
     - Tên khách hàng
     - Email
     - Số điện thoại
     - Địa chỉ giao hàng
     - Sản phẩm (SKU, số lượng)
     - Dịch vụ in/thêu (vị trí, loại)
     - Ghi chú đơn hàng

2. **Quy trình import**:
   ```
   Upload file
      ↓
   Validate dữ liệu
      ↓
   Kiểm tra tồn kho
      ↓
   Tính toán giá tự động
      ↓
   Preview đơn hàng + hiển thị cảnh báo
      ↓
   Xác nhận import
      ↓
   Tạo đơn hàng trong hệ thống
      ↓
   Cập nhật credit người dùng
      ↓
   Gửi thông báo xác nhận đơn hàng
   ```

3. **Tích hợp API**:
   - `POST /api/orders/import` - Import đơn hàng từ file
   - `GET /api/orders/import-templates` - Tải mẫu file import

#### 3.2.3 Nâng cấp tính năng Create Order

1. **Giao diện tạo đơn hàng cải tiến**:
   - Form thông tin khách hàng
   - Tìm kiếm và chọn sản phẩm
   - Tùy chỉnh dịch vụ in/thêu
   - Upload file thiết kế
   - Tính toán giá tự động real-time
   - Hiển thị số dư credit và số tiền cần thanh toán

2. **Quy trình tạo đơn hàng**:
   ```
   Nhập thông tin khách hàng
      ↓
   Chọn sản phẩm và dịch vụ
      ↓
   Upload file thiết kế (nếu có)
      ↓
   Chọn vị trí in/thêu
      ↓
   Hệ thống tính giá tự động
      ↓
   Xác nhận đơn hàng
      ↓
   Thanh toán bằng credit
      ↓
   Gửi thông báo xác nhận
   ```

3. **Tích hợp API**:
   - Nâng cấp API hiện có: `POST /api/orders`
   - Thêm API tính giá: `POST /api/orders/calculate-price`

## 4. Tính toán giá đơn hàng

### 4.1 Cấu trúc giá cơ bản

1. **Giá sản phẩm vật lý**:
   - Áo sweatshirt: $14.90 - $21.50 (tùy kích thước và màu sắc)
   - Các sản phẩm vật lý khác: Theo bảng giá quy định

2. **Giá dịch vụ in/thêu**:
   - Phí in vị trí trung tâm lớn (Large Center): $4.00
   - Phí in tay áo (Left/Right Sleeve): $1.00/bên
   - Phí in mặt lưng (Back Location): $4.00
   - Phí vị trí đặc biệt (Special Location): $4.00
   - Phí xử lý file EMB: $3.00
   - Phí in DTG: $1.00
   - Phí xử lý file in: $2.00

3. **Giá sản phẩm kỹ thuật số**:
   - File thêu 3D: $6.00
   - File thiết kế logo thêu: $8.00
   - File thêu Outline: $3.00
   - File thêu chân dung/thú cưng: $4.00

### 4.2 Công thức tính giá đơn hàng

**Giá đơn hàng = Giá sản phẩm vật lý + Tổng phí dịch vụ in/thêu + Phí vận chuyển**

1. **Trường hợp in/thêu trên sản phẩm có sẵn**:
   ```
   Giá đơn hàng = Giá sản phẩm + (Phí vị trí in × Số vị trí) + Phí xử lý file + Phí vận chuyển
   ```

2. **Trường hợp chỉ mua file thiết kế kỹ thuật số**:
   ```
   Giá đơn hàng = Giá file thiết kế (không có phí vận chuyển)
   ```

3. **Trường hợp khách hàng cung cấp sản phẩm để in**:
   ```
   Giá đơn hàng = (Phí vị trí in × Số vị trí) + Phí xử lý file + Phí vận chuyển
   ```

## 5. Yêu cầu kỹ thuật cho các tính năng cần phát triển

### 5.1 API endpoints mới cần phát triển

1. **Import sản phẩm**:
   - `POST /api/products/import` - Nhập sản phẩm từ file CSV
   - `GET /api/products/import-templates` - Tải mẫu file import
   - `GET /api/products/import-status/:importId` - Kiểm tra trạng thái import

2. **Import đơn hàng**:
   - `POST /api/orders/import` - Import đơn hàng từ file
   - `GET /api/orders/import-templates` - Tải mẫu file import đơn hàng
   - `GET /api/orders/import-status/:importId` - Kiểm tra trạng thái import

3. **Tính năng bổ sung cho đơn hàng**:
   - `POST /api/orders/validate` - Kiểm tra tính hợp lệ của đơn hàng
   - `POST /api/orders/calculate-shipping` - Tính phí vận chuyển

### 5.2 Cập nhật cấu trúc dữ liệu

1. **Product Import**:
   ```javascript
   {
     id: String,
     userId: String,
     fileName: String,
     status: String, // 'processing', 'completed', 'failed'
     totalItems: Number,
     processedItems: Number,
     successItems: Number,
     failedItems: Number,
     errors: [
       {
         row: Number,
         message: String
       }
     ],
     createdAt: Date,
     completedAt: Date
   }
   ```

2. **Order Import**:
   ```javascript
   {
     id: String,
     userId: String,
     fileName: String,
     status: String,
     totalOrders: Number,
     processedOrders: Number,
     successOrders: Number,
     failedOrders: Number,
     errors: [
       {
         row: Number,
         message: String
       }
     ],
     createdAt: Date,
     completedAt: Date
   }
   ```

## 6. Phương án triển khai

### 6.1 Thứ tự ưu tiên phát triển

1. **Giai đoạn 1 (2-3 tuần)**:
   - Phát triển tính năng nhập sản phẩm (Product Import)
   - Cải thiện hệ thống tính giá hiện tại

2. **Giai đoạn 2 (2-3 tuần)**:
   - Phát triển tính năng nhập đơn hàng (Order Import)
   - Nâng cấp giao diện tạo đơn hàng

3. **Giai đoạn 3 (2 tuần)**:
   - Kiểm thử toàn diện
   - Triển khai và đào tạo người dùng

### 6.2 Kiến trúc hệ thống

1. **Backend**:
   - Node.js với Koa.js framework
   - Firebase Firestore để lưu trữ dữ liệu
   - Firebase Cloud Functions cho serverless computing
   - Firebase Authentication cho xác thực người dùng

2. **Frontend**:
   - React.js cho giao diện người dùng
   - Redux hoặc Context API để quản lý state
   - Material-UI cho các components

3. **Tích hợp và triển khai**:
   - CI/CD pipeline với GitHub Actions
   - Triển khai tự động lên Firebase Hosting
   - Monitoring và logging

## 7. Kết luận

Dự án EcoPrint đã có một nền tảng cơ bản với các tính năng quản lý người dùng, credit, và đơn hàng. Việc phát triển thêm các tính năng nhập sản phẩm, nhập đơn hàng và cải thiện quy trình tạo đơn hàng sẽ giúp tối ưu hóa quy trình kinh doanh và cải thiện trải nghiệm người dùng.

Các tính năng này sẽ được xây dựng dựa trên kiến trúc hiện có, đảm bảo tính nhất quán và hiệu suất cao. Với kế hoạch triển khai theo giai đoạn, dự án sẽ được phát triển một cách có hệ thống và kiểm soát được rủi ro. 