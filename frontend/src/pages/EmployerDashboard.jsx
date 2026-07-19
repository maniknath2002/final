import React, { useState, useEffect } from 'react';
import API from '../utils/api';

const emptyForm = {
  title: '', company: '', location: '', workMode: 'Remote', employmentType: 'Full-time',
  salary: '', experience: '', skills: '', description: '', benefits: '', deadline: '',
};

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [applicants, setApplicants] = useState(null); // { jobId, list }
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchMyJobs = async () => {
    try {
      const { data } = await API.get('/jobs/employer/mine');
      setJobs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchMyJobs(); }, []);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    const payload = {
      ...form,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      benefits: form.benefits.split(',').map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await API.put(`/jobs/${editingId}`, payload);
        setMessage({ text: 'Job updated successfully!', type: 'success' });
      } else {
        await API.post('/jobs', payload);
        setMessage({ text: 'Job posted successfully!', type: 'success' });
      }
      resetForm();
      fetchMyJobs();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to save job.', type: 'error' });
    }
  };

  const handleEdit = (job) => {
    setEditingId(job._id);
    setForm({
      title: job.title || '', company: job.company || '', location: job.location || '',
      workMode: job.workMode || 'Remote', employmentType: job.employmentType || 'Full-time',
      salary: job.salary || '', experience: job.experience || '',
      skills: (job.skills || []).join(', '), description: job.description || '',
      benefits: (job.benefits || []).join(', '),
      deadline: job.deadline ? job.deadline.slice(0, 10) : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this job listing?')) return;
    try {
      await API.delete(`/jobs/${jobId}`);
      fetchMyJobs();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to delete job.', type: 'error' });
    }
  };

  const handleClose = async (jobId, currentStatus) => {
    try {
      await API.put(`/jobs/${jobId}`, { status: currentStatus === 'Closed' ? 'Open' : 'Closed' });
      fetchMyJobs();
    } catch (err) {
      setMessage({ text: 'Failed to update status.', type: 'error' });
    }
  };

  const viewApplicants = async (jobId) => {
    try {
      const { data } = await API.get(`/jobs/${jobId}/applicants`);
      setApplicants({ jobId, list: data });
    } catch (err) {
      setMessage({ text: 'Failed to load applicants.', type: 'error' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink mb-1">Employer dashboard</h1>
      <p className="text-ink-soft mb-7">Post roles, manage listings, and review applicants.</p>

      {message.text && (
        <div
          className={`mb-5 px-4 py-3 rounded-lg text-sm font-medium rail ${
            message.type === 'success' ? 'rail-canopy bg-canopy-light text-canopy-dark' : 'rail-danger bg-danger-light text-danger'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Create / Edit form */}
      <form onSubmit={handleSubmit} className="card p-6 mb-10 grid gap-4 md:grid-cols-2">
        <h2 className="md:col-span-2 font-display text-lg font-semibold text-ink">
          {editingId ? 'Edit job' : 'Post a new job'}
        </h2>

        <input required placeholder="Job title" className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input required placeholder="Company" className="input-field" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <input required placeholder="Location" className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />

        <select className="input-field" value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })}>
          <option>Remote</option><option>Onsite</option><option>Hybrid</option>
        </select>

        <select className="input-field" value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
          <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
        </select>

        <input placeholder="Salary (e.g. ₹8,00,000 – ₹12,00,000)" className="input-field" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
        <input placeholder="Experience (e.g. 2–4 years)" className="input-field" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
        <input type="date" className="input-field" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        <input placeholder="Skills (comma separated)" className="input-field" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />

        <textarea required placeholder="Job description" className="input-field md:col-span-2" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Benefits (comma separated)" className="input-field md:col-span-2" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />

        <div className="md:col-span-2 flex gap-3 pt-1">
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Update job' : 'Post job'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn btn-ghost">Cancel</button>
          )}
        </div>
      </form>

      {/* Job list */}
      <h2 className="font-display text-xl font-semibold text-ink mb-4">Your listings</h2>
      <div className="grid gap-4">
        {jobs.length > 0 ? jobs.map((job) => (
          <div key={job._id} className={`card rail p-5 ${job.status === 'Closed' ? 'rail-danger' : 'rail-canopy'}`}>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-ink">{job.title}</h3>
                  <span className={`badge ${job.status === 'Closed' ? 'badge-danger' : 'badge-canopy'}`}>
                    {job.status || 'Open'}
                  </span>
                </div>
                <p className="text-sm text-ink-soft mt-0.5">{job.location} · {job.workMode}</p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button onClick={() => viewApplicants(job._id)} className="btn btn-outline btn-sm">Applicants</button>
                <button onClick={() => handleEdit(job)} className="btn btn-ghost btn-sm">Edit</button>
                <button onClick={() => handleClose(job._id, job.status)} className="btn btn-ghost btn-sm">
                  {job.status === 'Closed' ? 'Reopen' : 'Close'}
                </button>
                <button onClick={() => handleDelete(job._id)} className="btn btn-danger-ghost btn-sm">Delete</button>
              </div>
            </div>

            {applicants?.jobId === job._id && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-semibold text-ink mb-2">Applicants ({applicants.list.length})</h4>
                {applicants.list.length > 0 ? (
                  <ul className="space-y-1.5">
                    {applicants.list.map((app) => (
                      <li key={app._id} className="text-sm text-ink-soft flex items-center gap-2 flex-wrap">
                        <span className="text-ink font-medium">{app.candidate?.name}</span>
                        <span className="text-ink-faint">{app.candidate?.email}</span>
                        <span className="badge badge-neutral">{app.status}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-ink-faint">No applicants yet.</p>
                )}
              </div>
            )}
          </div>
        )) : (
          <div className="card p-10 text-center text-ink-soft text-sm">You haven't posted any jobs yet.</div>
        )}
      </div>
    </div>
  );
}
