const pool = require('../configs/db.config');

exports.recordUtilities = async (req, res) => {
    const { maPhong, chiSoDienCu, chiSoDienMoi, chiSoNuocCu, chiSoNuocMoi, thoiGian } = req.body;

    try {
        const checkQuery = 'SELECT MaDienNuoc FROM DienNuoc WHERE MaPhong = ? AND ThoiGian = ?';
        const [existingRecords] = await pool.execute(checkQuery, [maPhong, thoiGian]);

        if (existingRecords.length > 0) {
            return res.status(400).json({ 
                message: 'Tháng này phòng đã được ghi nhận chỉ số điện nước rồi. Không được tạo trùng!' 
            });
        }

        if (Number(chiSoDienMoi) < Number(chiSoDienCu) || Number(chiSoNuocMoi) < Number(chiSoNuocCu)) {
            return res.status(400).json({ 
                message: 'Chỉ số mới không được nhỏ hơn chỉ số cũ!' 
            });
        }

        // 3. THỰC HIỆN GHI DỮ LIỆU
        const insertQuery = `
            INSERT INTO DienNuoc (MaPhong, ChiSoDienCu, ChiSoDienMoi, ChiSoNuocCu, ChiSoNuocMoi, ThoiGian, TrangThaiChot)
            VALUES (?, ?, ?, ?, ?, ?, 0)
        `;
        
        await pool.execute(insertQuery, [
            maPhong, 
            chiSoDienCu, 
            chiSoDienMoi, 
            chiSoNuocCu, 
            chiSoNuocMoi, 
            thoiGian
        ]);

        res.status(201).json({ message: 'Ghi nhận chỉ số điện nước thành công!' });

    } catch (error) {
        console.error("Lỗi recordUtilities:", error);
        res.status(500).json({ message: 'Lỗi server khi ghi nhận điện nước.' });
    }
};
exports.updateUtility = async (req, res) => {
    const { id } = req.params; // MaDienNuoc
    const { maPhong, chiSoDienCu, chiSoDienMoi, chiSoNuocCu, chiSoNuocMoi, thoiGian } = req.body;

    try {
        // 1. Kiểm tra bản ghi có tồn tại không và trạng thái chốt
        const [records] = await pool.execute(
            'SELECT TrangThaiChot FROM DienNuoc WHERE MaDienNuoc = ?', 
            [id]
        );

        if (records.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bản ghi điện nước này.' });
        }

        // 2. Nếu đã chốt hóa đơn (TrangThaiChot = 1) thì KHÔNG cho sửa
        if (records[0].TrangThaiChot === 1) {
            return res.status(400).json({ 
                message: 'Dữ liệu đã được chốt hóa đơn, không thể chỉnh sửa!' 
            });
        }

        const checkDuplicateQuery = `
            SELECT MaDienNuoc FROM DienNuoc 
            WHERE MaPhong = ? AND ThoiGian = ? AND MaDienNuoc != ?
        `;
        const [duplicates] = await pool.execute(checkDuplicateQuery, [maPhong, thoiGian, id]);

        if (duplicates.length > 0) {
            return res.status(400).json({ 
                message: 'Không thể cập nhật! Tháng này phòng đã có một bản ghi điện nước khác tồn tại.' 
            });
        }

        // 3. KIỂM TRA CHỈ SỐ (Số mới không được nhỏ hơn số cũ)
        if (Number(chiSoDienMoi) < Number(chiSoDienCu) || Number(chiSoNuocMoi) < Number(chiSoNuocCu)) {
            return res.status(400).json({ 
                message: 'Chỉ số mới không được nhỏ hơn chỉ số cũ!' 
            });
        }

        // 3. Thực hiện cập nhật dữ liệu
        const query = `
            UPDATE DienNuoc 
            SET MaPhong = ?, 
                ChiSoDienCu = ?, 
                ChiSoDienMoi = ?, 
                ChiSoNuocCu = ?, 
                ChiSoNuocMoi = ?, 
                ThoiGian = ?
            WHERE MaDienNuoc = ?
        `;
        
        await pool.execute(query, [
            maPhong, 
            chiSoDienCu, 
            chiSoDienMoi, 
            chiSoNuocCu, 
            chiSoNuocMoi, 
            thoiGian, 
            id
        ]);

        res.status(200).json({ message: 'Cập nhật chỉ số điện nước thành công!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật dữ liệu.' });
    }
};
exports.deleteUtility = async (req, res) => {
    const { id } = req.params; // MaDienNuoc

    try {
        // 1. Kiểm tra bản ghi có tồn tại không và trạng thái chốt
        const [records] = await pool.execute(
            'SELECT TrangThaiChot FROM DienNuoc WHERE MaDienNuoc = ?', 
            [id]
        );

        if (records.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bản ghi điện nước này.' });
        }

        // 2. Nếu đã chốt hóa đơn (TrangThaiChot = 1) thì KHÔNG cho xóa
        if (records[0].TrangThaiChot === 1) {
            return res.status(400).json({ 
                message: 'Không thể xóa bản ghi này vì hóa đơn đã được khởi tạo và chốt dữ liệu.' 
            });
        }

        // 3. Thực hiện xóa nếu chưa chốt
        await pool.execute('DELETE FROM DienNuoc WHERE MaDienNuoc = ?', [id]);

        res.status(200).json({ message: 'Xóa chỉ số điện nước thành công!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi thực hiện xóa dữ liệu.' });
    }
};

