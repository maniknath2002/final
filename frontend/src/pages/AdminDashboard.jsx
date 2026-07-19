import React, { useState, useEffect } from 'react';
import API from '../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/dashboard/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleScrape = async () => {
    setScraping(true);
    setScrapeResult(null);
    try {
      const { data } = await API.post('/scrape/jobs');
      setScrapeResult(data.data);
      fetchStats();
    } catch (err) {
      setScrapeResult({ error: err.response?.data?.message || 'Scraping failed.' });
    } finally {
      setScraping(false);
    }
  };

  if (!stats) return <p className="text-center py-20 text-ink-faint">Loading dashboard…</p>;

  const cards = [
    { label: 'Total users', value: stats.totalUsers, rail: 'rail-canopy' },
    { label: 'Total jobs', value: stats.totalJobs, rail: 'rail-canopy' },
    { label: 'Total companies', value: stats.totalCompanies, rail: 'rail-info' },
    { label: 'Applications', value: stats.totalApplications, rail: 'rail-info' },
    { label: 'Scraped today', value: stats.jobsScrapedToday, rail: 'rail-gold' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex justify-between items-center gap-4 flex-wrap mb-2">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Admin dashboard</h1>
          <p className="text-ink-soft mt-1">Platform-wide metrics and the job scraper.</p>
        </div>
        <button onClick={handleScrape} disabled={scraping} className="btn btn-primary">
          {scraping ? 'Scraping…' : 'Run job scraper'}
        </button>
      </div>

      {scrapeResult && (
        <div
          className={`mt-6 px-4 py-3 rounded-lg text-sm font-medium rail ${
            scrapeResult.error ? 'rail-danger bg-danger-light text-danger' : 'rail-canopy bg-canopy-light text-canopy-dark'
          }`}
        >
          {scrapeResult.error
            ? scrapeResult.error
            : `Added ${scrapeResult.jobsAdded} · Duplicates skipped ${scrapeResult.duplicatesSkipped} · Errors ${scrapeResult.errorsCaught}`}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 my-8">
        {cards.map((c) => (
          <div key={c.label} className={`card rail ${c.rail} p-5 text-center`}>
            <div className="font-display text-3xl font-semibold text-ink">{c.value ?? 0}</div>
            <div className="text-xs text-ink-soft mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="font-display font-semibold text-ink mb-4">Top locations</h3>
        {stats.topLocations?.length > 0 ? (
          <ul className="divide-y divide-border">
            {stats.topLocations.map((loc, i) => (
              <li key={i} className="flex justify-between items-center py-2.5 text-sm">
                <span className="text-ink-soft">{loc.location || 'Unknown'}</span>
                <span className="font-mono font-semibold text-ink">{loc.count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-faint">No data yet.</p>
        )}
      </div>
    </div>
  );
}
