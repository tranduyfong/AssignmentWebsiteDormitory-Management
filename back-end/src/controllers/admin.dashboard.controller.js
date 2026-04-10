const pool = require('../configs/db.config');

exports.getDashboardSummary = async (req, res) => {
    try {
        // 1. Thống kê Sinh viên
        const [studentStats] = await pool.execute(`
            SELECT COUNT(*) AS totalStudents 
            FROM SinhVien 
            WHERE MaPhong IS NOT NULL
        `);

        // 2. Thống kê Phòng KTX
        const [roomStats] = await pool.execute(`
            SELECT 
                COUNT(*) AS totalRooms,
                SUM(CASE WHEN SoSinhVienHienTai < SucChua THEN 1 ELSE 0 END) AS availableRooms,
                SUM(CASE WHEN SoSinhVienHienTai >= SucChua THEN 1 ELSE 0 END) AS fullRooms
            FROM Phong
        `);

        // 3. Thống kê Đơn đăng ký
        const [regStats] = await pool.execute(`
            SELECT 
                SUM(CASE WHEN TrangThai = 0 THEN 1 ELSE 0 END) AS pendingRegistrations,
                SUM(CASE WHEN TrangThai = 1 THEN 1 ELSE 0 END) AS approvedRegistrations,
                SUM(CASE WHEN TrangThai = 2 THEN 1 ELSE 0 END) AS rejectedRegistrations
            FROM DangKy
        `);

        // 4. Thống kê Phản ánh / Sự cố
        const [incidentStats] = await pool.execute(`
            SELECT 
                SUM(CASE WHEN TrangThai = 0 THEN 1 ELSE 0 END) AS pendingIncidents,
                SUM(CASE WHEN TrangThai = 1 THEN 1 ELSE 0 END) AS resolvedIncidents
            FROM PhanAnh
        `);

        // 5. Thống kê Doanh thu 6 tháng gần nhất (Dựa vào Hóa đơn ĐÃ THANH TOÁN)
        // Dùng DATE_FORMAT để nhóm theo Tháng-Năm
        const [revenueStats] = await pool.execute(`
            SELECT 
                DATE_FORMAT(ThoiGian, '%Y-%m') AS month,
                SUM(SoTien) AS totalRevenue
            FROM HoaDon
            WHERE TrangThaiThanhToan = 1
            GROUP BY month
            ORDER BY month DESC
            LIMIT 6
        `);

        // Ép kiểu dữ liệu (để tránh lỗi trả về giá trị null khi bảng trống)
        res.status(200).json({
            students: {
                totalActive: studentStats[0].totalStudents || 0
            },
            rooms: {
                total: roomStats[0].totalRooms || 0,
                available: roomStats[0].availableRooms || 0,
                full: roomStats[0].fullRooms || 0
            },
            registrations: {
                pending: regStats[0].pendingRegistrations || 0,
                approved: regStats[0].approvedRegistrations || 0,
                rejected: regStats[0].rejectedRegistrations || 0
            },
            incidents: {
                pending: incidentStats[0].pendingIncidents || 0,
                resolved: incidentStats[0].resolvedIncidents || 0
            },
            revenue: revenueStats // Trả về mảng [{month: '2026-04', totalRevenue: 1500000}, ...]
        });

    } catch (error) {
        console.error('Lỗi Dashboard:', error);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu Dashboard tổng hợp.' });
    }
};