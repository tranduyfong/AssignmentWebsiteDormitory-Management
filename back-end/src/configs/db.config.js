const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true, // Hàng đợi nếu các kết nối đang bận
    connectionLimit: 10,      // Giới hạn số lượng kết nối đồng thời (tùy chỉnh theo server)
    queueLimit: 0             // Không giới hạn hàng đợi
});

// Kiểm tra kết nối ngay khi file được load
pool.getConnection()
    .then((connection) => {
        console.log('✅ Đã kết nối thành công tới Database: KTX_HUMG');
        connection.release(); // Trả lại kết nối cho pool sau khi test xong
    })
    .catch((err) => {
        console.error('❌ Lỗi kết nối Database:', err.message);
    });

module.exports = pool;