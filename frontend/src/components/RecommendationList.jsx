import React from 'react';

export default function RecommendationList({ data, request }) {
  if (!data || !data.songs || data.songs.length === 0) {
    return <p className="empty-state">No recommendations found.</p>;
  }

  return (
    <div className="recommendations-shell">
      <div className="recommendation-header">
        <h2>
          Your <em>set.</em>
        </h2>
        {request?.mood && (
          <div className="request-badges">
            <span>{request.mood}</span>
            {request.genre && <span>{request.genre}</span>}
            {request.activity && <span>{request.activity}</span>}
          </div>
        )}
      </div>

      {data.summary && <p className="summary-text">{data.summary}</p>}

      <div className="recommendation-grid">
        {data.songs.map((song, idx) => (
          <article key={`${song.title}-${song.artist}-${idx}`} className="song-card">
            <div className="song-index">{String(idx + 1).padStart(2, '0')}</div>
            <div className="song-content">
              <h3>{song.title}</h3>
              <div className="song-meta">
                <p className="song-artist">{song.artist}</p>
                {song.genre && <span className="song-genre">{song.genre}</span>}
              </div>
              {song.reason && <p className="song-reason">{song.reason}</p>}
            </div>
            <button type="button" className="song-play" aria-label={`Preview ${song.title}`}>
              ▶
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
