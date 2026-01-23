import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CourseCard from '../components/Courses/CourseCard';
import SearchBar from '../components/SearchBar.js';
import TitleSearchBar from '../components/TitleSearchBar';
import { getUserRank } from '../api/user.js';
import { getEnrolledCourses } from '../api/course';
import ChessAnalyzer from '../components/ChessAnalyzer';
import './HomePage.css';

const HomePage = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('play');

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
      fetchUserRank(user._id);
    }
  }, [user]);

  const username = user?.username;

  const fetchEnrolledCourses = async () => {
    try {
      const courses = await getEnrolledCourses(user._id);
      setEnrolledCourses(courses);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  const fetchUserRank = async (userId) => {
    try {
      const rankData = await getUserRank(userId);
      setUserRank(rankData.rank);
    } catch (error) {
      console.error('Error fetching user rank:', error);
    }
  };

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">AI Chess Agent</span>
          </h1>
          <p className="hero-subtitle">
            Welcome back, <span className="username-highlight">{username || 'Chess Player'}</span>!
            {userRank && (
              <span className="rank-badge">
                #{userRank} Member
              </span>
            )}
          </p>
          <p className="hero-description">
            Analyze positions, play against AI, and improve your chess skills with our intelligent chess platform.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-icon">🎮</span>
            <span className="stat-value">Play</span>
            <span className="stat-label">vs AI</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🔬</span>
            <span className="stat-value">Analyze</span>
            <span className="stat-label">Positions</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📚</span>
            <span className="stat-value">Learn</span>
            <span className="stat-label">Strategies</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Column - Chess */}
        <div className="chess-main-column">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'play' ? 'active' : ''}`}
              onClick={() => setActiveTab('play')}
            >
              ♟️ Play & Analyze
            </button>
            <button 
              className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              📚 My Courses
            </button>
            {user && (
              <button 
                className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
                onClick={() => setActiveTab('events')}
              >
                📅 Events
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'play' && (
              <div className="chess-section">
                <ChessAnalyzer />
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="courses-section">
                <h2>📚 Continue Learning</h2>
                {user && enrolledCourses.length > 0 ? (
                  <div className="course-grid">
                    {enrolledCourses.map(course => (
                      <CourseCard 
                        key={course._id} 
                        course={course} 
                        userRole={user.role} 
                        isEnrolled={true} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-icon">📖</span>
                    <p>No enrolled courses yet.</p>
                    <a href="/courses" className="browse-btn">Browse Courses</a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'events' && user && (
              <div className="events-section">
                <h2>📅 Upcoming Events</h2>
                <div className="events-grid">
                  <div className="event-card-new">
                    <div className="event-badge live">LIVE</div>
                    <h4>Chess Strategies Webinar</h4>
                    <div className="event-meta">
                      <span className="event-date">📅 December 15, 2023</span>
                      <span className="event-time">🕐 13:00 - 14:30 EST</span>
                    </div>
                    <p>Join National Master Ricky Wu for advanced chess strategies.</p>
                    <button className="rsvp-btn">RSVP Now</button>
                  </div>
                  
                  <div className="event-card-new">
                    <div className="event-badge upcoming">UPCOMING</div>
                    <h4>Beginner's Workshop</h4>
                    <div className="event-meta">
                      <span className="event-date">📅 December 28, 2023</span>
                      <span className="event-time">🕐 13:00 - 14:30 EST</span>
                    </div>
                    <p>Learn chess fundamentals with Grandmaster Jane Smith.</p>
                    <button className="rsvp-btn">RSVP Now</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Search & Info */}
        <div className="sidebar-column">
          {/* Search Section */}
          <div className="search-section">
            <h3>🔍 Find Players</h3>
            <p className="search-hint">Search by username or title</p>
            <div className="search-wrapper">
              <SearchBar />
            </div>
            <div className="title-search-wrapper">
              <TitleSearchBar />
            </div>
          </div>

          {/* Quick Links */}
          <div className="quick-links">
            <h3>⚡ Quick Actions</h3>
            <a href="/courses" className="quick-link">
              <span className="link-icon">📚</span>
              <span>Browse Courses</span>
            </a>
            <a href="/profile" className="quick-link">
              <span className="link-icon">👤</span>
              <span>My Profile</span>
            </a>
            <a href="/blog" className="quick-link">
              <span className="link-icon">📝</span>
              <span>Chess Blog</span>
            </a>
          </div>

          {/* Features */}
          <div className="features-card">
            <h3>🤖 AI Features</h3>
            <ul className="feature-list">
              <li>
                <span className="feature-icon">✅</span>
                Real-time position analysis
              </li>
              <li>
                <span className="feature-icon">✅</span>
                Best move suggestions
              </li>
              <li>
                <span className="feature-icon">✅</span>
                Evaluation bar
              </li>
              <li>
                <span className="feature-icon">✅</span>
                Move variations
              </li>
              <li>
                <span className="feature-icon">✅</span>
                FEN import/export
              </li>
              <li>
                <span className="feature-icon">✅</span>
                Play vs AI opponent
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
