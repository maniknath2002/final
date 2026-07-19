import React, { useState, useEffect } from 'react';
import API from '../utils/api';

export default function Profile() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');
  
  // State for resume handling
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    API.get('/auth/me')
      .then(({ data }) => {
        // Strict runtime object checking to prevent layout crashes
        if (!data) {
          setError('No user data returned from server.');
          return;
        }

        setMe({
          name: data.name || 'Registered User',
          email: data.email || 'No email provided',
          role: data.role || 'Candidate',
          createdAt: data.createdAt || new Date().toISOString(),
          resumePath: data.resumePath || '',
          skills: Array.isArray(data.skills) ? data.skills : ['Java', 'HTML', 'CSS', 'React', 'SQL', 'Big Data'],
          experience: data.experience || 'Entry Level / Fresher'
        });
      })
      .catch((err) => {
        console.error('Profile fetch error:', err);
        setError('Failed to load profile.');
      });
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setUploadMessage({ text: 'Please select a file first.', type: 'error' });

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    setUploadMessage({ text: '', type: '' });

    try {
      const { data } = await API.post('/applications/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadMessage({ text: 'Resume uploaded successfully!', type: 'success' });
      setMe((prev) => ({ ...prev, resumePath: data.filePath }));
    } catch (err) {
      setUploadMessage({
        text: err.response?.data?.message || 'Upload failed.',
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  if (error) return <p className="text-center py-20 text-danger font-medium">{error}</p>;
  if (!me) return <p className="text-center py-20 text-ink-faint">Loading profile data…</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">My Profile</h1>
        <p className="text-sm text-ink-soft">Review your personal account parameters and portal access verification.</p>
      </div>

      <div className="card p-8 bg-white border border-border rounded-xl shadow-sm">
        {/* Profile Identity Header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-canopy-light text-canopy-dark flex items-center justify-center text-2xl font-display font-semibold">
            {me.name ? me.name[0].toUpperCase() : '?'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-ink">{me.name}</h2>
            <span className="badge badge-canopy mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {me.role}
            </span>
          </div>
        </div>

        {/* Primary Account details */}
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-3">User Parameters</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-border pb-3">
            <dt className="text-ink-soft">Email Address</dt>
            <dd className="text-ink font-medium">{me.email}</dd>
          </div>
          <div className="flex justify-between border-b border-border pb-3">
            <dt className="text-ink-soft">System Registration</dt>
            <dd className="text-ink font-medium">
              {new Date(me.createdAt).toLocaleDateString()}
            </dd>
          </div>
          
          {/* Candidate Experience Section */}
          {me.role === 'Candidate' && (
            <div className="flex justify-between border-b border-border pb-3">
              <dt className="text-ink-soft">Experience Status</dt>
              <dd className="text-ink font-medium">{me.experience}</dd>
            </div>
          )}
        </dl>

        {/* Skills Subsection */}
        {me.role === 'Candidate' && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-3">Core Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {me.skills.map((skill, index) => (
                <span key={index} className="chip bg-neutral-light text-ink text-xs px-2.5 py-1 rounded-md border border-border font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Resume View and Upload Area */}
        {me.role === 'Candidate' && (
          <div className="mt-8 pt-6 border-t border-border space-y-4">
            {me.resumePath && (
              <div className="flex justify-between items-center bg-canopy-light bg-opacity-20 p-4 rounded-lg border border-canopy border-opacity-20">
                <span className="text-xs text-ink font-medium">📄 Current resume file link is active.</span>
                <a 
                  href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${me.resumePath}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-canopy font-bold hover:underline"
                >
                  View Attached PDF
                </a>
              </div>
            )}

            <div className="bg-neutral-light p-5 rounded-xl border border-border">
              <h4 className="font-semibold text-sm text-ink mb-1">Upload Resume Bonus Feature</h4>
              <p className="text-xs text-ink-soft mb-4">Attach your profile resume in PDF format (Max 5MB).</p>
              
              <form onSubmit={handleUpload} className="space-y-3">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange} 
                  className="block w-full text-xs text-ink-soft file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-canopy-light file:text-canopy-dark hover:file:bg-opacity-80 cursor-pointer"
                />
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="btn btn-primary w-full text-xs py-2 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </form>

              {uploadMessage.text && (
                <p className={`mt-3 text-xs text-center font-semibold ${
                  uploadMessage.type === 'success' ? 'text-canopy' : 'text-danger'
                }`}>
                  {uploadMessage.text}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Employer Portal Workspace Information */}
        {me.role === 'Employer' && (
          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2">Corporate Profile Overview</h3>
            <div className="bg-neutral-light p-4 rounded-lg border border-border text-xs text-ink-soft leading-relaxed">
              💼 Corporate recruitment operations are active. Job aggregations, inbound user applications, and applicant profile metrics can be managed directly inside your main Employer Dashboard link.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}