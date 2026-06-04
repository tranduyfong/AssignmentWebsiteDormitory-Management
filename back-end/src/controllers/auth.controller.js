const pool = require('../configs/db.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// --- CẤU HÌNH GỬI MAIL ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Hàm làm sạch: Trim đầu cuối + đưa nhiều dấu cách về 1
const normalizeString = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str.trim().replace(/\s+/g, ' ');
};

// 1. ĐĂNG KÝ TÀI KHOẢN & GỬI MAIL
exports.register = async (req, res) => {
    // Làm sạch dữ liệu ngay khi nhận vào
    const msv = normalizeString(req.body.msv);
    const fullname = normalizeString(req.body.fullname);
    const email = req.body.email ? req.body.email.trim() : ''; // Email chỉ trim, không replace dấu cách
    const { password, gioiTinh } = req.body;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [existingUsers] = await connection.execute('SELECT * FROM TaiKhoan WHERE TenDangNhap = ?', [msv]);
        if (existingUsers.length > 0) {
            throw new Error('Tài khoản hoặc Mã sinh viên đã tồn tại trên hệ thống!');
        }
        const [existingEmails] = await connection.execute('SELECT MaSV FROM SinhVien WHERE Email = ?', [email]);
        if (existingEmails.length > 0) {
            throw new Error('Email này đã được đăng ký cho một tài khoản khác!');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Lưu tài khoản với TrangThaiXacNhan = 0 (Chưa xác nhận)
        const [resultTK] = await connection.execute(
            'INSERT INTO TaiKhoan (TenDangNhap, MatKhau, VaiTro, TrangThaiXacNhan) VALUES (?, ?, ?, 0)',
            [msv, hashedPassword, 1]
        );
        const maTK = resultTK.insertId;

        const tempCCCD = `TEMP_${msv}`;
        await connection.execute(
            'INSERT INTO SinhVien (MaSV, MaTK, HoTen, Email, CCCD, GioiTinh) VALUES (?, ?, ?, ?, ?, ?)',
            [msv, maTK, fullname, email, tempCCCD, gioiTinh]
        );

        // --- TẠO TOKEN XÁC NHẬN VÀ GỬI MAIL ---
        // Tạo token có hạn 15 phút
        const verifyToken = jwt.sign({ msv: msv }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // Đổi port 5000 thành port Backend của bạn đang chạy
        const verifyUrl = `http://localhost:5000/api/auth/verify-email?token=${verifyToken}`;

        const mailOptions = {
            from: `"Ban Quản Lý KTX" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Xác nhận đăng ký tài khoản Ký túc xá',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #00529C; text-align: center;">Xác nhận tài khoản Ký túc xá</h2>
                    <p>Xin chào <strong>${fullname}</strong>,</p>
                    <p>Cảm ơn bạn đã đăng ký tài khoản trên hệ thống quản lý Ký túc xá. Để hoàn tất đăng ký và kích hoạt tài khoản, vui lòng nhấn vào nút bên dưới (Link có hiệu lực trong 15 phút):</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verifyUrl}" style="background-color: #00529C; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px;">Kích hoạt tài khoản</a>
                    </div>
                    <p style="font-size: 12px; color: #64748b; text-align: center;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
                </div>
            `
        };

        // Gửi mail (Không cần await để phản hồi API nhanh hơn)
        transporter.sendMail(mailOptions).catch(err => console.error("Lỗi gửi mail:", err));

        await connection.commit();
        res.status(201).json({ message: 'Đăng ký thành công. Vui lòng kiểm tra hộp thư Email để kích hoạt tài khoản!' });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(400).json({ message: error.message || 'Lỗi server khi đăng ký.' });
    } finally {
        connection.release();
    }
};

// 2. XỬ LÝ KHI BẤM LINK XÁC NHẬN TRONG EMAIL
exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
    const frontendLoginUrl = 'http://localhost:5173/login';

    try {
        if (!token) return res.redirect(`${frontendLoginUrl}?verify=invalid`);

        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const msv = decoded.msv;

        // Cập nhật trạng thái xác nhận
        const [result] = await pool.execute(
            'UPDATE TaiKhoan SET TrangThaiXacNhan = 1 WHERE TenDangNhap = ? AND TrangThaiXacNhan = 0',
            [msv]
        );

        if (result.affectedRows === 0) {
            return res.redirect(`${frontendLoginUrl}?verify=already`); // Đã xác nhận trước đó rồi
        }

        // Thành công -> Đẩy về trang Login kèm thông báo
        return res.redirect(`${frontendLoginUrl}?verify=success`);

    } catch (error) {
        console.error("Lỗi xác nhận email:", error);
        // Token hết hạn hoặc sai
        return res.redirect(`${frontendLoginUrl}?verify=expired`);
    }
};

