import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

interface NavbarProps {
  variant?: 'default' | 'landing';
  scrolled?: boolean;
}

// Icon components
const IconDashboard = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const IconExplore = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconNewLesson = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const IconUser = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconLogout = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export const Navbar = ({ variant = 'default', scrolled = false }: NavbarProps = {}) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [internalScrolled, setInternalScrolled] = useState(false);

  // Handle scroll effect for landing variant
  useEffect(() => {
    if (variant === 'landing') {
      const handleScroll = () => setInternalScrolled(window.scrollY > 16);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [variant]);

  const isScrolled = variant === 'landing' ? internalScrolled : scrolled;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getLinkClassName = (path: string) => {
    const base = 'inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors';
    const active = isActive(path)
      ? 'text-blue-600 bg-blue-50'
      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50';
    return `${base} ${active}`;
  };

  const navClassName = variant === 'landing'
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-md border-b border-slate-200/70'
          : 'bg-white/70 backdrop-blur-xl border-b border-slate-100/60'
      }`
    : 'bg-white shadow-md';

  const containerPadding = variant === 'landing' ? 'px-6 sm:px-8 lg:px-12' : 'px-4 sm:px-6 lg:px-8';

  return (
    <nav className={navClassName}>
      <div className={`max-w-7xl mx-auto ${containerPadding}`}>
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              {variant === 'landing' ? (
                <div className="flex items-center space-x-2.5">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-15 blur-xl" />
                  </div>
                  <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    EDUNOVA
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-blue-600">EduNova</span>
              )}
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={getLinkClassName('/dashboard')}>
                  <IconDashboard />
                  Home
                </Link>
                <Link to="/explore" className={getLinkClassName('/explore')}>
                  <IconExplore />
                  Explore
                </Link>
                <Link to="/lessons/new" className={getLinkClassName('/lessons/new')}>
                  <IconNewLesson />
                  New Lesson
                </Link>
                
                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  >
                    <IconUser />
                    <span className="hidden sm:inline">{user?.profile?.full_name || user?.username}</span>
                    <IconChevronDown />
                  </button>
                  
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.profile?.full_name || user?.username}
                        </p>
                        {user?.email && (
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        )}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <IconLogout />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {variant !== 'landing' && (
                  <Link to="/explore" className={getLinkClassName('/explore')}>
                    <IconExplore />
                    Explore
                  </Link>
                )}
                <Link
                  to="/login"
                  className={variant === 'landing' 
                    ? 'text-slate-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-slate-50'
                    : 'text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium'
                  }
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={variant === 'landing'
                    ? 'relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden group'
                    : 'bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700'
                  }
                >
                  {variant === 'landing' ? (
                    <>
                      <span className="relative z-10">Get Started</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    'Register'
                  )}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

