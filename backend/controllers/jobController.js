const { Job, Application, SavedJob, User } = require('../models');
const { Op } = require('sequelize');

// 1. CREATE A NEW JOB (Updated to attach the Employer's ID)
exports.createJob = async (req, res) => {
  try {
    // Automatically link the job to the logged-in user (Employer/Admin)
    const jobData = {
      ...req.body,
      postedBy: req.user ? req.user.id : null,
      source: 'Manual'
    };

    const savedJob = await Job.create(jobData);
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
};

// 2. GET ALL JOBS (With Search, Pagination, and Filters)
exports.getAllJobs = async (req, res) => {
  try {
    const { search, workMode, employmentType, page = 1, limit = 10 } = req.query;

    const where = { status: 'Open' }; // hide closed listings from public/candidate view

    if (search) {
      // Op.iLike is Postgres's case-insensitive LIKE — the equivalent of Mongo's
      // { $regex: search, $options: 'i' }
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (workMode) {
      where.workMode = workMode;
    }

    if (employmentType) {
      where.employmentType = employmentType;
    }

    const skipAmount = (page - 1) * limit;
    const { count: totalJobs, rows: jobs } = await Job.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: skipAmount,
      limit: Number(limit),
    });

    res.json({
      totalJobs,
      currentPage: Number(page),
      totalPages: Math.ceil(totalJobs / limit),
      jobs
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

// 3. GET A SINGLE JOB BY ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job details', error: error.message });
  }
};

// 4. UPDATE A JOB
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Ownership check: employers can only edit jobs they posted. Admins bypass this.
    const isOwner = job.postedBy && String(job.postedBy) === String(req.user.id);
    const isAdmin = req.user.role === 'Admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You do not own this job listing.' });
    }

    const updatedJob = await job.update(req.body);
    res.json({ message: 'Job updated successfully!', updatedJob });
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
};

// 5. DELETE A JOB
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Ownership check: employers can only delete jobs they posted. Admins bypass this.
    const isOwner = job.postedBy && String(job.postedBy) === String(req.user.id);
    const isAdmin = req.user.role === 'Admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You do not own this job listing.' });
    }

    await job.destroy();
    res.json({ message: 'Job deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
};

// 6b. VIEW APPLICANTS FOR A JOB (Employer who owns the job, or Admin)
exports.getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const isOwner = job.postedBy && String(job.postedBy) === String(req.user.id);
    const isAdmin = req.user.role === 'Admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You do not own this job listing.' });
    }

    const applicants = await Application.findAll({
      where: { jobId: job.id },
      include: [{ model: User, as: 'candidate', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applicants', error: error.message });
  }
};

// 6. APPLY TO A JOB (New Endpoint for Module 3)
exports.applyToJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const candidateId = req.user.id; // Pulled from the token by protect middleware

    // Verify job exists
    const job = await Job.findByPk(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Prevent duplicate applications
    const existingApplication = await Application.findOne({ where: { jobId, candidateId } });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job.' });
    }

    const application = await Application.create({ jobId, candidateId });

    res.status(201).json({ message: 'Application submitted successfully!', application });
  } catch (error) {
    res.status(500).json({ message: 'Error applying for job', error: error.message });
  }
};

// 7. SAVE A JOB (Candidate only)
exports.saveJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const existing = await SavedJob.findOne({ where: { jobId: req.params.id, candidateId: req.user.id } });
    if (existing) {
      return res.status(400).json({ message: 'Job already saved.' });
    }

    const saved = await SavedJob.create({ jobId: req.params.id, candidateId: req.user.id });
    res.status(201).json({ message: 'Job saved successfully!', saved });
  } catch (error) {
    res.status(500).json({ message: 'Error saving job', error: error.message });
  }
};

// 8. UNSAVE A JOB (Candidate only)
exports.unsaveJob = async (req, res) => {
  try {
    const deletedCount = await SavedJob.destroy({ where: { jobId: req.params.id, candidateId: req.user.id } });
    if (!deletedCount) return res.status(404).json({ message: 'Saved job not found.' });
    res.json({ message: 'Job removed from saved list.' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing saved job', error: error.message });
  }
};

// 9. GET ALL SAVED JOBS (Candidate only)
exports.getSavedJobs = async (req, res) => {
  try {
    const saved = await SavedJob.findAll({
      where: { candidateId: req.user.id },
      include: [{ model: Job, as: 'job' }],
      order: [['createdAt', 'DESC']],
    });
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saved jobs', error: error.message });
  }
};

// 10. GET JOBS POSTED BY THE LOGGED-IN EMPLOYER (Employer Dashboard)
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({ where: { postedBy: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your jobs', error: error.message });
  }
};
