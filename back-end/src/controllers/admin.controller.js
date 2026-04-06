const pool = require('../configs/db.config');

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
            SELECT d.*, s.HoTen, s.GioiTinh, s.Lop
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
        await connection.execute('UPDATE Phong SET SoSinhVienHienTai = SoSinhVienHienTai + 1 WHERE MaPhong = ?', [maPhong]);

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