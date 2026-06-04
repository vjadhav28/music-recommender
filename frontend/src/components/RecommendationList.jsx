import React, { useEffect, useRef, useState } from 'react';

const STREAMING_SERVICES = [
  {
    id: 'spotify',
    name: 'Spotify',
    buildUrl: (q) => `https://open.spotify.com/search/${q}`,
  },
  {
    id: 'apple',
    name: 'Apple Music',
    buildUrl: (q) => `https://music.apple.com/us/search?term=${q}`,
  },
  {
    id: 'youtube',
    name: 'YouTube Music',
    buildUrl: (q) => `https://music.youtube.com/search?q=${q}`,
  },
  {
    id: 'amazon',
    name: 'Amazon Music',
    buildUrl: (q) => `https://music.amazon.com/search/${q}`,
  },
  {
    id: 'tidal',
    name: 'Tidal',
    buildUrl: (q) => `https://tidal.com/search?q=${q}`,
  },
];

function SongRow({ song, idx }) {
  const [open, setOpen] = useState(false);
  const rowRef = useRef(null);
  const query = encodeURIComponent(`${song.title} ${song.artist}`);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (e) => {
      if (rowRef.current && !rowRef.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <article
      ref={rowRef}
      className={`song-card ${open ? 'is-open' : ''}`}
      onClick={() => setOpen((v) => !v)}
    >
      <div className="song-index">{String(idx + 1).padStart(2, '0')}</div>
      <div className="song-content">
        <h3>{song.title}</h3>
        <div className="song-meta">
          <p className="song-artist">{song.artist}</p>
          {song.genre && <span className="song-genre">{song.genre}</span>}
        </div>
        {song.reason && <p className="song-reason">{song.reason}</p>}
      </div>
      <div className="song-actions">
        <button
          type="button"
          className="song-play"
          aria-label={`Open ${song.title} on a streaming service`}
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          {open ? '×' : '▶'}
        </button>
        {open && (
          <div className="streaming-menu" role="menu" onClick={(e) => e.stopPropagation()}>
            <div className="streaming-menu-label">Listen on</div>
            {STREAMING_SERVICES.map((service) => (
              <a
                key={service.id}
                role="menuitem"
                href={service.buildUrl(query)}
                target="_blank"
                rel="noopener noreferrer"
                className="streaming-link"
              >
                <span>{service.name}</span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

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
            {request.language && request.language !== 'Any' && <span>{request.language}</span>}
          </div>
        )}
      </div>

      {data.summary && <p className="summary-text">{data.summary}</p>}

      <div className="recommendation-grid">
        {data.songs.map((song, idx) => (
          <SongRow key={`${song.title}-${song.artist}-${idx}`} song={song} idx={idx} />
        ))}
      </div>
    </div>
  );
}
