import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';

export default function FindJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    const timer = setTimeout(fetchJobs, 300); // debounce search typing
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, workMode, employmentType]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (workMode) params.set('workMode', workMode);
      if (employmentType) params.set('employmentType', employmentType);
      const { data } = await API.get(`/jobs?${params.toString()}`);
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    setMessage({ text: '', type: '' });
    try {
      const { data } = await API.post(`/jobs/${jobId}/apply`);
      setMessage({ text: data.message || 'Successfully applied!', type: 'success' });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to submit application.',
        type: 'error',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">Explore opportunities</h1>
        <p className="text-ink-soft">Search live openings, aggregated from top companies and public job boards.</p>
      </div>

      {message.text && (
        <div
          className={`mb-5 px-4 py-3 rounded-lg text-sm font-medium rail ${
            message.type === 'success' ? 'rail-canopy bg-canopy-light text-canopy-dark' : 'rail-danger bg-danger-light text-danger'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filter bar */}
      <div className="card p-4 mb-8 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by job title or company…"
          className="input-field flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input-field sm:w-44" value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
          <option value="">Any work mode</option>
          <option value="Onsite">Onsite</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
        </select>
        <select className="input-field sm:w-48" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
          <option value="">Any employment type</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
      </div>

      {/* Listings */}
      <div className="grid gap-4">
        {loading ? (
          <p className="text-center text-ink-faint py-14">Loading listings…</p>
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <div
              key={job._id}
              className="card rail rail-canopy p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Link to={`/jobs/${job._id}`} className="text-lg font-semibold text-ink hover:text-canopy">
                    {job.title}
                  </Link>
                  {job.source && job.source !== 'Manual' && (
                    <span className="badge badge-neutral">{job.source}</span>
                  )}
                </div>
                <p className="text-canopy font-medium text-sm mb-2">{job.company}</p>
                <div className="flex flex-wrap gap-2 text-xs text-ink-soft">
                  <span className="chip">{job.location}</span>
                  <span className="chip">{job.workMode}</span>
                  <span className="chip">{job.employmentType}</span>
                  {job.salary && <span className="chip font-mono">{job.salary}</span>}
                </div>
              </div>

              {user?.role === 'Candidate' ? (
                <button onClick={() => handleApply(job._id)} className="btn btn-primary shrink-0">
                  Apply now
                </button>
              ) : (
                <span className="text-xs text-ink-faint italic shrink-0">
                  {user ? 'Log in as a Candidate to apply' : 'Log in as a Candidate to apply'}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="card p-14 text-center text-ink-soft">
            No listings match your filters yet. Try broadening your search.
          </div>
        )}
      </div>
    </div>
  );
}
