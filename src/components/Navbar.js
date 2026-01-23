import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isLoggedIn, logout, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo / Brand */}
        <Link to="/home" className="navbar-brand" onClick={closeMobileMenu}>
          <span className="brand-icon">♟️</span>
          <span className="brand-text">AI Chess Agent</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button className="mobile-toggle" onClick={toggleMobileMenu}>
          <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Navigation Links */}
        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="nav-links">
            <Link 
              to="/home" 
              className={`nav-link ${isActive('/home') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="nav-icon">🏠</span>
              Home
            </Link>
            <Link 
              to="/courses" 
              className={`nav-link ${isActive('/courses') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="nav-icon">📚</span>
              Courses
            </Link>
            <Link 
              to="/blog" 
              className={`nav-link ${isActive('/blog') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="nav-icon">📝</span>
              Blog
            </Link>
            
            {/* Admin link - only for admin users */}
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-icon">⚙️</span>
                Admin
              </Link>
            )}
          </div>

          {/* Right side actions */}
          <div className="nav-actions">
            {/* Shopping Cart */}
            <Link 
              to="/cart" 
              className="cart-btn"
              onClick={closeMobileMenu}
            >
              <span className="cart-icon">🛒</span>
              <span className="cart-text">Cart</span>
            </Link>

            {!isLoggedIn ? (
              /* Not logged in - show Login & Register buttons */
              <div className="auth-buttons">
                <Link 
                  to="/login" 
                  className="auth-btn login-btn"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="auth-btn register-btn"
                  onClick={closeMobileMenu}
                >
                  Register
                </Link>
              </div>
            ) : (
              /* Logged in - show Profile & Logout */
              <div className="user-menu">
                <Link 
                  to={`/profile/${user?._id}`} 
                  className="profile-btn"
                  onClick={closeMobileMenu}
                >
                  <span className="profile-avatar">
                    {user?.username?.charAt(0).toUpperCase() || '👤'}
                  </span>
                  <span className="profile-name">{user?.username || 'Profile'}</span>
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
