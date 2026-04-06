const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// API Đăng ký tài khoản sinh viên
router.post('/register', authController.register);

// API Đăng nhập (Dành cho cả Admin và Sinh viên)
router.post('/login', authController.login);

module.exports = router;