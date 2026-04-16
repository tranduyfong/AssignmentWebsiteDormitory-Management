const express = require('express');
const router = express.Router();

const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Import tất cả các Controllers của Admin
const adminController = require('../controllers/admin.controller');
const facilityController = require('../controllers/admin.facility.controller');
const financeController = require('../controllers/admin.finance.controller');
const operationController = require('../controllers/admin.operation.controller');
const contractController = require('../controllers/admin.contract.controller');
const dashboardController = require('../controllers/admin.dashboard.controller');

// Khóa bảo vệ: Mọi API dưới đây đều yêu cầu Token Admin
router.use(verifyToken, isAdmin);

// 1. Sinh viên & Đăng ký (Từ file admin.controller.js cũ)
router.get('/students', adminController.getAllStudents);
router.get('/registrations', adminController.getPendingRegistrations);
router.post('/registrations/approve', adminController.approveRegistration);
router.put('/registrations/:id/reject', adminController.rejectRegistration);
router.post('/students', adminController.createStudent);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// 2. Cơ sở vật chất (Khu, Tòa, Phòng)

// -- Routes cho Khu --
router.get('/zones', facilityController.getAllZones);
router.post('/zones', facilityController.createZone);
router.put('/zones/:id', facilityController.updateZone);
router.delete('/zones/:id', facilityController.deleteZone);

// -- Routes cho Tòa nhà --
router.get('/buildings', facilityController.getAllBuildings);
router.post('/buildings', facilityController.createBuilding);
router.put('/buildings/:id', facilityController.updateBuilding);
router.delete('/buildings/:id', facilityController.deleteBuilding);

// -- Routes cho Phòng (Giữ nguyên code cũ của bạn) --
router.post('/rooms', facilityController.createRoom);
router.put('/rooms/:id', facilityController.updateRoom);
router.delete('/rooms/:id', facilityController.deleteRoom);
router.get('/rooms', facilityController.getAllRooms);
router.put('/rooms/:id/status', facilityController.updateRoomStatus);

// 3. Tài chính (Điện nước, Hóa đơn)
router.post('/utilities', financeController.recordUtilities);
router.get('/utilities', financeController.getAllUtilities);
router.put('/utilities/:id', financeController.updateUtility);
router.delete('/utilities/:id', financeController.deleteUtility);
router.get('/invoices', financeController.getAllInvoices);
router.post('/invoices', financeController.createInvoice);
router.delete('/invoices/:id', financeController.deleteInvoice);

// 4. Vận hành (Nội quy, Vi phạm, Sự cố)

// -- Nội quy --
router.get('/rules', operationController.getAllRules);
router.post('/rules', operationController.createRule);
router.put('/rules/:id', operationController.updateRule);
router.delete('/rules/:id', operationController.deleteRule);

// -- Vi phạm & Sự cố (Giữ nguyên) --
router.get('/violations', operationController.getAllViolations);
router.post('/violations', operationController.recordViolation);
router.put('/violations/:id/status', operationController.updateViolationStatus); 
router.delete('/violations/:id', operationController.deleteViolation);     
router.put('/incidents/:id/resolve', operationController.updateIncidentStatus);
router.get('/incidents', operationController.getAllIncidents);

// 5. Quản lý Hợp đồng
router.get('/contracts', contractController.getAllContracts);
router.put('/contracts/:id/extend', contractController.extendContract);
router.put('/contracts/:id/terminate', contractController.terminateContract);

// 6. Thống kê - Báo cáo (Dashboard)
router.get('/dashboard/summary', dashboardController.getDashboardSummary);

module.exports = router;