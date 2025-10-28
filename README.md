# Student Accommodation Platform

Nền tảng tìm trọ thông minh dành riêng cho sinh viên.

## Tính năng chính

### Cho Chủ trọ
- Đăng tin kèm ảnh/video
- Chỉnh sửa, ẩn hoặc xóa tin
- Dashboard thống kê chi tiết
- Xem phản hồi từ người xem

### Cho Người thuê
- Tìm kiếm theo vị trí hoặc trường đại học
- Bản đồ tương tác với nhiều lớp dữ liệu
- Tìm bạn cùng phòng
- Đánh giá và xác thực chủ trọ
- Lưu phòng yêu thích

### Tính năng đặc biệt
- Bản đồ nhiệt với dữ liệu giá thuê, an ninh, tiện ích, ngập lụt
- Hệ thống gợi ý bạn cùng phòng thông minh
- Blog & cộng đồng
- Hỗ trợ đa ngôn ngữ
- Chế độ sáng/tối

## Cài đặt

### Yêu cầu
- Node.js >= 16.x
- MongoDB
- npm hoặc yarn

### Bước 1: Cài đặt dependencies
```bash
npm run install-all
```

### Bước 2: Cấu hình môi trường
Tạo file `.env` trong thư mục `backend`:
```
MONGODB_URI=mongodb://localhost:27017/student-accommodation
JWT_SECRET=your_secret_key_here
PORT=5000
```

Tạo file `.env` trong thư mục `frontend`:
```
VITE_API_URL=http://localhost:5000
```

### Bước 3: Chạy ứng dụng
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Công nghệ sử dụng

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Leaflet (Maps)
- i18next (Multi-language)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (File upload)
- Socket.io (Real-time notifications)

## Cấu trúc dự án

```
├── backend/              # Server-side code
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   └── uploads/         # Uploaded files
├── frontend/            # Client-side code
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom hooks
│   │   └── utils/       # Utilities
│   └── public/          # Static files
└── README.md

```

## License
MIT

