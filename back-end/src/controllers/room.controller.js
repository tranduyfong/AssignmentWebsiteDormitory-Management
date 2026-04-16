const pool = require('../configs/db.config');

exports.getAllRooms = async (req, res) => {
    try {
        // Câu truy vấn kết hợp các bảng để lấy thông tin chi tiết
        const query = `
            SELECT 
                p.MaPhong, p.TenPhong, p.Tang, p.LoaiPhong, p.SucChua, p.SoSinhVienHienTai, p.TrangThai, p.GiaPhong,
                t.TenToaNha,
                k.TenKhu
            FROM Phong p
            JOIN ToaNha t ON p.MaToaNha = t.MaToaNha
            JOIN Khu k ON t.MaKhu = k.MaKhu
        `;

        const [rooms] = await pool.execute(query);

        res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách phòng.' });
    }
};

exports.getAvailableRooms = async (req, res) => {
    try {
        // Lấy các phòng trạng thái "Trống" hoặc "Còn chỗ"
        const query = `
            SELECT 
                p.MaPhong, p.TenPhong, p.Tang, p.LoaiPhong, p.SucChua, p.SoSinhVienHienTai, p.GiaPhong,
                t.TenToaNha,
                k.TenKhu
            FROM Phong p
            JOIN ToaNha t ON p.MaToaNha = t.MaToaNha
            JOIN Khu k ON t.MaKhu = k.MaKhu
            WHERE p.TrangThai IN ('Trống', 'Còn chỗ')
        `;

        const [rooms] = await pool.execute(query);

        res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách phòng trống.' });
    }
};