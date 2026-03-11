import { NavLink, Link } from 'react-router-dom';

const navItems = [
  { to: '/', end: true, label: 'Dashboard' },
  { to: '/problems', end: false, label: 'Problems' },
  { to: '/problems/add', end: true, label: 'Add Problem' },
  { to: '/revisions', end: true, label: 'Revisions' },
];

export default function TopNavbar() {
  return (
    <header className="top-navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src="/vite.svg" alt="DSA Tracker Logo" />
          <span>DSA Tracker</span>
        </Link>
        
        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="nav-right">
          <div className="avatar-circle">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
