import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, FaCalendarAlt, FaUser, FaSignOutAlt, FaSignInAlt, 
  FaUserPlus, FaQrcode, FaComments, FaTachometerAlt, 
  FaBars, FaTimes, FaChevronDown, FaImage, FaTrophy, FaCamera,
  FaCrown, FaUsers, FaStar
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/events', label: 'Events', icon: FaCalendarAlt },
    { path: '/holidays', label: 'Calendar', icon: FaCalendarAlt },
    { path: '/gallery', label: 'Gallery', icon: FaImage },
    { path: '/champions', label: 'Champions', icon: FaTrophy },
    { path: '/moments', label: 'Moments', icon: FaCamera },
  ];

  const authItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/qr-scan', label: 'QR Scan', icon: FaQrcode },
    { path: '/chat', label: 'Chat', icon: FaComments },
  ];

  const roleItems = user?.role === 'admin' 
    ? [{ path: '/admin', label: 'Admin Panel', icon: FaCrown }]
    : user?.role === 'leader' 
    ? [{ path: '/leader', label: 'Leader Panel', icon: FaUser }]
    : [];

  const allNavItems = [...navItems, ...authItems, ...roleItems];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm shadow-md'}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-all duration-300 shadow-lg">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent whitespace-nowrap">
                 Club-Z
              </span>
              <span className="hidden md:inline text-xs text-gray-500 ml-1"></span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {allNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                }`}
              >
                <item.icon className="text-lg" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            
            {isAuthenticated ? (
              <div className="relative ml-4">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium">{user?.username}</span>
                  <FaChevronDown className={`text-gray-400 text-xs transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 border animate-fade-in">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary bg-opacity-10 text-primary rounded-full text-xs">
                        {user?.role?.toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-4">
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-primary transition-colors"
                >
                  <FaSignInAlt />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <FaUserPlus />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="lg:hidden py-4 border-t animate-slide-up">
            {allNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <FaSignInAlt />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-3 px-4 py-3 text-primary hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUserPlus />
                  <span>Register</span>
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;