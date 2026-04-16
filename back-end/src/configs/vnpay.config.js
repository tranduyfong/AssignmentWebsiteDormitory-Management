const { VNPay } = require('vnpay');
require('dotenv').config();

const vnpayInstance = new VNPay({
    tmnCode: process.env.VNP_TMN_CODE,          // Mã Website của bạn tại VNPay
    secureSecret: process.env.VNP_HASH_SECRET,   // Chuỗi bí mật tạo checksum
    vnpayHost: 'https://sandbox.vnpayment.vn', // Link môi trường Test
    testMode: true, // Bật môi trường test
    hashAlgorithm: 'SHA512',
});

module.exports = {
    vnpay: vnpayInstance,
    returnUrl: "http://localhost:5000/api/student/vnpay-return" // Nhớ sửa port 5000 thành port Backend của bạn
};