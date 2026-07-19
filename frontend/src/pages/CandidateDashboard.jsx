import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';

const statusBadge = {
  Applied: 'badge-neutral',
  Reviewing: 'badge-gold',
  Accepted: 'badge-canopy',
  Rejected: 'badge-danger',
};

export default function CandidateDashboard() {
  const [applications, setApplications] = useState([]);
  const [saved, setSaved] = useState([]);
  const [tab, setTab] = useState('applications');

  useEffect(() => {
    API.get('/applications').then(({ data }) => setApplications(data)).catch(() => {});
    API.get('/jobs/saved/me').then(({ data }) => setSaved(data)).catch(() => {});
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      await API.delete(`/jobs/${jobId}/save`);
      setSaved((prev) => prev.filter((s) => s.job?._id !== jobId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink mb-1">My dashboard</h1>
      <p className="text-ink-soft mb-7">Track every application and revisit the roles you've saved.</p>

      <div className="flex gap-2 mb-7 border-b border-border">
        <button
          onClick={() => setTab('applications')}
          className={`px-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'applications' ? 'border-canopy text-canopy' : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
          Applications ({applications.length})
        </button>
        <button
          onClick={() => setTab('saved')}
          className={`ml-6 px-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'saved' ? 'border-canopy text-canopy' : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
          Saved jobs ({saved.length})
        </button>
      </div>

      {tab === 'applications' && (
        <div className="grid gap-3">
          {applications.length > 0 ? applications.map((app) => (
            <div key={app._id} className="card p-5 flex justify-between items-center gap-4">
              <div className="min-w-0">
                <Link to={`/jobs/${app.job?._id}`} className="font-semibold text-ink hover:text-canopy">
                  {app.job?.title || 'Job removed'}
                </Link>
                <p className="text-sm text-ink-soft">{app.job?.company}</p>
              </div>
              <span className={`badge shrink-0 ${statusBadge[app.status] || 'badge-neutral'}`}>{app.status}</span>
            </div>
          )) : (
            <div className="card p-10 text-center text-ink-soft text-sm">
              You haven't applied to any jobs yet. <Link to="/jobs" className="text-canopy font-semibold hover:underline">Browse listings</Link>
            </div>
          )}
        </div>
      )}

      {tab === 'saved' && (
        <div className="grid gap-3">
          {saved.length > 0 ? saved.map((s) => (
            <div key={s._id} className="card p-5 flex justify-between items-center gap-4">
              <div className="min-w-0">
                <Link to={`/jobs/${s.job?._id}`} className="font-semibold text-ink hover:text-canopy">
                  {s.job?.title || 'Job removed'}
                </Link>
                <p className="text-sm text-ink-soft">{s.job?.company}</p>
              </div>
              <button onClick={() => handleUnsave(s.job?._id)} className="btn btn-danger-ghost btn-sm shrink-0">
                Remove
              </button>
            </div>
          )) : (
            <div className="card p-10 text-center text-ink-soft text-sm">No saved jobs yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
