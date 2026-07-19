const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

// Load our configuration settings
dotenv.config();
const connectDB = require('./db');
const { runJobScraper } = require('./utils/scraper');

const app = express();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const scraperRoutes = require('./routes/scraperRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// Basic safety settings so our frontend can talk to our backend
app.use(cors());
app.use(express.json());

// Mount Routes cleanly
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/scrape', scraperRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/applications', applicationRoutes);

// Bonus: run the scraper automatically every 6 hours ('0 */6 * * *')
cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled job scrape...');
  const report = await runJobScraper();
  console.log('Scheduled scrape complete:', report);
});

// A simple test route to check if the server is working
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'Backend server running smoothly.' });
});

// Start the server
const PORT = process.env.PORT || 5000;
connectDB();
app.listen(PORT, () => {
  console.log(`Server is roaring to life on port ${PORT}`);
});