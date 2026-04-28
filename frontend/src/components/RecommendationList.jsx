import React from 'react';

export default function RecommendationList({ data, request }) {
  if (!data || !data.songs || data.songs.length === 0) {
    return <p className="empty-state">No recommendations found.</p>;
  }

  return (
    <div className="recommendations-shell">
      <div className="recommendation-header">
        <h2>Your playlist</h2>
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
            <div className="song-index">{idx + 1}</div>
            <div className="song-content">
              <h3>{song.title}</h3>
              <p className="song-artist">{song.artist}</p>
              <span className="song-genre">{song.genre}</span>
              <p className="song-reason">{song.reason}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
