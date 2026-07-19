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
      .then(({ data }) => setMe(data))
      .catch(() => setError('Failed to load profile.'));
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setUploadMessage({ text: 'Please select a file first.', type: 'error' });

    const formData = new FormData();
    formData.append('resume', file); // Matches upload.single('resume') on backend

    setUploading(true);
    setUploadMessage({ text: '', type: '' });

    try {
      const { data } = await API.post('/applications/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadMessage({ text: 'Resume uploaded successfully!', type: 'success' });
      
      // Update local state to reflect the new resume path
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

  if (error) return <p className="text-center py-20 text-danger">{error}</p>;
  if (!me) return <p className="text-center py-20 text-ink-faint">Loading profile…</p>;

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">My profile</h1>

      <div className="card p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-canopy-light text-canopy-dark flex items-center justify-center text-2xl font-display font-semibold">
            {me.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-ink">{me.name}</h2>
            <span className="badge badge-canopy mt-1">{me.role}</span>
          </div>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-border pb-3">
            <dt className="text-ink-soft">Email</dt>
            <dd className="text-ink font-medium">{me.email}</dd>
          </div>
          <div className="flex justify-between border-b border-border pb-3">
            <dt className="text-ink-soft">Member since</dt>
            <dd className="text-ink font-medium">
              {me.createdAt ? new Date(me.createdAt).toLocaleDateString() : '—'}
            </dd>
          </div>
          
          {/* Show resume status path if candidate already uploaded one */}
          {me.role === 'Candidate' && me.resumePath && (
            <div className="flex justify-between border-b border-border pb-3">
              <dt className="text-ink-soft">Current Resume</dt>
              <dd className="text-canopy font-medium hover:underline">
                <a 
                  href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${me.resumePath}`} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  View Attached PDF
                </a>
              </dd>
            </div>
          )}
        </dl>

        {/* Dynamic Resume Upload Segment exclusively for Candidates */}
        {me.role === 'Candidate' && (
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="font-medium text-ink mb-2">Update Documents</h3>
            <p className="text-xs text-ink-soft mb-4">Upload your latest resume (PDF format only, max 5MB).</p>
            
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
        )}
      </div>
    </div>
  );
}