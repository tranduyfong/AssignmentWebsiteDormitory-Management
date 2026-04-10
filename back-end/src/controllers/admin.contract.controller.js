const pool = require('../configs/db.config');

// 1. Lấy danh sách toàn bộ hợp đồng
exports.getAllContracts = async (req, res) => {
    try {
        const query = `
            SELECT h.*, s.HoTen AS TenSinhVien, p.TenPhong 
            FROM HopDong h
            JOIN SinhVien s ON h.MaSV = s.MaSV
            JOIN Phong p ON h.MaPhong = p.MaPhong
            ORDER BY h.TrangThai DESC, h.NgayBatDau DESC
        `;
        const [contracts] = await pool.execute(query);
        res.status(200).json(contracts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách hợp đồng.' });
    }
};

// 2. Gia hạn hợp đồng
exports.extendContract = async (req, res) => {
    const { id } = req.params; // MaHopDong
    const { ngayKetThucMoi } = req.body;

    try {
        // Cập nhật ngày kết thúc mới
        const query = 'UPDATE HopDong SET NgayKetThuc = ? WHERE MaHopDong = ? AND TrangThai = 1';
        const [result] = await pool.execute(query, [ngayKetThucMoi, id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Không thể gia hạn. Hợp đồng không tồn tại hoặc đã hết hiệu lực!' });
        }

        res.status(200).json({ message: 'Gia hạn hợp đồng thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi gia hạn hợp đồng.' });
    }
};

// 3. Chấm dứt hợp đồng (Xử lý Transaction)
exports.terminateContract = async (req, res) => {
    const { id } = req.params; // MaHopDong
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Bước 1: Lấy thông tin hợp đồng để biết MaSV và MaPhong
        const [contracts] = await connection.execute('SELECT MaSV, MaPhong, TrangThai FROM HopDong WHERE MaHopDong = ?', [id]);
        if (contracts.length === 0) throw new Error('Hợp đồng không tồn tại!');

        const contract = contracts[0];
        if (contract.TrangThai === 0) throw new Error('Hợp đồng này đã được chấm dứt từ trước!');

        // Bước 2: Cập nhật trạng thái hợp đồng -> 0 (Hết hạn/Chấm dứt)
        await connection.execute('UPDATE HopDong SET TrangThai = 0 WHERE MaHopDong = ?', [id]);

        // Bước 3: Gỡ phòng khỏi thông tin Sinh viên (Set MaPhong = NULL)
        await connection.execute('UPDATE SinhVien SET MaPhong = NULL WHERE MaSV = ?', [contract.MaSV]);

        // Bước 4: Giảm số lượng sinh viên hiện tại của Phòng xuống 1
        await connection.execute('UPDATE Phong SET SoSinhVienHienTai = GREATEST(SoSinhVienHienTai - 1, 0) WHERE MaPhong = ?', [contract.MaPhong]);

        await connection.commit();
        res.status(200).json({ message: 'Chấm dứt hợp đồng thành công. Đã giải phóng chỗ ở của sinh viên!' });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(400).json({ message: error.message || 'Lỗi khi chấm dứt hợp đồng.' });
    } finally {
        connection.release();
    }
};