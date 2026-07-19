const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/dashboardController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Dashboard metrics route - Protected: Admin only
router.get('/stats', protect, authorizeRoles('Admin'), getAdminStats);

module.exports = router;