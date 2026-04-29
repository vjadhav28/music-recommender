import React, { useState } from 'react';
import { Zap } from 'lucide-react';

export default function SimilarSongs({ song, onSongSelect }) {
  const [similarSongs, setSimilarSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchSimilarSongs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/similar-songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: song.title,
          artist: song.artist,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch similar songs');
      }

      const data = await response.json();
      setSimilarSongs(data.similarSongs || []);
      setIsExpanded(true);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching similar songs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="similar-songs-section">
      <button
        onClick={fetchSimilarSongs}
        disabled={isLoading}
        className="find-similar-btn"
        title="Find similar songs"
      >
        <Zap size={16} />
        Find Similar
      </button>

      {error && (
        <div className="similar-error">
          Error: {error}
        </div>
      )}

      {isExpanded && similarSongs.length > 0 && (
        <div className="similar-songs-grid">
          <h4>Similar Songs</h4>
          {similarSongs.map((similar, idx) => (
            <div key={`${similar.title}-${similar.artist}-${idx}`} className="similar-song-item">
              <div className="similarity-score">
                {Math.round(similar.similarity * 100)}%
              </div>
              <div className="similar-info">
                <p className="similar-title">{similar.title}</p>
                <p className="similar-artist">{similar.artist}</p>
                <p className="similar-genre">{similar.genre}</p>
              </div>
              {similar.links && (
                <a
                  href={similar.links.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="similar-play-btn"
                  title="Listen on Spotify"
                >
                  ▶
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="similar-loading">
          <div className="mini-spinner"></div>
          <p>Finding similar tracks...</p>
        </div>
      )}
    </div>
  );
}
