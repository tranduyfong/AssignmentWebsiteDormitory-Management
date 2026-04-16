const pool = require('../configs/db.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    // Lấy dữ liệu từ Frontend gửi lên (Đã có thêm email)
    const { msv, fullname, email, password } = req.body;
    const connection = await pool.getConnection(); // Mở kết nối riêng cho Transaction

    try {
        await connection.beginTransaction();

        // 1. Kiểm tra tài khoản đã tồn tại chưa
        const [existingUsers] = await connection.execute('SELECT * FROM TaiKhoan WHERE TenDangNhap = ?', [msv]);
        if (existingUsers.length > 0) {
            throw new Error('Tài khoản hoặc Mã sinh viên đã tồn tại trên hệ thống!');
        }

        // 2. Băm mật khẩu để bảo mật
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Lưu vào bảng TaiKhoan (VaiTro = 1 cho Sinh viên)
        const [resultTK] = await connection.execute(
            'INSERT INTO TaiKhoan (TenDangNhap, MatKhau, VaiTro) VALUES (?, ?, ?)',
            [msv, hashedPassword, 1]
        );

        // Lấy ID của tài khoản vừa tạo (MaTK)
        const maTK = resultTK.insertId;

        // 4. Lưu vào bảng SinhVien
        // Do DB yêu cầu CCCD là UNIQUE NOT NULL mà form đăng ký chưa có, 
        // ta tạo tạm 1 chuỗi CCCD dựa trên MSV, sinh viên sẽ cập nhật lại sau.
        const tempCCCD = `TEMP_${msv}`;

        await connection.execute(
            'INSERT INTO SinhVien (MaSV, MaTK, HoTen, Email, CCCD) VALUES (?, ?, ?, ?, ?)',
            [msv, maTK, fullname, email, tempCCCD]
        );

        // 5. Xác nhận lưu dữ liệu
        await connection.commit();
        res.status(201).json({ message: 'Đăng ký tài khoản thành công.' });

    } catch (error) {
        // Hoàn tác nếu có bất kỳ lỗi gì xảy ra
        await connection.rollback();
        console.error(error);
        res.status(400).json({ message: error.message || 'Lỗi server khi đăng ký.' });
    } finally {
        connection.release(); // Trả lại kết nối cho pool
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Tìm người dùng trong bảng TaiKhoan
        const [users] = await pool.execute('SELECT * FROM TaiKhoan WHERE TenDangNhap = ?', [username]);
        console.log("Kết quả truy vấn DB:", users);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Tài khoản hoặc mật khẩu không đúng.' });
        }

        const user = users[0];

        // 2. So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.MatKhau);
        if (!isMatch) {
            return res.status(400).json({ message: 'Tài khoản hoặc mật khẩu không đúng.' });
        }

        // 3. Lấy thông tin cá nhân dựa theo VaiTro và MaTK
        let userInfo = {};
        if (user.VaiTro === 1) {
            // Là Sinh viên -> Truy vấn bảng SinhVien
            const [students] = await pool.execute('SELECT MaSV, HoTen, MaPhong, Email FROM SinhVien WHERE MaTK = ?', [user.MaTK]);
            if (students.length > 0) userInfo = students[0];

        } else if (user.VaiTro === 0) {
            // Là Admin -> Truy vấn bảng Admin
            const [admins] = await pool.execute('SELECT MaAdmin, HoTen FROM Admin WHERE MaTK = ?', [user.MaTK]);
            if (admins.length > 0) userInfo = admins[0];
        }

        // 4. Tạo JWT Token
        const payload = {
            username: user.TenDangNhap,
            role: user.VaiTro,
            id: userInfo.MaSV || userInfo.MaAdmin // Dùng mã thực tế của SV/Admin làm ID trong token
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        // 5. Trả dữ liệu về cho ReactJS
        res.status(200).json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                username: user.TenDangNhap,
                role: user.VaiTro,
                name: userInfo.HoTen,
                ...userInfo
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
    }
};