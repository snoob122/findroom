# Hướng dẫn cài đặt Student Accommodation Platform

## Yêu cầu hệ thống

- **Node.js**: >= 16.x
- **MongoDB**: >= 5.0
- **npm** hoặc **yarn**

## Bước 1: Clone hoặc tải project

Nếu bạn đang đọc file này, bạn đã có source code rồi!

## Bước 2: Cài đặt MongoDB

### Windows:
1. Tải MongoDB từ https://www.mongodb.com/try/download/community
2. Cài đặt MongoDB với tùy chọn mặc định
3. MongoDB sẽ tự động chạy như một service

### macOS (dùng Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian):
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

## Bước 3: Cài đặt dependencies

Mở terminal/command prompt trong thư mục project và chạy:

```bash
npm run install-all
```

Lệnh này sẽ cài đặt tất cả dependencies cho cả backend và frontend.

## Bước 4: Cấu hình môi trường

### Backend (.env)

Tạo file `.env` trong thư mục `backend/`:

```bash
cd backend
copy .env.example .env    # Windows
# hoặc
cp .env.example .env      # macOS/Linux
```

Sau đó chỉnh sửa file `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/student-accommodation
JWT_SECRET=your_super_secret_key_change_this_in_production_12345
PORT=5000
NODE_ENV=development
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
CLIENT_URL=http://localhost:5173
```

**Quan trọng**: Đổi `JWT_SECRET` thành một chuỗi ngẫu nhiên phức tạp!

### Frontend (.env)

Tạo file `.env` trong thư mục `frontend/`:

```bash
cd frontend
echo VITE_API_URL=http://localhost:5000 > .env    # Windows CMD
# hoặc
echo "VITE_API_URL=http://localhost:5000" > .env  # PowerShell/macOS/Linux
```

## Bước 5: Khởi động ứng dụng

### Cách 1: Chạy cả Backend và Frontend cùng lúc (Khuyến nghị)

Từ thư mục gốc của project:

```bash
npm run dev
```

### Cách 2: Chạy riêng từng phần

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Bước 6: Truy cập ứng dụng

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

## Kiểm tra hoạt động

1. Mở trình duyệt và truy cập http://localhost:5173
2. Bạn sẽ thấy trang chủ của ứng dụng
3. Thử đăng ký tài khoản mới:
   - Click "Đăng ký"
   - Điền thông tin
   - Chọn vai trò (Người thuê hoặc Chủ trọ)
   - Submit

## Xử lý sự cố

### Lỗi: "Cannot connect to MongoDB"

**Giải pháp:**
- Kiểm tra MongoDB đã chạy chưa:
  ```bash
  # Windows
  net start MongoDB
  
  # macOS
  brew services list
  
  # Linux
  sudo systemctl status mongod
  ```

### Lỗi: "Port 5000 already in use"

**Giải pháp:**
- Đổi port trong `backend/.env`:
  ```env
  PORT=5001
  ```
- Nhớ cập nhật `VITE_API_URL` trong `frontend/.env`:
  ```env
  VITE_API_URL=http://localhost:5001
  ```

### Lỗi: "Module not found"

**Giải pháp:**
```bash
# Xóa node_modules và cài lại
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install-all
```

### Lỗi khi upload file

**Giải pháp:**
- Đảm bảo thư mục `backend/uploads` tồn tại
- Kiểm tra quyền ghi file

## Tính năng cần test

### Cho Người thuê:
1. ✅ Đăng ký/Đăng nhập
2. ✅ Tìm kiếm phòng trọ
3. ✅ Xem chi tiết phòng
4. ✅ Lưu phòng yêu thích
5. ✅ Tìm bạn cùng phòng
6. ✅ Viết blog/bình luận
7. ✅ Xem bản đồ TP.HCM

### Cho Chủ trọ:
1. ✅ Đăng ký với vai trò Chủ trọ
2. ✅ Đăng tin cho thuê (giống Facebook với Map Picker)
3. ✅ Quản lý tin đăng (có thể chỉnh sửa vị trí trên map)
4. ✅ Xem thống kê dashboard
5. ✅ Phản hồi đánh giá
6. ✅ Chọn vị trí chính xác trên bản đồ TP.HCM

## Dữ liệu mẫu (Optional)

Để test nhanh, bạn có thể tạo dữ liệu mẫu:

### Tạo tài khoản Chủ trọ:
- Email: landlord@test.com
- Password: 123456
- Vai trò: Chủ trọ

### Tạo tài khoản Người thuê:
- Email: tenant@test.com
- Password: 123456
- Vai trò: Người thuê

## Cấu hình Production (Triển khai thực tế)

Khi triển khai lên server thực:

1. **Đổi `NODE_ENV`** thành `production`
2. **Đổi `JWT_SECRET`** thành chuỗi ngẫu nhiên mạnh
3. **Cấu hình HTTPS**
4. **Sử dụng MongoDB Atlas** (cloud) thay vì local MongoDB
5. **Cấu hình CORS** đúng domain
6. **Enable rate limiting và security headers**

## Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console log của browser (F12)
2. Kiểm tra terminal log của backend
3. Đảm bảo tất cả services đang chạy
4. Kiểm tra file `.env` đã cấu hình đúng

Happy coding! 🚀

