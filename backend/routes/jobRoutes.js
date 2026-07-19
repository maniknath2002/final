const express = require('express');
const router = express.Router();
const { 
  getAllJobs, 
  getJobById, 
  createJob, 
  updateJob, 
  deleteJob, 
  applyToJob,
  getJobApplicants,
  saveJob,
  unsaveJob,
  getSavedJobs,
  getMyJobs,
} = require('../controllers/jobController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllJobs);

// IMPORTANT: these static routes must come before '/:id' or Express will treat them as an id
router.get('/saved/me', protect, authorizeRoles('Candidate'), getSavedJobs);
router.get('/employer/mine', protect, authorizeRoles('Employer'), getMyJobs);

router.get('/:id', getJobById);

// Candidate routes
router.post('/:id/apply', protect, authorizeRoles('Candidate'), applyToJob);
router.post('/:id/save', protect, authorizeRoles('Candidate'), saveJob);
router.delete('/:id/save', protect, authorizeRoles('Candidate'), unsaveJob);

// Employer & Admin routes
router.post('/', protect, authorizeRoles('Employer', 'Admin'), createJob);
router.put('/:id', protect, authorizeRoles('Employer', 'Admin'), updateJob);
router.delete('/:id', protect, authorizeRoles('Employer', 'Admin'), deleteJob);
router.get('/:id/applicants', protect, authorizeRoles('Employer', 'Admin'), getJobApplicants);

module.exports = router;