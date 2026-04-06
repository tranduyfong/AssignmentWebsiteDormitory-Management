const express = require('express');
const router = express.Router();

const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Import tất cả các Controllers của Admin
const adminController = require('../controllers/admin.controller');
const facilityController = require('../controllers/admin.facility.controller');
const financeController = require('../controllers/admin.finance.controller');
const operationController = require('../controllers/admin.operation.controller');

// Khóa bảo vệ: Mọi API dưới đây đều yêu cầu Token Admin
router.use(verifyToken, isAdmin);

// 1. Sinh viên & Đăng ký (Từ file admin.controller.js cũ)
router.get('/students', adminController.getAllStudents);
router.get('/registrations', adminController.getPendingRegistrations);
router.post('/registrations/approve', adminController.approveRegistration);

// 2. Cơ sở vật chất (Khu, Tòa, Phòng)
router.post('/rooms', facilityController.createRoom);
router.put('/rooms/:id', facilityController.updateRoom);
router.delete('/rooms/:id', facilityController.deleteRoom);
router.get('/rooms', facilityController.getAllRooms);

// 3. Tài chính (Điện nước, Hóa đơn)
router.post('/utilities', financeController.recordUtilities);
router.get('/invoices', financeController.getAllInvoices);
router.post('/invoices', financeController.createInvoice);

// 4. Vận hành (Nội quy, Vi phạm, Sự cố)
router.post('/rules', operationController.createRule);
router.get('/violations', operationController.getAllViolations);
router.post('/violations', operationController.recordViolation);
router.put('/incidents/:id/resolve', operationController.updateIncidentStatus);
router.get('/incidents', operationController.getAllIncidents);

module.exports = router;