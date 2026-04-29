import React, { useState, useEffect } from 'react';
import { Heart, Music } from 'lucide-react';
import PlaylistExport from './PlaylistExport';
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

      <PlaylistExport songs={filter === 'favorites' ? favorites : data.songs} request={request} />

      <div className="recommendation-grid">
        {(filter === 'favorites' ? favorites : data.songs).map((song, idx) => {
          const links = getStreamingLinks(song);
          return (
            <article key={`${song.title}-${song.artist}-${idx}`} className="song-card">
              <div className="song-index">{idx + 1}</div>
              <div className="song-content">
                <h3>{song.title}</h3>
                <p className="song-artist">{song.artist}</p>
                <div className="song-meta">
                  <span className="song-genre">{song.genre}</span>
                  {song.year && <span className="song-year">{song.year}</span>}
                </div>
                <p className="song-reason">{song.reason}</p>
                {links && (
                  <div className="streaming-links">
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
                        >
                          <span className="link-emoji">{service.emoji}</span>
                          <span className="link-name">{service.name}</span>
                        </a>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
              <SimilarSongs song={song} />
              <button
                onClick={() => toggleFavorite(song)}
                className={`favorite-btn ${isFavorite(song) ? 'favorited' : ''}`}
                title="Add to favorites"
              >
                <Heart size={20} />
              </button>
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
