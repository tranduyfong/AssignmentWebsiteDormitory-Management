const pool = require('../configs/db.config');

exports.getDashboardSummary = async (req, res) => {
    try {
        // 1. Thống kê Sinh viên đang ở nội trú
        const [studentStats] = await pool.execute(`
            SELECT COUNT(*) AS totalStudents 
            FROM SinhVien 
            WHERE MaPhong IS NOT NULL
        `);

        // 2. Thống kê trạng thái Phòng tổng quát
        const [roomStats] = await pool.execute(`
            SELECT 
                COUNT(*) AS totalRooms,
                SUM(CASE WHEN TrangThai = 'Trống' THEN 1 ELSE 0 END) AS emptyRooms,
                SUM(CASE WHEN TrangThai = 'Còn chỗ' THEN 1 ELSE 0 END) AS availableRooms,
                SUM(CASE WHEN TrangThai = 'Đã đầy' THEN 1 ELSE 0 END) AS fullRooms,
                SUM(CASE WHEN TrangThai = 'Bảo trì' THEN 1 ELSE 0 END) AS maintenanceRooms
            FROM Phong
        `);

        // 3. Thống kê chi tiết theo loại phòng
        const [roomTypeStatsRaw] = await pool.execute(`
            SELECT 
                LoaiPhong as type,
                COUNT(*) AS total,
                SUM(CASE WHEN TrangThai = 'Đã đầy' THEN 1 ELSE 0 END) AS occupied,
                SUM(CASE WHEN TrangThai = 'Trống' OR TrangThai = 'Còn chỗ' THEN 1 ELSE 0 END) AS available
            FROM Phong
            GROUP BY LoaiPhong
        `);

        // 4. Thống kê Đơn đăng ký (0: Chờ, 1: Duyệt)
        const [regStats] = await pool.execute(`
            SELECT 
                IFNULL(SUM(CASE WHEN TrangThai = 0 THEN 1 ELSE 0 END), 0) AS pendingRegistrations,
                IFNULL(SUM(CASE WHEN TrangThai = 1 THEN 1 ELSE 0 END), 0) AS approvedRegistrations
            FROM DangKy
        `);

        // 5. Thống kê Phản ánh & Vi phạm chưa xử lý
        const [issueStats] = await pool.execute(`
            SELECT 
                (SELECT COUNT(*) FROM PhanAnh WHERE TrangThai = 0) AS pendingIncidents,
                (SELECT COUNT(*) FROM ViPham WHERE TrangThai = 0) AS pendingViolations
        `);

        // 6. Thống kê Doanh thu 6 tháng gần nhất
        const [revenueStatsRaw] = await pool.execute(`
            SELECT 
                DATE_FORMAT(NgayLap, '%m/%Y') AS monthLabel,
                DATE_FORMAT(NgayLap, '%Y-%m') AS monthValue,
                SUM(SoTien) AS totalRevenue
            FROM HoaDon
            WHERE TrangThaiThanhToan = 1
            GROUP BY monthValue, monthLabel
            ORDER BY monthValue DESC
            LIMIT 6
        `);

        // --- ÉP KIỂU DỮ LIỆU SỐ TRƯỚC KHI TRẢ VỀ ---
        
        // Ép kiểu cho Room Type Stats (Mảng)
        const roomTypeStats = roomTypeStatsRaw.map(item => ({
            type: item.type,
            total: Number(item.total || 0),
            occupied: Number(item.occupied || 0),
            available: Number(item.available || 0)
        }));

        // Ép kiểu cho Doanh thu (Mảng)
        const revenue = revenueStatsRaw.reverse().map(item => ({
            monthLabel: item.monthLabel,
            monthValue: item.monthValue,
            totalRevenue: Number(item.totalRevenue || 0)
        }));

        // Trả về JSON với dữ liệu chuẩn số
        res.status(200).json({
            students: { 
                totalActive: Number(studentStats[0].totalStudents || 0) 
            },
            rooms: {
                totalRooms: Number(roomStats[0].totalRooms || 0),
                emptyRooms: Number(roomStats[0].emptyRooms || 0),
                availableRooms: Number(roomStats[0].availableRooms || 0),
                fullRooms: Number(roomStats[0].fullRooms || 0),
                maintenanceRooms: Number(roomStats[0].maintenanceRooms || 0)
            },
            roomTypeStats: roomTypeStats,
            registrations: { 
                pending: Number(regStats[0].pendingRegistrations || 0),
                approved: Number(regStats[0].approvedRegistrations || 0)
            },
            issues: {
                incidents: Number(issueStats[0].pendingIncidents || 0),
                violations: Number(issueStats[0].pendingViolations || 0)
            },
            revenue: revenue
        });

    } catch (error) {
        console.error('Lỗi API Dashboard:', error);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu thống kê tổng hợp.' });
    }
};