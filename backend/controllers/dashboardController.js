const { User, Job, Application, sequelize } = require('../models');
const { Op, fn, col } = require('sequelize');

// GET /api/dashboard/stats
exports.getAdminStats = async (req, res) => {
  try {
    // 1. Core counters
    const totalUsers = await User.count();
    const totalJobs = await Job.count();
    const totalApplications = await Application.count();

    // 2. Count jobs scraped today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const jobsScrapedToday = await Job.count({
      where: {
        source: 'Scraped',
        createdAt: { [Op.gte]: startOfToday },
      },
    });

    // 3. Top Locations — Mongo's aggregate() $group/$sort/$limit becomes a
    // plain SQL GROUP BY + COUNT + ORDER BY + LIMIT.
    const topLocationsRaw = await Job.findAll({
      attributes: ['location', [fn('COUNT', col('location')), 'count']],
      group: ['location'],
      order: [[fn('COUNT', col('location')), 'DESC']],
      limit: 5,
      raw: true,
    });
    const topLocations = topLocationsRaw.map((row) => ({
      location: row.location,
      count: Number(row.count),
    }));

    // 4. Calculate Total Distinct Companies — Mongo's distinct() becomes
    // COUNT(DISTINCT company).
    const totalCompaniesRaw = await Job.findOne({
      attributes: [[fn('COUNT', fn('DISTINCT', col('company'))), 'totalCompanies']],
      raw: true,
    });
    const totalCompanies = Number(totalCompaniesRaw.totalCompanies);

    res.json({
      totalUsers,
      totalJobs,
      totalCompanies,
      totalApplications,
      jobsScrapedToday,
      topLocations,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error compiling dashboard stats', error: error.message });
  }
};
