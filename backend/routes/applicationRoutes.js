const express = require('express');
const router = express.Router();
const { getApplications } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import your multer configuration

// GET /api/applications — role-scoped (candidate/employer/admin), required by the assessment spec
router.get('/', protect, getApplications);

// POST /api/applications/resume — Handles single PDF file upload for logged-in users
router.post('/resume', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a valid PDF file.' });
    }

    // Assuming your protect middleware attaches the user object to req.user
    const userId = req.user.id; 
    const resumePath = req.file.path;

    // TODO: Update your Database record here (Sequelize / Mongoose / Prisma)
    // Example: await User.update({ resumeUrl: resumePath }, { where: { id: userId } });

    res.status(200).json({
      message: 'Resume uploaded successfully!',
      filePath: resumePath,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;