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
                t.TenToaNha
            FROM DienNuoc dn
            JOIN Phong p ON dn.MaPhong = p.MaPhong
            JOIN ToaNha t ON p.MaToaNha = t.MaToaNha
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

        // LUỒNG 1: NẾU LÀ HÓA ĐƠN ĐIỆN NƯỚC -> CHIA ĐỀU CHO SINH VIÊN TRONG PHÒNG
        if (loaiHoaDon === 'Điện nước' && maDienNuoc) {
            // 1. Tìm danh sách sinh viên đang ở trong phòng này
            const [students] = await connection.execute(
                'SELECT MaSV FROM SinhVien WHERE MaPhong = ?', 
                [maPhong]
            );

            if (students.length === 0) {
                throw new Error('Phòng này hiện không có sinh viên nào cư trú để chia hóa đơn!');
            }

            // 2. Tính số tiền chia đầu người
            const count = students.length;
            const dividedAmount = Math.round(soTien / count); // Làm tròn số tiền

            // 3. Lặp qua danh sách SV để tạo từng hóa đơn
            const insertInvoiceQuery = `
                INSERT INTO HoaDon (MaPhong, MaSV, MaDienNuoc, LoaiHoaDon, KyHoaDon, SoTien, TrangThaiThanhToan, NgayLap)
                VALUES (?, ?, ?, ?, ?, ?, 0, ?)
            `;

            for (let sv of students) {
                await connection.execute(insertInvoiceQuery, [
                    maPhong, 
                    sv.MaSV, 
                    maDienNuoc, 
                    'Điện nước', 
                    kyHoaDon, 
                    dividedAmount, 
                    ngayLap
                ]);
            }

            // 4. Cập nhật trạng thái đã chốt cho bản ghi điện nước
            await connection.execute(
                'UPDATE DienNuoc SET TrangThaiChot = 1 WHERE MaDienNuoc = ?', 
                [maDienNuoc]
            );

        } 
        // LUỒNG 2: NẾU LÀ TIỀN PHÒNG HOẶC PHÍ KHÁC -> GIỮ NGUYÊN (TẠO 1 HÓA ĐƠN)
        else {
            const queryHoaDon = `
                INSERT INTO HoaDon (MaPhong, MaSV, MaDienNuoc, LoaiHoaDon, KyHoaDon, SoTien, TrangThaiThanhToan, NgayLap)
                VALUES (?, ?, ?, ?, ?, ?, 0, ?)
            `;
            await connection.execute(queryHoaDon, [
                maPhong, 
                maSV, 
                maDienNuoc || null, 
                loaiHoaDon, 
                kyHoaDon, 
                soTien, 
                ngayLap
            ]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Khởi tạo hóa đơn thành công!' });

    } catch (error) {
        await connection.rollback();
        console.error("Lỗi createInvoice:", error);
        res.status(400).json({ message: error.message || 'Lỗi khi tạo hóa đơn.' });
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