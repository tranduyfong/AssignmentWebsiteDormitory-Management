const pool = require('../configs/db.config');
const bcrypt = require('bcryptjs');

// 1. Lấy danh sách tất cả sinh viên (Cho màn hình Quản lý Sinh viên)
exports.getAllStudents = async (req, res) => {
    try {
        const query = `
            SELECT s.*, p.TenPhong 
            FROM SinhVien s
            LEFT JOIN Phong p ON s.MaPhong = p.MaPhong
        `;
        const [students] = await pool.execute(query);
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sinh viên.' });
    }
};

// 2. Lấy danh sách đơn đăng ký chờ duyệt
exports.getPendingRegistrations = async (req, res) => {
    try {
        const query = `
            SELECT d.*, s.HoTen, s.GioiTinh
            FROM DangKy d
            JOIN SinhVien s ON d.MaSV = s.MaSV
            WHERE d.TrangThai = 0
        `;
        const [registrations] = await pool.execute(query);
        res.status(200).json(registrations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy đơn đăng ký.' });
    }
};

// 3. Phân phòng (Duyệt đơn đăng ký) - XỬ LÝ TRANSACTION
exports.approveRegistration = async (req, res) => {
    const { maDK, maSV, maPhong } = req.body;
    const connection = await pool.getConnection(); // Mở kết nối riêng cho Transaction

    try {
        await connection.beginTransaction(); // Bắt đầu Transaction

        // Bước 1: Kiểm tra phòng còn sức chứa không
        const [rooms] = await connection.execute('SELECT SucChua, SoSinhVienHienTai FROM Phong WHERE MaPhong = ?', [maPhong]);
        if (rooms.length === 0 || rooms[0].SoSinhVienHienTai >= rooms[0].SucChua) {
            throw new Error('Phòng đã đầy hoặc không tồn tại!');
        }

        // Bước 2: Cập nhật trạng thái đơn đăng ký -> Đã duyệt (1)
        await connection.execute('UPDATE DangKy SET TrangThai = 1, MaPhong = ? WHERE MaDK = ?', [maPhong, maDK]);

        // Bước 3: Gán phòng cho Sinh viên
        await connection.execute('UPDATE SinhVien SET MaPhong = ? WHERE MaSV = ?', [maPhong, maSV]);

        // Bước 4: Tăng số lượng sinh viên trong phòng lên 1
        await connection.execute(`
            UPDATE Phong 
            SET SoSinhVienHienTai = SoSinhVienHienTai + 1,
                TrangThai = CASE 
                    WHEN (SoSinhVienHienTai + 1) >= SucChua THEN 'Đã đầy'
                    ELSE 'Còn chỗ'
                END
            WHERE MaPhong = ? AND TrangThai != 'Bảo trì'
        `, [maPhong]);

        // Bước 5: (Tùy chọn) Tự động sinh Hợp đồng mới
        const ngayBatDau = new Date().toISOString().split('T')[0];
        const ngayKetThuc = new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]; // Hợp đồng 6 tháng
        await connection.execute(
            'INSERT INTO HopDong (MaSV, MaPhong, NgayBatDau, NgayKetThuc, TrangThai) VALUES (?, ?, ?, ?, 1)',
            [maSV, maPhong, ngayBatDau, ngayKetThuc]
        );

        await connection.commit(); // Xác nhận lưu toàn bộ thay đổi
        res.status(200).json({ message: 'Phân phòng thành công!' });

    } catch (error) {
        await connection.rollback(); // Nếu có lỗi ở bất kỳ bước nào, hoàn tác toàn bộ
        console.error(error);
        res.status(400).json({ message: error.message || 'Lỗi khi duyệt đơn.' });
    } finally {
        connection.release(); // Trả kết nối lại cho Pool
    }
};

