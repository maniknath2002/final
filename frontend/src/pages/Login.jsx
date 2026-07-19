import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'Admin') navigate('/admin');
      else if (data.user.role === 'Employer') navigate('/employer-dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full p-8">
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">Welcome back</h1>
        <p className="text-sm text-ink-soft mb-6">Log in to continue to Jungle Jobs.</p>

        {error && (
          <div className="rail rail-danger bg-danger-light text-danger text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
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
              placeholder="••••••••"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-soft mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-canopy font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
