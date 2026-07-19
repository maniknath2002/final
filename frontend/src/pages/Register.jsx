import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Candidate' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'Admin') navigate('/admin');
      else if (data.user.role === 'Employer') navigate('/employer-dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full p-8">
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">Create your account</h1>
        <p className="text-sm text-ink-soft mb-6">Join Jungle Jobs as a candidate or employer.</p>

        {error && (
          <div className="rail rail-danger bg-danger-light text-danger text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="field-label">Full name</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Jane Doe"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Email address</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="you@company.com"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="At least 6 characters"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">I am a…</label>
            <div className="grid grid-cols-2 gap-3">
              {['Candidate', 'Employer'].map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setFormData({ ...formData, role })}
                  className={`rounded-lg border px-4 py-3 text-sm font-semibold text-left transition-colors ${
                    formData.role === role
                      ? 'border-canopy bg-canopy-light text-canopy-dark'
                      : 'border-border text-ink-soft hover:border-canopy'
                  }`}
                >
                  {role}
                  <span className="block text-xs font-normal mt-0.5 opacity-80">
                    {role === 'Candidate' ? 'Looking for jobs' : 'Posting jobs'}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-soft mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-canopy font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
