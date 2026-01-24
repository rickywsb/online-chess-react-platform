import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBroadcasts } from '../api/broadcast';
import './ChessTVPage.css';

const ChessTVPage = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchBroadcasts();
  }, [page]);

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const data = await getBroadcasts(page);
      setBroadcasts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load broadcasts. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isLive = (broadcast) => {
    // Check if any round is currently live
    if (broadcast.rounds) {
      return broadcast.rounds.some(round => round.ongoing);
    }
    return broadcast.tour?.dates?.some(d => {
      const now = Date.now();
      return d.startsAt <= now && (!d.endsAt || d.endsAt > now);
    });
  };

  return (
    <div className="chess-tv-page">
      {/* Header */}
      <div className="chess-tv-header">
        <div className="header-content">
          <h1>
            <span className="live-icon">📺</span>
            Chess TV
          </h1>
          <p>Watch live chess tournaments from around the world</p>
        </div>
      </div>

      {/* Live Section */}
      <div className="chess-tv-section">
        <h2 className="section-title">
          <span className="live-badge">● LIVE</span>
          Live Broadcasts
        </h2>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading broadcasts...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchBroadcasts}>Retry</button>
          </div>
        ) : (
          <div className="broadcasts-grid">
            {broadcasts.map((broadcast, index) => (
              <BroadcastCard 
                key={broadcast.tour?.id || index} 
                broadcast={broadcast}
                isLive={isLive(broadcast)}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="page-btn"
        >
          ← Previous
        </button>
        <span className="page-info">Page {page}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={broadcasts.length < 20}
          className="page-btn"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

// Broadcast Card Component
const BroadcastCard = ({ broadcast, isLive, formatDate }) => {
  const tour = broadcast.tour || broadcast;
  const rounds = broadcast.rounds || [];
  const currentRound = rounds.find(r => r.ongoing) || rounds.find(r => !r.finished) || rounds[rounds.length - 1];
  
  // tour.image is already a full URL from Lichess
  const imageUrl = tour.image || null;

  return (
    <Link 
      to={`/chess-tv/${tour.id}${currentRound ? `/${currentRound.id}` : ''}`}
      className={`broadcast-card ${isLive ? 'live' : ''}`}
    >
      {/* Image */}
      <div className="broadcast-image">
        {imageUrl ? (
          <img src={imageUrl} alt={tour.name} onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }} />
        ) : null}
        <div className="image-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
          <span>♔</span>
        </div>
        {isLive && <span className="live-tag">● LIVE</span>}
      </div>
      
      {/* Content */}
      <div className="broadcast-content">
        <h3 className="broadcast-title">{tour.name}</h3>
        
        {tour.info?.location && (
          <p className="broadcast-location">📍 {tour.info.location}</p>
        )}
        
        <div className="broadcast-meta">
          {currentRound && (
            <span className="round-info">
              🎯 {currentRound.name}
            </span>
          )}
          {tour.dates && tour.dates[0] && (
            <span className="date-info">
              🗓️ {formatDate(tour.dates[0])}
            </span>
          )}
        </div>
        
        {/* Players info from tour.info */}
        {tour.info?.players && (
          <p className="players-info">👥 {tour.info.players}</p>
        )}
      </div>
    </Link>
  );
};

export default ChessTVPage;
