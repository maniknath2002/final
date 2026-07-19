const express = require('express');
const router = express.Router();
const { runJobScraper } = require('../utils/scraper');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Endpoint to trigger scraping manually - Protected: Admin only
router.post('/jobs', protect, authorizeRoles('Admin'), async (req, res) => {
  try {
    const report = await runJobScraper();
    res.json({
      message: "Scraping process complete!",
      data: report
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to complete scraping operation.", error: error.message });
  }
});

module.exports = router;