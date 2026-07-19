import React, { useState, useEffect } from 'react';
import API from '../utils/api';

export default function Profile() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/auth/me')
      .then(({ data }) => setMe(data))
      .catch(() => setError('Failed to load profile.'));
  }, []);

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
          <div className="flex justify-between pb-1">
            <dt className="text-ink-soft">Member since</dt>
            <dd className="text-ink font-medium">
              {me.createdAt ? new Date(me.createdAt).toLocaleDateString() : '—'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
