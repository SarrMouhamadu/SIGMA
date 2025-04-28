const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { auth, managerAuth } = require('../middleware/auth');

// Employee routes
router.post('/check-in', auth, attendanceController.checkIn);
router.post('/check-out', auth, attendanceController.checkOut);
router.get('/history', auth, attendanceController.getUserAttendance);

// Manager/Admin routes
router.get('/company', auth, managerAuth, attendanceController.getCompanyAttendance);
router.get('/statistics', auth, managerAuth, attendanceController.getStatistics);

module.exports = router;