exports.getAllUtilities = async (req, res) => {
    try {
        // Join với bảng Phong và ToaNha để hiển thị thông tin đầy đủ
        const query = `
            SELECT 
                dn.*, 
                p.TenPhong, 
                t.TenToaNha,
                k.TenKhu
            FROM DienNuoc dn
            JOIN Phong p ON dn.MaPhong = p.MaPhong
            JOIN ToaNha t ON p.MaToaNha = t.MaToaNha
            JOIN Khu k ON t.MaKhu = k.MaKhu 
            ORDER BY dn.ThoiGian DESC, p.TenPhong ASC
        `;
        
        const [results] = await pool.execute(query);
        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách chỉ số điện nước.' });
    }
};

// --- QUẢN LÝ HÓA ĐƠN ---
exports.createInvoice = async (req, res) => {
    const { maPhong, maSV, maDienNuoc, loaiHoaDon, kyHoaDon, soTien } = req.body;
    const ngayLap = new Date().toISOString().split('T')[0];
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        let finalAmount = Number(soTien);

        // --- LUỒNG 1: TIỀN PHÒNG (Tính toán tự động) ---
        if (loaiHoaDon === 'Tiền phòng') {
            // 1. Lấy thông tin hợp đồng hiện tại
            const [contracts] = await connection.execute(
                'SELECT NgayBatDau, NgayKetThuc FROM HopDong WHERE MaSV = ? AND TrangThai = 1 LIMIT 1',
                [maSV]
            );

            if (contracts.length === 0) throw new Error('Sinh viên không có hợp đồng hiệu lực!');

            const contract = contracts[0];
            const start = new Date(contract.NgayBatDau);
            const end = new Date(contract.NgayKetThuc);

            // 2. Tính TỔNG số tháng từ lúc bắt đầu đến lúc kết thúc mới
            let totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
            if (end.getDate() > start.getDate()) totalMonths++;
            if (totalMonths <= 0) totalMonths = 1;

            const DON_GIA = 500000; // 500k/tháng 
            const tongTienPhaiLap = totalMonths * DON_GIA;

            // 3. Tính xem sinh viên này đã có những hóa đơn "Tiền phòng" nào cho hợp đồng này chưa
            const [billedStats] = await connection.execute(
                `SELECT 
                    SUM(SoTien) as totalBilled,
                    COUNT(CASE WHEN TrangThaiThanhToan = 0 THEN 1 END) as unpaidInvoices
                 FROM HoaDon 
                 WHERE MaSV = ? AND LoaiHoaDon = 'Tiền phòng' AND NgayLap >= ?`,
                [maSV, contract.NgayBatDau]
            );

            const soTienDaLap = Number(billedStats[0].totalBilled || 0);
            const soHoaDonChuaThanhToan = Number(billedStats[0].unpaidInvoices || 0);


            finalAmount = tongTienPhaiLap - soTienDaLap;



            if (finalAmount <= 0) {
                if (soHoaDonChuaThanhToan > 0) {
                    throw new Error('Sinh viên này hiện đang có hóa đơn tiền phòng chưa thanh toán.');
                }
                throw new Error('Sinh viên đã được lập hóa đơn đủ cho toàn bộ thời hạn hợp đồng hiện tại.');
            }
        }

        // --- LUỒNG 2: ĐIỆN NƯỚC (Chia đầu người trong phòng) ---
        if (loaiHoaDon === 'Điện nước') {
            if (!maDienNuoc) throw new Error('Thiếu mã chỉ số điện nước!');

            const [students] = await connection.execute('SELECT MaSV FROM SinhVien WHERE MaPhong = ?', [maPhong]);
            if (students.length === 0) throw new Error('Phòng không có sinh viên ở!');

            const dividedAmount = Math.round(finalAmount / students.length);

            const queryBulk = `
                INSERT INTO HoaDon (MaPhong, MaSV, MaDienNuoc, LoaiHoaDon, KyHoaDon, SoTien, TrangThaiThanhToan, NgayLap)
                VALUES (?, ?, ?, ?, ?, ?, 0, ?)
            `;

            for (let sv of students) {
                await connection.execute(queryBulk, [maPhong, sv.MaSV, maDienNuoc, 'Điện nước', kyHoaDon, dividedAmount, ngayLap]);
            }

            await connection.execute('UPDATE DienNuoc SET TrangThaiChot = 1 WHERE MaDienNuoc = ?', [maDienNuoc]);
        } 
        // --- LUỒNG 3: TIỀN PHÒNG & PHÍ KHÁC (Tạo 1 hóa đơn cho 1 người) ---
        else {
            const querySingle = `
                INSERT INTO HoaDon (MaPhong, MaSV, MaDienNuoc, LoaiHoaDon, KyHoaDon, SoTien, TrangThaiThanhToan, NgayLap)
                VALUES (?, ?, NULL, ?, ?, ?, 0, ?)
            `;
            // Luôn ghi nhãn loaiHoaDon (ví dụ: "Tiền phòng") gửi từ Frontend
            await connection.execute(querySingle, [maPhong, maSV, loaiHoaDon, kyHoaDon, finalAmount, ngayLap]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Tạo hóa đơn thành công!', soTien: finalAmount });

    } catch (error) {
        await connection.rollback();
        console.error("Lỗi tạo hóa đơn:", error.message);
        res.status(400).json({ message: error.message || 'Lỗi hệ thống.' });
    } finally {
        connection.release();
    }
};

// xóa hóa đơn nhưng chỉ cho tiền phòng
exports.deleteInvoice = async (req, res) => {
    const { id } = req.params;
    try {
        // Kiểm tra xem hóa đơn đã đóng chưa
        const [invoice] = await pool.execute('SELECT TrangThaiThanhToan FROM HoaDon WHERE MaHoaDon = ?', [id]);
        if (invoice.length > 0 && invoice[0].TrangThaiThanhToan === 1) {
            return res.status(400).json({ message: 'Không thể xóa hóa đơn đã thanh toán!' });
        }
        await pool.execute('DELETE FROM HoaDon WHERE MaHoaDon = ?', [id]);
        res.status(200).json({ message: 'Đã xóa hóa đơn thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi xóa hóa đơn.' });
    }
};

exports.getAllInvoices = async (req, res) => {
    try {
        const query = `
            SELECT hd.*, s.HoTen as TenSinhVien, p.TenPhong
            FROM HoaDon hd
            JOIN SinhVien s ON hd.MaSV = s.MaSV
            JOIN Phong p ON hd.MaPhong = p.MaPhong
            ORDER BY hd.NgayLap DESC
        `;
        const [invoices] = await pool.execute(query);
        res.status(200).json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy danh sách hóa đơn.' });
    }
};