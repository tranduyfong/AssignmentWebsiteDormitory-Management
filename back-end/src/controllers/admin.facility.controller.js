const pool = require('../configs/db.config');

// --- QUẢN LÝ KHU ---
exports.getAllZones = async (req, res) => {
    try {
        const [zones] = await pool.execute('SELECT * FROM Khu ORDER BY TenKhu ASC');
        res.status(200).json(zones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách Khu.' });
    }
};

exports.createZone = async (req, res) => {
    const { tenKhu } = req.body;
    try {
        await pool.execute('INSERT INTO Khu (TenKhu) VALUES (?)', [tenKhu]);
        res.status(201).json({ message: 'Thêm Khu mới thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi thêm Khu.' });
    }
};

exports.updateZone = async (req, res) => {
    const { id } = req.params; // MaKhu
    const { tenKhu } = req.body;
    try {
        await pool.execute('UPDATE Khu SET TenKhu = ? WHERE MaKhu = ?', [tenKhu, id]);
        res.status(200).json({ message: 'Cập nhật tên Khu thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật Khu.' });
    }
};

exports.deleteZone = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM Khu WHERE MaKhu = ?', [id]);
        res.status(200).json({ message: 'Xóa Khu thành công!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Không thể xóa Khu này vì đang có Tòa nhà trực thuộc!' });
    }
};

// --- QUẢN LÝ TÒA NHÀ ---
exports.getAllBuildings = async (req, res) => {
    try {
        const query = `
            SELECT t.MaToaNha, t.TenToaNha, k.MaKhu, k.TenKhu 
            FROM ToaNha t
            JOIN Khu k ON t.MaKhu = k.MaKhu
            ORDER BY k.TenKhu ASC, t.TenToaNha ASC
        `;
        const [buildings] = await pool.execute(query);
        res.status(200).json(buildings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách Tòa nhà.' });
    }
};

exports.createBuilding = async (req, res) => {
    const { maKhu, tenToaNha } = req.body;
    try {
        await pool.execute('INSERT INTO ToaNha (MaKhu, TenToaNha) VALUES (?, ?)', [maKhu, tenToaNha]);
        res.status(201).json({ message: 'Thêm Tòa nhà mới thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi thêm Tòa nhà.' });
    }
};

exports.updateBuilding = async (req, res) => {
    const { id } = req.params; // MaToaNha
    const { maKhu, tenToaNha } = req.body;
    try {
        await pool.execute('UPDATE ToaNha SET MaKhu = ?, TenToaNha = ? WHERE MaToaNha = ?', [maKhu, tenToaNha, id]);
        res.status(200).json({ message: 'Cập nhật Tòa nhà thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật Tòa nhà.' });
    }
};

exports.deleteBuilding = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM ToaNha WHERE MaToaNha = ?', [id]);
        res.status(200).json({ message: 'Xóa Tòa nhà thành công!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Không thể xóa Tòa nhà này vì đang có Phòng trực thuộc!' });
    }
};

// --- QUẢN LÝ PHÒNG ---
exports.createRoom = async (req, res) => {
    const { maToaNha, tenPhong, loaiPhong, sucChua, giaPhong } = req.body;
    try {
        const query = `
            INSERT INTO Phong (MaToaNha, TenPhong, LoaiPhong, SucChua, SoSinhVienHienTai) 
            VALUES (?, ?, ?, ?, 0)
        `;
        await pool.execute(query, [maToaNha, tenPhong, loaiPhong, sucChua]);
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
                p.MaPhong, p.TenPhong, p.LoaiPhong, p.SucChua, p.SoSinhVienHienTai,
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