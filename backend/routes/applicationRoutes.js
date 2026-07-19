const express = require('express');
const router = express.Router();
const { getApplications } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/applications — role-scoped (candidate/employer/admin), required by the assessment spec
router.get('/', protect, getApplications);

module.exports = router;
