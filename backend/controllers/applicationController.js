const { Application, Job, User } = require('../models');
const { Op } = require('sequelize');

// GET /api/applications
// Candidate -> sees their own applications
// Employer  -> sees applications to jobs they posted
// Admin     -> sees everything
exports.getApplications = async (req, res) => {
  try {
    const { role, id } = req.user;
    let applications;

    const includeJob = { model: Job, as: 'job' };
    const includeCandidate = { model: User, as: 'candidate', attributes: ['id', 'name', 'email'] };

    if (role === 'Candidate') {
      applications = await Application.findAll({
        where: { candidateId: id },
        include: [includeJob],
        order: [['createdAt', 'DESC']],
      });
    } else if (role === 'Employer') {
      // Find jobs this employer posted, then applications against those jobs
      const myJobs = await Job.findAll({ where: { postedBy: id }, attributes: ['id'] });
      const myJobIds = myJobs.map((j) => j.id);
      applications = await Application.findAll({
        where: { jobId: { [Op.in]: myJobIds } },
        include: [includeJob, includeCandidate],
        order: [['createdAt', 'DESC']],
      });
    } else {
      // Admin sees all applications
      applications = await Application.findAll({
        include: [includeJob, includeCandidate],
        order: [['createdAt', 'DESC']],
      });
    }

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};
