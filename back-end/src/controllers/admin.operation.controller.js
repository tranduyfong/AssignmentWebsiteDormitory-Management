const pool = require('../configs/db.config');

// --- QUẢN LÝ NỘI QUY ---

// 1. Lấy danh sách tất cả nội quy (Admin)
exports.getAllRules = async (req, res) => {
    try {
        // Lấy tất cả, sắp xếp theo ngày cập nhật mới nhất
        const [rules] = await pool.execute('SELECT * FROM NoiQuy ORDER BY NgayCapNhat DESC');
        res.status(200).json(rules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tải danh sách nội quy.' });
    }
};

// 2. Thêm nội quy mới
exports.createRule = async (req, res) => {
    const { tieuDe, danhMuc, noiDung, trangThai } = req.body;
    const ngayCapNhat = new Date().toISOString().split('T')[0]; // Lấy ngày hôm nay

    // Quy ước: Trang thái gửi lên có thể là số (1, 0) hoặc chuỗi
    const status = (trangThai === 1 || trangThai === 'Đang áp dụng') ? 1 : 0;

    try {
        await pool.execute(
            'INSERT INTO NoiQuy (TieuDe, DanhMuc, NoiDung, NgayCapNhat, TrangThai) VALUES (?, ?, ?, ?, ?)',
            [tieuDe, danhMuc, noiDung, ngayCapNhat, status]
        );
        res.status(201).json({ message: 'Thêm nội quy thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi thêm nội quy.' });
    }
};

// 3. Cập nhật nội quy
exports.updateRule = async (req, res) => {
    const { id } = req.params; // MaNoiQuy
    const { tieuDe, danhMuc, noiDung, trangThai } = req.body;
    const ngayCapNhat = new Date().toISOString().split('T')[0]; // Cập nhật lại ngày sửa

    const status = (trangThai === 1 || trangThai === 'Đang áp dụng') ? 1 : 0;

    try {
        const [result] = await pool.execute(
            'UPDATE NoiQuy SET TieuDe = ?, DanhMuc = ?, NoiDung = ?, NgayCapNhat = ?, TrangThai = ? WHERE MaNoiQuy = ?',
            [tieuDe, danhMuc, noiDung, ngayCapNhat, status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy nội quy này.' });
        }
        res.status(200).json({ message: 'Cập nhật nội quy thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật nội quy.' });
    }
};

// 4. Xóa nội quy
exports.deleteRule = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM NoiQuy WHERE MaNoiQuy = ?', [id]);
        res.status(200).json({ message: 'Đã xóa nội quy thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi xóa nội quy.' });
    }
};

// --- VI PHẠM ---
exports.recordViolation = async (req, res) => {
    const { maSV, loaiViPham, noiDung, hinhThucXuLy } = req.body;
    const ngayViPham = new Date().toISOString().split('T')[0];
    try {
        await pool.execute(
            'INSERT INTO ViPham (MaSV, NgayViPham, LoaiViPham, NoiDung, HinhThucXuLy, TrangThai) VALUES (?, ?, ?, ?, ?, 0)',
            [maSV, ngayViPham, loaiViPham, noiDung, hinhThucXuLy]
        );
        res.status(201).json({ message: 'Ghi nhận vi phạm thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi ghi nhận vi phạm.' });
    }
};

exports.getAllViolations = async (req, res) => {
    try {
        const query = `
            SELECT v.*, s.HoTen as TenSinhVien, p.TenPhong 
            FROM ViPham v
            JOIN SinhVien s ON v.MaSV = s.MaSV
            LEFT JOIN Phong p ON s.MaPhong = p.MaPhong
            ORDER BY v.NgayViPham DESC
        `;
        const [violations] = await pool.execute(query);
        res.status(200).json(violations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy danh sách vi phạm.' });
    }
};

exports.updateViolationStatus = async (req, res) => {
    const { id } = req.params; // MaViPham lấy từ URL
    const { trangThai } = req.body; // Lấy trạng thái mới từ body (thường là 1)

    try {
        const [result] = await pool.execute(
            'UPDATE ViPham SET TrangThai = ? WHERE MaViPham = ?',
            [trangThai, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bản ghi vi phạm này.' });
        }

        res.status(200).json({ message: 'Cập nhật trạng thái vi phạm thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái vi phạm.' });
    }
};

// --- XÓA VI PHẠM ---
exports.deleteViolation = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.execute('DELETE FROM ViPham WHERE MaViPham = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy vi phạm để xóa.' });
        }
        
        res.status(200).json({ message: 'Đã xóa bản ghi vi phạm thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi xóa vi phạm.' });
    }
};

// --- PHẢN ÁNH ---
exports.updateIncidentStatus = async (req, res) => {
    const { id } = req.params; // MaPhanAnh
    try {
        await pool.execute('UPDATE PhanAnh SET TrangThai = 1 WHERE MaPhanAnh = ?', [id]);
        res.status(200).json({ message: 'Đã đánh dấu xử lý xong sự cố.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi cập nhật phản ánh.' });
    }
};

exports.getAllIncidents = async (req, res) => {
    try {
        const query = `
            SELECT pa.*, s.HoTen as TenSinhVien, p.TenPhong 
            FROM PhanAnh pa
            JOIN SinhVien s ON pa.MaSV = s.MaSV
            LEFT JOIN Phong p ON s.MaPhong = p.MaPhong
            ORDER BY pa.NgayGui DESC
        `;
        const [incidents] = await pool.execute(query);
        res.status(200).json(incidents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy danh sách phản ánh.' });
    }
};