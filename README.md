# 📚 Hệ Thống Tra Cứu Ngày Công Sinh Viên

Hệ thống quản lý và tra cứu số ngày công của sinh viên dựa trên tệp Excel, tích hợp cơ sở dữ liệu PostgreSQL. Dự án được thiết kế theo hướng hiện đại, tốc độ cao và thân thiện với thiết bị di động (Mobile-first).

## 🚀 Tính năng nổi bật

- **Dành cho Sinh Viên (Frontend):**
  - Tra cứu nhanh số ngày công bằng Mã Số Sinh Viên (MSSV).
  - Giao diện Glassmorphism sang trọng, hỗ trợ responsive.
  - Tự động chuẩn hóa dữ liệu đầu vào (cắt khoảng trắng, viết hoa).

- **Dành cho Quản trị viên (Backend / Admin):**
  - Tải lên tệp danh sách Excel (`.xlsx`) để cập nhật hệ thống.
  - Xử lý tải file trực tiếp trên bộ nhớ (RAM) bằng Multer (không tạo file rác trong hệ thống).
  - Ghi và Cập nhật (Upsert) dữ liệu thông minh vào PostgreSQL để tránh trùng lặp bản ghi.
  - Bảo mật bằng mã khóa `ADMIN_SECRET_KEY`.

---

## 🏗 Kiến Trúc Hệ Thống

Hệ thống hoạt động theo mô hình **Client-Server** nguyên khối (Monolithic) giúp dễ dàng phát triển và triển khai bằng 1 click.

### 1. Frontend (Client)
- **Công nghệ:** HTML5, CSS3, JavaScript thuần (Fetch API).
- **Thành phần:** 
  - `public/index.html`: Giao diện tra cứu dành cho sinh viên.
  - `public/admin.html`: Giao diện quản trị, tải lên Excel.
  - `public/style.css`: Hệ thống thiết kế CSS (Variables, Flexbox, Glassmorphism, Micro-animations).
  - `public/script.js`: Xử lý logic gọi API và hiển thị kết quả (DOM Manipulation).

### 2. Backend (Server)
- **Công nghệ:** Node.js, Express.js.
- **Thành phần cốt lõi:**
  - `server.js`: Khởi tạo Express, cấu hình middleware (CORS, JSON), định tuyến 2 API RESTful chính (`/api/search` & `/api/admin/upload`).
  - `database.js`: Khởi tạo và duy trì Connection Pool tới PostgreSQL. Tự động kiểm tra và tạo bảng `work_days` khi khởi động.
- **Luồng xử lý file:**
  - `multer`: Lọc Request, chuyển đổi file Excel từ HTTP Form Data thành dạng RAM Buffer.
  - `xlsx`: Phân tích bộ đệm (Buffer), chuyển đổi Sheet thành Mảng 2 chiều JSON để đưa vào Database.

### 3. Cơ Sở Dữ Liệu (Database)
- **Cơ sở dữ liệu:** PostgreSQL (Relational DB).
- **Bảng (Table):** `work_days`
  - `mssv` (Khóa chính - VARCHAR)
  - `full_name` (Tên sinh viên - VARCHAR)
  - `department` (Bộ phận/Ban - VARCHAR)
  - `work_days` (Ngày công - NUMERIC)
  - `notes` (Ghi chú - TEXT)
  - `updated_at` (Thời gian nạp dữ liệu - TIMESTAMP)

---

## 🛠 Hướng Dẫn Cài Đặt Local (Cho lập trình viên)

1. **Clone dự án về máy:**
   ```bash
   git clone https://github.com/VietVyIT/qu-n-l-p.git
   cd qu-n-l-p/student-work-days
   ```

2. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

3. **Cấu hình môi trường:**
   Tạo file `.env` (copy từ `.env.example`) và điền:
   ```env
   PORT=3000
   DATABASE_URL=postgres://<user>:<password>@<host>/<dbname>
   ADMIN_SECRET_KEY=MatKhauAdminCuaBan123
   ```

4. **Khởi chạy:**
   ```bash
   npm start
   ```
   Truy cập `http://localhost:3000` để sử dụng.

---

## 🌐 Hướng Dẫn Deploy

Dự án được tối ưu 100% để triển khai lên nền tảng **Render.com** (dùng Node.js Web Service) kết hợp với Database Hosted trên **Neon.tech** (PostgreSQL Free).
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- Đừng quên khai báo biến môi trường (Environment Variables) trên Server!