// 3. ĐĂNG NHẬP (Chặn nếu chưa xác nhận mail)
exports.login = async (req, res) => {
    // Làm sạch username (Mã sinh viên thường không có dấu cách)
    const username = normalizeString(req.body.username);
    const { password } = req.body;

    try {
        const [users] = await pool.execute('SELECT * FROM TaiKhoan WHERE TenDangNhap = ?', [username]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Tài khoản hoặc mật khẩu không đúng.' });
        }

        const user = users[0];

        // --- KIỂM TRA TRẠNG THÁI XÁC NHẬN ---
        // Giả sử Admin (VaiTro = 0) không cần check mail, chỉ check Sinh viên (VaiTro = 1)
        if (user.VaiTro === 1 && user.TrangThaiXacNhan === 0) {
            // ĐỔI 403 THÀNH 400 Ở DÒNG DƯỚI ĐÂY
            return res.status(400).json({
                message: 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra Email (cả mục Spam) để xác nhận!'
            });
        }

        const isMatch = await bcrypt.compare(password, user.MatKhau);
        if (!isMatch) {
            return res.status(400).json({ message: 'Tài khoản hoặc mật khẩu không đúng.' });
        }

        // Logic cũ của bạn giữ nguyên...
        let userInfo = {};
        if (user.VaiTro === 1) {
            const [students] = await pool.execute('SELECT MaSV, HoTen, MaPhong, Email FROM SinhVien WHERE MaTK = ?', [user.MaTK]);
            if (students.length > 0) userInfo = students[0];
        } else if (user.VaiTro === 0) {
            const [admins] = await pool.execute('SELECT MaAdmin, HoTen FROM Admin WHERE MaTK = ?', [user.MaTK]);
            if (admins.length > 0) userInfo = admins[0];
        }

        const payload = {
            username: user.TenDangNhap,
            role: user.VaiTro,
            id: userInfo.MaSV || userInfo.MaAdmin
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: 'Đăng nhập thành công',
            token,
            user: { username: user.TenDangNhap, role: user.VaiTro, name: userInfo.HoTen, ...userInfo }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
    }
};

// 4. QUÊN MẬT KHẨU: TẠO VÀ GỬI MÃ OTP 6 SỐ
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const [students] = await pool.execute('SELECT MaTK, HoTen FROM SinhVien WHERE Email = ?', [email]);
        if (students.length === 0) return res.status(404).json({ message: 'Email không tồn tại trong hệ thống!' });

        const maTK = students[0].MaTK;

        // 1. Tạo OTP ngẫu nhiên 6 số chuẩn dạng Chuỗi (String)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. BẮT BUỘC: Lưu mã OTP này vào Database với thời hạn 15 phút
        await pool.execute(
            'UPDATE TaiKhoan SET MaKhoiPhuc = ?, HanMaKhoiPhuc = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE MaTK = ?',
            [otp, maTK]
        );

        // 4. Gửi Email
        const mailOptions = {
            from: `"Ban Quản Lý KTX" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Mã khôi phục mật khẩu Ký túc xá',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #00529C; text-align: center;">Khôi phục mật khẩu</h2>
                    <p>Xin chào bạn</strong>,</p>
                    <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Ký túc xá. Dưới đây là mã xác nhận 6 số của bạn:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #00529C; background-color: #f1f5f9; padding: 15px 30px; border-radius: 10px; border: 2px dashed #cbd5e1;">${otp}</span>
                    </div>
                    <p style="color: #ef4444; text-align: center; font-size: 14px; font-weight: bold;">Mã này sẽ hết hạn sau 10 phút.</p>
                    <p style="font-size: 12px; color: #64748b; text-align: center;">Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions).catch(err => console.error("Lỗi gửi mail OTP:", err));

        res.status(200).json({ message: 'Mã xác nhận đã được gửi đến email của bạn.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi xử lý quên mật khẩu.' });
    }
};

// 5. ĐẶT LẠI MẬT KHẨU MỚI BẰNG OTP
exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    // CHẶN NGAY LẬP TỨC nếu Front-end gửi thiếu 1 trong 3 trường này hoặc gửi chuỗi rỗng
    if (!email || !otp || !newPassword || otp.trim() === '') {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ Email, Mã xác nhận và Mật khẩu mới!' });
    }

    try {
        // Kiểm tra khớp 100% Email + OTP và thời gian còn hiệu lực
        const [users] = await pool.execute(`
            SELECT t.MaTK 
            FROM TaiKhoan t 
            JOIN SinhVien s ON t.MaTK = s.MaTK 
            WHERE s.Email = ? AND t.MaKhoiPhuc = ? AND t.HanMaKhoiPhuc > NOW()
        `, [email, otp.trim()]); // Dùng .trim() để xóa khoảng trắng thừa nếu người dùng lỡ copy dính dấu cách

        if (users.length === 0) {
            return res.status(400).json({ message: 'Mã xác nhận không chính xác hoặc đã hết hạn.' });
        }

        const user = users[0];
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Đổi mật khẩu thành công thì PHẢI set OTP về NULL để không bị dùng lại
        await pool.execute(
            'UPDATE TaiKhoan SET MatKhau = ?, MaKhoiPhuc = NULL, HanMaKhoiPhuc = NULL WHERE MaTK = ?',
            [hashedPassword, user.MaTK]
        );

        res.status(200).json({ message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi đặt lại mật khẩu.' });
    }
};

// 4.5. KIỂM TRA TRƯỚC MÃ OTP (BƯỚC 2)
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const [users] = await pool.execute(`
            SELECT t.MaTK 
            FROM TaiKhoan t 
            JOIN SinhVien s ON t.MaTK = s.MaTK 
            WHERE s.Email = ? AND t.MaKhoiPhuc = ? AND t.HanMaKhoiPhuc > NOW()
        `, [email, otp.trim()]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Mã xác nhận không chính xác hoặc đã hết hạn.' });
        }

        res.status(200).json({ message: 'Mã xác nhận hợp lệ.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi xác thực mã.' });
    }
};