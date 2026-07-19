const axios = require('axios');
const { Job } = require('../models');

// Pulls live listings from RemoteOK's public JSON API (no auth required, explicitly
// intended for programmatic/automated access) — replaces the old hardcoded mock data.
// Docs: https://remoteok.com/api
const REMOTEOK_API = 'https://remoteok.com/api';

const runJobScraper = async () => {
  let jobsAdded = 0;
  let duplicatesSkipped = 0;
  let errorsCaught = 0;

  try {
    const response = await axios.get(REMOTEOK_API, {
      headers: { 'User-Agent': 'job-portal-assessment-scraper' },
    });

    // RemoteOK's first array element is a legal disclaimer, not a job — skip it.
    const rawJobs = Array.isArray(response.data) ? response.data.slice(1) : [];

    // Cap how many we process per run so a manual trigger stays fast.
    const jobsToProcess = rawJobs.slice(0, 25);

    for (const raw of jobsToProcess) {
      try {
        if (!raw.url || !raw.position) {
          errorsCaught++;
          continue;
        }

        // Dedup check against the unique sourceUrl field — this now actually works
        // because Job.sourceUrl matches the field name used here (previously mismatched).
        const existingJob = await Job.findOne({ where: { sourceUrl: raw.url } });
        if (existingJob) {
          duplicatesSkipped++;
          continue;
        }

        await Job.create({
          title: raw.position,
          company: raw.company || 'Unknown',
          location: raw.location || 'Remote',
          workMode: 'Remote', // RemoteOK is a remote-jobs board by definition
          employmentType: 'Full-time',
          skills: Array.isArray(raw.tags) ? raw.tags.slice(0, 10) : [],
          description: raw.description
            ? String(raw.description).replace(/<[^>]*>/g, '').slice(0, 2000) // strip HTML tags
            : 'No description provided.',
          source: 'RemoteOK',
          sourceUrl: raw.url,
        });

        jobsAdded++;
      } catch (innerErr) {
        errorsCaught++;
      }
    }
  } catch (fetchErr) {
    // If RemoteOK is unreachable, report it rather than silently returning zeros.
    return {
      jobsAdded: 0,
      duplicatesSkipped: 0,
      errorsCaught: 1,
      error: `Failed to fetch from source: ${fetchErr.message}`,
    };
  }

  return { jobsAdded, duplicatesSkipped, errorsCaught };
};

module.exports = { runJobScraper };
