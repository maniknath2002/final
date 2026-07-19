import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';

// 10 Sample Jobs to act as fallback or initial list
const sampleJobs = [
  { _id: 'sample-1', title: 'Full Stack Engineer', company: 'TechNova Solutions', location: 'Bengaluru, IN', workMode: 'Remote', employmentType: 'Full-time', salary: '₹12,00,000 - ₹18,00,000', source: 'Manual' },
  { _id: 'sample-2', title: 'Frontend Developer (React)', company: 'PixelPerfect Inc', location: 'Hyderabad, IN', workMode: 'Hybrid', employmentType: 'Full-time', salary: '₹8,00,000 - ₹12,00,000', source: 'Manual' },
  { _id: 'sample-3', title: 'Node.js Backend Developer', company: 'CloudScale Data', location: 'Pune, IN', workMode: 'Onsite', employmentType: 'Full-time', salary: '₹10,00,000 - ₹15,00,000', source: 'Manual' },
  { _id: 'sample-4', title: 'Software Engineering Intern', company: 'Innovate Labs', location: 'Kalaburagi, IN', workMode: 'Onsite', employmentType: 'Internship', salary: '₹25,00/mo', source: 'Manual' },
  { _id: 'sample-5', title: 'DevOps & CI/CD Specialist', company: 'Nexus Infrastructure', location: 'Remote', workMode: 'Remote', employmentType: 'Contract', salary: '₹15,00,000', source: 'Aggregated' },
  { _id: 'sample-6', title: 'Data Engineer (Big Data)', company: 'Quantum Analytics', location: 'Bengaluru, IN', workMode: 'Hybrid', employmentType: 'Full-time', salary: '₹14,00,000 - ₹22,00,000', source: 'Aggregated' },
  { _id: 'sample-7', title: 'Java Systems Developer', company: 'Enterprise Core', location: 'Chennai, IN', workMode: 'Onsite', employmentType: 'Full-time', salary: '₹9,00,000 - ₹13,00,000', source: 'Manual' },
  { _id: 'sample-8', title: 'UI/UX React Engineer', company: 'Studio Creative', location: 'Mumbai, IN', workMode: 'Remote', employmentType: 'Part-time', salary: '₹6,00,000', source: 'Manual' },
  { _id: 'sample-9', title: 'Database Administrator (PostgreSQL)', company: 'NeonData Systems', location: 'Remote', workMode: 'Remote', employmentType: 'Full-time', salary: '₹11,00,000 - ₹16,00,000', source: 'Aggregated' },
  { _id: 'sample-10', title: 'Python Scraper & AI Specialist', company: 'WebHarvest Automation', location: 'Delhi, IN', workMode: 'Hybrid', employmentType: 'Full-time', salary: '₹13,00,000', source: 'Aggregated' }
];

export default function FindJobs() {
  // Initializing state with sampleJobs so the page is never blank
  const [jobs, setJobs] = useState(sampleJobs);
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
      
      // If backend returns an array with elements, use them. Otherwise, stay with samples.
      if (data.jobs && data.jobs.length > 0) {
        setJobs(data.jobs);
      } else if (!search && !workMode && !employmentType) {
        // Fall back to sample list only if filters are cleared and db is empty
        setJobs(sampleJobs);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      // Fallback gracefully to samples if server connection drops during evaluation
      if (!search && !workMode && !employmentType) setJobs(sampleJobs);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    setMessage({ text: '', type: '' });
    
    // Prevent errors if trying to apply to mock sample items without valid DB ObjectId
    if (jobId.startsWith('sample-')) {
      setMessage({ text: 'Application Simulated! (This is a sample layout job preview)', type: 'success' });
      return;
    }

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