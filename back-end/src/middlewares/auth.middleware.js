const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực người dùng chung (Admin hoặc Sinh viên)
 * Bắt buộc phải có token hợp lệ để đi tiếp.
 */
exports.verifyToken = (req, res, next) => {
    // 1. Lấy token từ header 'Authorization'
    // Format chuẩn: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Không tìm thấy xác thực. Vui lòng đăng nhập!' });
    }

    const token = authHeader.split(' ')[1]; // Lấy phần <token> phía sau chữ "Bearer "

    try {
        // 2. Giải mã token bằng JWT_SECRET (Lưu trong file .env)
        // Đảm bảo bạn đã khai báo JWT_SECRET trong .env nhé!
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Gắn thông tin giải mã được vào request object
        // Payload lúc ta tạo token ở file auth.controller.js có chứa { username, role, id }
        req.user = decoded;

        // 4. Cho phép request đi tiếp đến Controller
        next();
    } catch (error) {
        // Bắt các lỗi như: Token hết hạn (TokenExpiredError) hoặc sai chữ ký (JsonWebTokenError)
        console.error('Lỗi xác thực Token:', error.message);
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!' });
    }
};

/**
 * Middleware phân quyền: CHỈ DÀNH CHO ADMIN
 * Phải được gọi SAU hàm verifyToken ở trên.
 */
exports.isAdmin = (req, res, next) => {
    // Kéo thông tin role từ req.user (đã được gắn bởi verifyToken)
    // Quy ước trong DB: 0 là Admin, 1 là Sinh viên
    if (req.user && req.user.role === 0) {
        next(); // Là Admin -> cho qua
    } else {
        return res.status(403).json({ message: 'Truy cập bị từ chối. Bạn không có quyền Admin!' });
    }
};

/**
 * Middleware phân quyền: CHỈ DÀNH CHO SINH VIÊN
 * Phải được gọi SAU hàm verifyToken ở trên.
 */
exports.isStudent = (req, res, next) => {
    if (req.user && req.user.role === 1) {
        next(); // Là Sinh viên -> cho qua
    } else {
        return res.status(403).json({ message: 'Truy cập bị từ chối. Chức năng này chỉ dành cho Sinh viên!' });
    }
};