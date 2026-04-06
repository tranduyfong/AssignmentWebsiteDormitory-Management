const pool = require('../configs/db.config');

// --- QUẢN LÝ PHÒNG ---
exports.createRoom = async (req, res) => {
    const { maToaNha, tenPhong, tang, loaiPhong, sucChua, giaPhong } = req.body;
    try {
        const query = `
            INSERT INTO Phong (MaToaNha, TenPhong, Tang, LoaiPhong, SucChua, SoSinhVienHienTai, TrangThai, GiaPhong) 
            VALUES (?, ?, ?, ?, ?, 0, 'Trống', ?)
        `;
        await pool.execute(query, [maToaNha, tenPhong, tang, loaiPhong, sucChua, giaPhong]);
        res.status(201).json({ message: 'Thêm phòng mới thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi thêm phòng.' });
    }
};

exports.updateRoom = async (req, res) => {
    const { id } = req.params; // MaPhong
    const { tenPhong, tang, loaiPhong, sucChua, trangThai, giaPhong } = req.body;
    try {
        const query = `
            UPDATE Phong 
            SET TenPhong = ?, Tang = ?, LoaiPhong = ?, SucChua = ?, TrangThai = ?, GiaPhong = ?
            WHERE MaPhong = ?
        `;
        await pool.execute(query, [tenPhong, tang, loaiPhong, sucChua, trangThai, giaPhong, id]);
        res.status(200).json({ message: 'Cập nhật phòng thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật phòng.' });
    }
};

exports.deleteRoom = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM Phong WHERE MaPhong = ?', [id]);
        res.status(200).json({ message: 'Đã xóa phòng.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi xóa phòng (Có thể phòng đang có sinh viên hoặc hóa đơn ràng buộc).' });
    }
};

// --- LẤY DANH SÁCH TẤT CẢ PHÒNG ---
exports.getAllRooms = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.MaPhong, p.TenPhong, p.Tang, p.LoaiPhong, p.SucChua, p.SoSinhVienHienTai, p.TrangThai, p.GiaPhong,
                t.TenToaNha, t.MaToaNha,
                k.TenKhu
            FROM Phong p
            JOIN ToaNha t ON p.MaToaNha = t.MaToaNha
            JOIN Khu k ON t.MaKhu = k.MaKhu
            ORDER BY t.TenToaNha, p.TenPhong
        `;
        const [rooms] = await pool.execute(query);
        res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách phòng.' });
    }
};