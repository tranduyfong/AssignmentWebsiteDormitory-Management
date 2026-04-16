const pool = require('../configs/db.config');
const bcrypt = require('bcryptjs');

// 1. Đổi mật khẩu (Dùng chung)
exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const username = req.user.username; // Lấy từ Token

    try {
        const [users] = await pool.execute('SELECT MaTK, MatKhau FROM TaiKhoan WHERE TenDangNhap = ?', [username]);
        if (users.length === 0) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });

        const user = users[0];

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, user.MatKhau);
        if (!isMatch) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng.' });

        // Không cho phép mật khẩu mới trùng mật khẩu cũ (như quy định trong Luồng rẽ nhánh A2)
        const isSame = await bcrypt.compare(newPassword, user.MatKhau);
        if (isSame) return res.status(400).json({ message: 'Mật khẩu mới không được trùng mật khẩu cũ.' });

        // Cập nhật mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.execute('UPDATE TaiKhoan SET MatKhau = ? WHERE MaTK = ?', [hashedPassword, user.MaTK]);

        res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu.' });
    }
};

// 2. Cập nhật thông tin cá nhân (Dành cho Sinh viên)
exports.updateMyProfile = async (req, res) => {
    const maSV = req.user.id;
    // Bổ sung gioiTinh vào destructuring
    const { sdt, cccd, email, gioiTinh } = req.body;

    try {
        await pool.execute(
            // Bổ sung cập nhật cột GioiTinh
            'UPDATE SinhVien SET SDT = ?, CCCD = ?, Email = ?, GioiTinh = ? WHERE MaSV = ?',
            [sdt, cccd, email, gioiTinh, maSV]
        );
        res.status(200).json({ message: 'Cập nhật thông tin cá nhân thành công.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật thông tin.' });
    }
};


// Lấy thông tin chi tiết cá nhân để hiển thị lên Form
exports.getMyProfile = async (req, res) => {
    const maSV = req.user.id;
    try {
        const query = `
            SELECT s.*, p.TenPhong, t.TenToaNha, k.TenKhu
            FROM SinhVien s
            LEFT JOIN Phong p ON s.MaPhong = p.MaPhong
            LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha
            LEFT JOIN Khu k ON t.MaKhu = k.MaKhu
            WHERE s.MaSV = ?
        `;
        const [rows] = await pool.execute(query, [maSV]);
        if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });

        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy thông tin hồ sơ.' });
    }
};