// 4. Lấy danh sách Nội quy chung
exports.getRules = async (req, res) => {
    try {
        const [rules] = await pool.execute('SELECT * FROM NoiQuy WHERE TrangThai = 1 ORDER BY NgayCapNhat DESC');
        res.status(200).json(rules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tải nội quy.' });
    }
};

// 5. Thêm mới sinh viên (Admin tạo)
exports.createStudent = async (req, res) => {
    const { msv, fullname, email, sdt, cccd, password, gioiTinh, ngaySinh, khoa, khoaHoc } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Kiểm tra xem tài khoản hoặc MSV đã tồn tại chưa
        const [existing] = await connection.execute('SELECT * FROM TaiKhoan WHERE TenDangNhap = ?', [msv]);
        if (existing.length > 0) throw new Error('Mã sinh viên đã tồn tại trong hệ thống!');

        // Tạo tài khoản (VaiTro = 1)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || '123456aA@', salt);

        const [resTK] = await connection.execute(
            'INSERT INTO TaiKhoan (TenDangNhap, MatKhau, VaiTro) VALUES (?, ?, 1)',
            [msv, hashedPassword]
        );
        const maTK = resTK.insertId;

        // Thêm thông tin sinh viên vào bảng SinhVien (Bổ sung Khoa, KhoaHoc)
        const querySV = `
            INSERT INTO SinhVien (MaSV, MaTK, HoTen, Email, SDT, CCCD, GioiTinh, NgaySinh, Khoa, KhoaHoc) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.execute(querySV, [
            msv,
            maTK,
            fullname,
            email,
            sdt || null,
            cccd || null,
            gioiTinh ?? 1,
            ngaySinh || null,
            khoa || null,     // Thêm giá trị khoa
            khoaHoc || null   // Thêm giá trị khóa học
        ]);

        await connection.commit();
        res.status(201).json({ message: 'Thêm mới sinh viên thành công!' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(400).json({ message: error.message || 'Lỗi khi thêm sinh viên.' });
    } finally {
        connection.release();
    }
};

// 6. Cập nhật thông tin sinh viên (Giữ nguyên hoặc tối ưu)
exports.updateStudent = async (req, res) => {
    const { id } = req.params; // Lấy MaSV từ URL
    const { fullname, email, sdt, cccd, gioiTinh, ngaySinh, khoa, khoaHoc } = req.body;

    try {
        const query = `
            UPDATE SinhVien 
            SET HoTen = ?, Email = ?, SDT = ?, CCCD = ?, GioiTinh = ?, NgaySinh = ?, Khoa = ?, KhoaHoc = ?
            WHERE MaSV = ?
        `;
        
        await pool.execute(query, [
            fullname,
            email,
            sdt || null,
            cccd || null,
            gioiTinh ?? 1,
            ngaySinh || null,
            khoa || null,    // Cập nhật khoa
            khoaHoc || null, // Cập nhật khóa học
            id
        ]);
        res.status(200).json({ message: 'Sửa thông tin sinh viên thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật thông tin sinh viên.' });
    }
};

// 7. Xóa sinh viên
exports.deleteStudent = async (req, res) => {
    const { id } = req.params; // MaSV
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Luồng Sequence: Kiểm tra sinh viên có đang ở phòng không
        const [student] = await connection.execute('SELECT MaPhong, MaTK FROM SinhVien WHERE MaSV = ?', [id]);
        if (student.length === 0) throw new Error('Không tìm thấy sinh viên.');
        if (student[0].MaPhong) throw new Error('Không thể xóa vì sinh viên đang có phòng ở KTX!');

        const maTK = student[0].MaTK;

        // Xóa sinh viên trước (do có khóa ngoại trỏ về TaiKhoan)
        await connection.execute('DELETE FROM SinhVien WHERE MaSV = ?', [id]);
        // Sau đó xóa tài khoản
        await connection.execute('DELETE FROM TaiKhoan WHERE MaTK = ?', [maTK]);

        await connection.commit();
        res.status(200).json({ message: 'Xóa sinh viên thành công!' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(400).json({ message: error.message || 'Lỗi khi xóa sinh viên.' });
    } finally {
        connection.release();
    }
};

// 8. Từ chối đơn đăng ký KTX
exports.rejectRegistration = async (req, res) => {
    const { id } = req.params; // MaDK (Mã đơn đăng ký)

    try {
        // Cập nhật trạng thái đơn thành 2 (Từ chối)
        // Chỉ cho phép từ chối những đơn đang ở trạng thái 0 (Chờ duyệt)
        const [result] = await pool.execute(
            'UPDATE DangKy SET TrangThai = 2 WHERE MaDK = ? AND TrangThai = 0',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Không thể từ chối. Đơn đăng ký không tồn tại hoặc đã được xử lý trước đó!' });
        }

        res.status(200).json({ message: 'Đã từ chối đơn đăng ký thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi từ chối đơn đăng ký.' });
    }
};