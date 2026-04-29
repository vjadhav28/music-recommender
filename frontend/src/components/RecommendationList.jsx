import React, { useState, useEffect } from 'react';
import { Heart, ChevronDown } from 'lucide-react';
import SimilarSongs from './SimilarSongs';

const FAVORITES_KEY = 'music-recommender-favorites';

const STREAMING_SERVICES = [
  { key: 'spotify', name: 'Spotify', emoji: '🎵' },
  { key: 'appleMusic', name: 'Apple Music', emoji: '🎶' },
  { key: 'youtubeMusic', name: 'YouTube Music', emoji: '▶️' },
  { key: 'amazonMusic', name: 'Amazon Music', emoji: '🎧' },
];

export default function RecommendationList({ data, request }) {
  const [favorites, setFavorites] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedSong, setExpandedSong] = useState(null);

  useEffect(() => {
    // Load favorites from localStorage
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        setFavorites([]);
      }
    }
  }, []);

  const toggleFavorite = (song) => {
    const songId = `${song.title}-${song.artist}`;
    const isFavorited = favorites.some(fav => `${fav.title}-${fav.artist}` === songId);
    
    let updatedFavorites;
    if (isFavorited) {
      updatedFavorites = favorites.filter(fav => `${fav.title}-${fav.artist}` !== songId);
    } else {
      updatedFavorites = [...favorites, song];
    }
    
    setFavorites(updatedFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  };

  const isFavorite = (song) => {
    return favorites.some(fav => `${fav.title}-${fav.artist}` === `${song.title}-${song.artist}`);
  };

  const getStreamingLinks = (song) => {
    if (!song.links) return null;
    return song.links;
  };

  if (!data || !data.songs || data.songs.length === 0) {
    return <p className="empty-state">No recommendations found.</p>;
  }

  return (
    <div className="recommendations-shell">
      <div className="recommendation-header">
        <div>
          <h2>Your playlist</h2>
          {request?.mood && (
            <div className="request-badges">
              <span>{request.mood}</span>
              {request.genre && <span>{request.genre}</span>}
              {request.activity && <span>{request.activity}</span>}
            </div>
          )}
        </div>
        <div className="filter-buttons">
          <button
            onClick={() => setFilter('all')}
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          >
            All Songs
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`filter-btn ${filter === 'favorites' ? 'active' : ''}`}
          >
            Favorites ({favorites.length})
          </button>
        </div>
      </div>

      {data.summary && <p className="summary-text">{data.summary}</p>}

      <div className="recommendation-grid">
        {(filter === 'favorites' ? favorites : data.songs).map((song, idx) => {
          const links = getStreamingLinks(song);
          const isExpanded = expandedSong === `${song.title}-${song.artist}-${idx}`;
          const songId = `${song.title}-${song.artist}-${idx}`;
          
          return (
            <article 
              key={songId}
              className={`song-card ${isExpanded ? 'expanded' : ''}`}
              onClick={() => setExpandedSong(isExpanded ? null : songId)}
            >
              <div className="song-header">
                <div className="song-top-content">
                  <div className="song-index">{idx + 1}</div>
                  <div className="song-basic-info">
                    <h3>{song.title}</h3>
                    <p className="song-artist">{song.artist}</p>
                  </div>
                </div>
                <button
                  className={`expand-btn ${isExpanded ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedSong(isExpanded ? null : songId);
                  }}
                  title={isExpanded ? 'Collapse' : 'Expand options'}
                >
                  <ChevronDown size={20} />
                </button>
              </div>

              {isExpanded && (
                <div className="song-expanded-content">
                  <div className="song-meta">
                    <span className="song-genre">{song.genre}</span>
                    {song.year && <span className="song-year">{song.year}</span>}
                  </div>
                  <p className="song-reason">{song.reason}</p>
                  
                  {links && (
                    <div className="streaming-links">
                      <h4>Listen On</h4>
                      <div className="streaming-services">
                        {STREAMING_SERVICES.map(service => {
                          const url = links[service.key];
                          return url ? (
                            <a
                              key={service.key}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="streaming-link"
                              title={`Listen on ${service.name}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="link-emoji">{service.emoji}</span>
                              <span className="link-name">{service.name}</span>
                            </a>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  
                  <SimilarSongs song={song} />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(song);
                    }}
                    className={`favorite-btn-expanded ${isFavorite(song) ? 'favorited' : ''}`}
                    title="Add to favorites"
                  >
                    <Heart size={18} fill={isFavorite(song) ? 'currentColor' : 'none'} />
                    <span>{isFavorite(song) ? 'Added to Favorites' : 'Add to Favorites'}</span>
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {filter === 'favorites' && favorites.length === 0 && (
        <p className="empty-state">No favorite songs yet. Click the heart icon to add songs!</p>
      )}
    </div>
  );
}
