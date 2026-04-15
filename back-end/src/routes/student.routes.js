const express = require('express');
const router = express.Router();

// Import Controller và Middleware
const studentController = require('../controllers/student.controller');
const { verifyToken, isStudent } = require('../middlewares/auth.middleware');
const profileController = require('../controllers/profile.controller');

// Áp dụng middleware: Yêu cầu phải có Token hợp lệ VÀ phải là Sinh viên
router.use(verifyToken, isStudent);

// Các API bên dưới tự động được bảo vệ
router.get('/rooms', studentController.getRoomList);
router.get('/my-contracts', studentController.getMyContracts);
router.post('/register-room', studentController.submitRegistration);
router.get('/my-invoices', studentController.getMyInvoices);
router.get('/unpaid-invoices', studentController.getUnpaidInvoices);
router.post('/incidents', studentController.submitIncident);
router.get('/rules', studentController.getRules);
router.get('/my-violations', studentController.getMyViolations);
router.put('/update-profile', profileController.updateMyProfile);
router.put('/change-password', profileController.changePassword);
router.get('/profile', profileController.getMyProfile);

module.exports = router;