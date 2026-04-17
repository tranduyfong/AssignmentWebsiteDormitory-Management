const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// API Đăng ký tài khoản sinh viên
router.post('/register', authController.register);

// API Đăng nhập (Dành cho cả Admin và Sinh viên)
router.post('/login', authController.login);

router.get('/verify-email', authController.verifyEmail);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;