import React from 'react';
import { Link } from 'react-router-dom';

const stats = [
  { value: '01', label: 'Search & filter', desc: 'Find roles by location, work mode, and skills in seconds.' },
  { value: '02', label: 'Aggregated listings', desc: 'Fresh postings pulled automatically from public job boards.' },
  { value: '03', label: 'Track applications', desc: 'Save jobs and follow every application through to a decision.' },
];

export default function Home() {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-20 sm:py-28 grid md:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <span className="badge badge-gold mb-5">Live job aggregation</span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-ink leading-[1.08] mb-5">
              Find your next role<br />in the <span className="text-canopy">Jungle</span>.
            </h1>
            <p className="text-lg text-ink-soft max-w-lg mb-8">
              One place to search live openings from top companies and public
              job boards — no more tabs, no more duplicate listings.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/jobs" className="btn btn-primary">Browse jobs</Link>
              {!user && (
                <Link to="/register" className="btn btn-outline">Create an account</Link>
              )}
              {user?.role === 'Employer' && (
                <Link to="/employer-dashboard" className="btn btn-outline">Post a job</Link>
              )}
            </div>
          </div>

          {/* Signature: a "listing feed" card stack, standing in for the live data */}
          <div className="hidden md:block relative h-72">
            <div className="card rail rail-gold absolute top-0 left-6 right-0 p-4 rotate-[2deg] shadow-sm">
              <p className="text-xs font-mono text-ink-faint mb-1">RemoteOK · Scraped</p>
              <p className="font-semibold text-ink">Senior Backend Engineer</p>
              <p className="text-sm text-ink-soft">Remote · Full-time</p>
            </div>
            <div className="card rail rail-canopy absolute top-16 left-0 right-6 p-4 -rotate-1 shadow-md">
              <p className="text-xs font-mono text-ink-faint mb-1">Manual · Open</p>
              <p className="font-semibold text-ink">Product Designer</p>
              <p className="text-sm text-ink-soft">Bengaluru · Hybrid</p>
            </div>
            <div className="card rail rail-info absolute top-32 left-10 right-2 p-4 rotate-1 shadow-lg">
              <p className="text-xs font-mono text-ink-faint mb-1">Manual · Open</p>
              <p className="font-semibold text-ink">Data Analyst</p>
              <p className="text-sm text-ink-soft">Mysuru · Onsite</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="card p-6">
              <p className="font-mono text-sm text-gold font-semibold mb-3">{s.value}</p>
              <h3 className="font-display font-semibold text-ink mb-1.5">{s.label}</h3>
              <p className="text-sm text-ink-soft">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
