const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Cấu hình Middlewares cơ bản
app.use(cors()); // Cấp quyền cho ReactJS gọi API
app.use(express.json()); // Xử lý dữ liệu JSON gửi từ client
app.use(express.urlencoded({ extended: true }));

// 2. Khởi tạo kết nối Database
require('../src/configs/db.config');

// 3. Import các file Routes
const authRoutes = require('../src/routes/auth.routes');
const studentRoutes = require('../src/routes/student.routes');
const adminRoutes = require('../src/routes/admin.routes');

// 4. Gắn (Mount) Routes vào ứng dụng với các tiền tố (Prefix) tương ứng
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

// Route Test mặc định
app.get('/', (req, res) => {
    res.json({ message: "Chào mừng đến với API Quản lý Ký túc xá HUMG!" });
});

// Bắt lỗi 404 cho các API không tồn tại
app.use((req, res) => {
    res.status(404).json({ message: "API không tồn tại!" });
});

// 5. Khởi chạy Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server backend đang chạy tại: http://localhost:${PORT}`);
    console.log(`👉 API Auth: http://localhost:${PORT}/api/auth`);
    console.log(`👉 API Sinh viên: http://localhost:${PORT}/api/student`);
    console.log(`👉 API Admin: http://localhost:${PORT}/api/admin`);
});