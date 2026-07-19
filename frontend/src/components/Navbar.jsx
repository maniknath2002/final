import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

// Small canopy mark — two overlapping leaf shapes, used instead of an emoji
// so the wordmark reads as a real brand rather than a placeholder.
function CanopyMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 25C14 25 6 20.5 6 12.5C6 7.8 9.6 4 14 4C18.4 4 22 7.8 22 12.5C22 20.5 14 25 14 25Z" fill="#1F5F4E" />
      <path d="M14 22C14 22 9.5 18.4 9.5 12.7C9.5 9.4 11.5 6.8 14 6.8C16.5 6.8 18.5 9.4 18.5 12.7C18.5 18.4 14 22 14 22Z" fill="#C0923A" />
    </svg>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMenuOpen(false);
    navigate('/login');
  };

  const linkClass = ({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`;

  return (
    <nav className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <CanopyMark />
          <span className="font-display font-semibold text-lg text-ink tracking-tight">
            Job Poratl <span className="text-canopy">Jobs</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          <NavLink to="/jobs" className={linkClass}>Find Jobs</NavLink>
          {user?.role === 'Employer' && (
            <NavLink to="/employer-dashboard" className={linkClass}>Dashboard</NavLink>
          )}
          {user?.role === 'Candidate' && (
            <NavLink to="/candidate-dashboard" className={linkClass}>My Applications</NavLink>
          )}
          {user?.role === 'Admin' && (
            <NavLink to="/admin" className={linkClass}>Admin</NavLink>
          )}
          {user && <NavLink to="/profile" className={linkClass}>Profile</NavLink>}

          <div className="w-px h-5 bg-border" />

          {token && user ? (
            <div className="flex items-center gap-4">
              <span className="badge badge-canopy">{user.name} · {user.role}</span>
              <button onClick={handleLogout} className="btn btn-danger-ghost btn-sm">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="nav-link">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-ink-soft"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-5 py-4 flex flex-col gap-3">
          <NavLink to="/jobs" className={linkClass} onClick={() => setMenuOpen(false)}>Find Jobs</NavLink>
          {user?.role === 'Employer' && (
            <NavLink to="/employer-dashboard" className={linkClass} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
          )}
          {user?.role === 'Candidate' && (
            <NavLink to="/candidate-dashboard" className={linkClass} onClick={() => setMenuOpen(false)}>My Applications</NavLink>
          )}
          {user?.role === 'Admin' && (
            <NavLink to="/admin" className={linkClass} onClick={() => setMenuOpen(false)}>Admin</NavLink>
          )}
          {user && <NavLink to="/profile" className={linkClass} onClick={() => setMenuOpen(false)}>Profile</NavLink>}

          <div className="h-px bg-border my-1" />

          {token && user ? (
            <>
              <span className="badge badge-canopy w-fit">{user.name} · {user.role}</span>
              <button onClick={handleLogout} className="btn btn-danger-ghost btn-sm w-fit">Log out</button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
