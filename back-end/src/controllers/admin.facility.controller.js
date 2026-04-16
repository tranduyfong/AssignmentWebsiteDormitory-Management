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
    // Bổ sung trangThai vào destructuring
    const { maToaNha, tenPhong, loaiPhong, sucChua, gioiTinh, trangThai } = req.body;
    try {
        const query = `
            INSERT INTO Phong (MaToaNha, TenPhong, LoaiPhong, GioiTinh, SucChua, TrangThai, SoSinhVienHienTai) 
            VALUES (?, ?, ?, ?, ?, ?, 0)
        `;
        // Nếu frontend không gửi trangThai, mặc định là 'Trống'
        const status = trangThai || 'Trống';

        await pool.execute(query, [maToaNha, tenPhong, loaiPhong, gioiTinh, sucChua, status]);
        res.status(201).json({ message: 'Thêm phòng mới thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi thêm phòng.' });
    }
};


exports.updateRoom = async (req, res) => {
    const { id } = req.params;
    const { tenPhong, loaiPhong, sucChua, gioiTinh, trangThai } = req.body;
    try {
        const query = `
            UPDATE Phong 
            SET TenPhong = ?, LoaiPhong = ?, GioiTinh = ?, SucChua = ?, TrangThai = ?
            WHERE MaPhong = ?
        `;
        await pool.execute(query, [tenPhong, loaiPhong, gioiTinh, sucChua, trangThai, id]);
        res.status(200).json({ message: 'Cập nhật phòng thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật phòng.' });
    }
};

exports.deleteRoom = async (req, res) => {
    const { id } = req.params; // MaPhong

    try {
        const [rooms] = await pool.execute(
            'SELECT TenPhong, SoSinhVienHienTai FROM Phong WHERE MaPhong = ?',
            [id]
        );

        if (rooms.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phòng để xóa.' });
        }

        const room = rooms[0];

        if (room.SoSinhVienHienTai > 0) {
            return res.status(400).json({
                message: `Không thể xóa! Phòng ${room.TenPhong} hiện đang có ${room.SoSinhVienHienTai} sinh viên đang cư trú.`
            });
        }

        await pool.execute('DELETE FROM Phong WHERE MaPhong = ?', [id]);

        res.status(200).json({ message: `Đã xóa phòng ${room.TenPhong} thành công.` });

    } catch (error) {
        console.error("Lỗi khi xóa phòng:", error);

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                message: 'Không thể xóa phòng này vì vẫn còn dữ liệu lịch sử (hóa đơn, đăng ký cũ) liên quan trong hệ thống.'
            });
        }

        res.status(500).json({ message: 'Lỗi server khi thực hiện xóa phòng.' });
    }
};

// --- LẤY DANH SÁCH TẤT CẢ PHÒNG ---
exports.getAllRooms = async (req, res) => {
    try {
        const query = `
            SELECT p.*, t.TenToaNha, k.TenKhu
            FROM Phong p
            JOIN ToaNha t ON p.MaToaNha = t.MaToaNha
            JOIN Khu k ON t.MaKhu = k.MaKhu
            ORDER BY p.TenPhong ASC
        `;
        const [rooms] = await pool.execute(query);
        res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy danh sách phòng.' });
    }
};


exports.updateRoomStatus = async (req, res) => {
    const { id } = req.params; // MaPhong
    const { trangThai } = req.body; // 'Bảo trì' hoặc 'Trống'

    try {
        const query = `UPDATE Phong SET TrangThai = ? WHERE MaPhong = ?`;
        const [result] = await pool.execute(query, [trangThai, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phòng!' });
        }

        res.status(200).json({ message: 'Cập nhật trạng thái thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái.' });
    }
};