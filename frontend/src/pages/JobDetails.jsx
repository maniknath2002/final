import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../utils/api';

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await API.get(`/jobs/${id}`);
        setJob(data);
      } catch (err) {
        setMessage({ text: 'Job not found.', type: 'error' });
      } Alexander: finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    setMessage({ text: '', type: '' });
    setSubmitting(true);
    try {
      // FIX: Hit the /applications route and pass jobId in the request body
      const { data } = await API.post('/applications', { jobId: id });
      setMessage({ text: data.message || 'Applied successfully!', type: 'success' });
      setHasApplied(true);
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Failed to submit your application.', 
        type: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    setMessage({ text: '', type: '' });
    try {
      const { data } = await API.post(`/jobs/${id}/save`);
      setMessage({ text: data.message || 'Job saved!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to save job.', type: 'error' });
    }
  };

  if (loading) {
    return <p className="text-center py-20 text-ink-faint">Loading job details…</p>;
  }
  if (!job) {
    return <p className="text-center py-20 text-ink-faint">Job not found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/jobs" className="text-canopy text-sm font-semibold hover:underline">&larr; Back to jobs</Link>

      <div className="mt-4 card rail rail-canopy p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink">{job.title}</h1>
            <p className="text-canopy font-medium text-lg mt-1">{job.company}</p>
          </div>
          <span className={`badge ${job.status === 'Open' ? 'badge-canopy' : 'badge-neutral'}`}>{job.status}</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          <span className="chip">{job.location}</span>
          <span className="chip">{job.workMode}</span>
          <span className="chip">{job.employmentType}</span>
          {job.salary && <span className="chip font-mono">{job.salary}</span>}
          {job.experience && <span className="chip">{job.experience} experience</span>}
        </div>

        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {job.skills.map((skill, i) => (
              <span key={i} className="badge badge-gold">{skill}</span>
            ))}
          </div>
        )}

        <div className="mt-7">
          <h3 className="font-display font-semibold text-ink mb-2">Description</h3>
          <p className="text-ink-soft whitespace-pre-line leading-relaxed">{job.description}</p>
        </div>

        {job.benefits?.length > 0 && (
          <div className="mt-7">
            <h3 className="font-display font-semibold text-ink mb-2">Benefits</h3>
            <ul className="space-y-1.5">
              {job.benefits.map((b, i) => (
                <li key={i} className="text-ink-soft flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-canopy shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {job.deadline && (
          <p className="mt-7 text-sm text-ink-faint font-mono">
            Apply by {new Date(job.deadline).toLocaleDateString()}
          </p>
        )}

        {message.text && (
          <div
            className={`mt-6 px-4 py-3 rounded-lg text-sm font-medium rail ${
              message.type === 'success' ? 'rail-canopy bg-canopy-light text-canopy-dark' : 'rail-danger bg-danger-light text-danger'
            }`}
          >
            {message.text}
          </div>
        )}

        {user?.role === 'Candidate' ? (
          <div className="flex gap-3 mt-7">
            <button 
              onClick={handleApply} 
              disabled={submitting || hasApplied} 
              className="btn btn-primary disabled:opacity-50"
            >
              {submitting ? 'Applying...' : hasApplied ? '✓ Applied' : 'Apply now'}
            </button>
            <button onClick={handleSave} className="btn btn-outline">Save job</button>
          </div>
        ) : !user ? (
          <p className="mt-7 text-sm text-ink-soft">
            <Link to="/login" className="text-canopy font-semibold hover:underline">Log in</Link> as a candidate to apply.
          </p>
        ) : null}
      </div>
    </div>
  );
}