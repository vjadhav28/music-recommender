import React, { useEffect, useRef, useState } from 'react';

const STREAMING_SERVICES = [
  {
    id: 'spotify',
    name: 'Spotify',
    buildAppUrl: (q) => `spotify:search:${q}`,
    buildWebUrl: (q) => `https://open.spotify.com/search/${q}`,
  },
  {
    id: 'apple',
    name: 'Apple Music',
    buildAppUrl: (q) => `music://music.apple.com/us/search?term=${q}`,
    buildWebUrl: (q) => `https://music.apple.com/us/search?term=${q}`,
  },
  {
    id: 'youtube',
    name: 'YouTube Music',
    buildAppUrl: (q) => `youtubemusic://music.youtube.com/search?q=${q}`,
    buildWebUrl: (q) => `https://music.youtube.com/search?q=${q}`,
  },
  {
    id: 'amazon',
    name: 'Amazon Music',
    buildAppUrl: (q) => `amazonmusic://music.amazon.com/search/${q}`,
    buildWebUrl: (q) => `https://music.amazon.com/search/${q}`,
  },
  {
    id: 'tidal',
    name: 'Tidal',
    buildAppUrl: (q) => `tidal://search?query=${q}`,
    buildWebUrl: (q) => `https://listen.tidal.com/search?q=${q}`,
  },
];

const SIGNAL_LABELS = ['Pulse', 'Glow', 'Replay'];

function buildSongSignal(song, idx) {
  const source = `${song.title || ''}${song.artist || ''}${song.genre || ''}`;
  const seed = [...source].reduce((total, char) => total + char.charCodeAt(0), 0);
  return SIGNAL_LABELS.map((label, signalIdx) => ({
    label,
    value: 38 + ((seed + idx * 19 + signalIdx * 23) % 58),
  }));
}

function SongRow({ song, idx }) {
  const [open, setOpen] = useState(false);
  const rowRef = useRef(null);
  const query = encodeURIComponent(`${song.title} ${song.artist}`);
  const songSignal = buildSongSignal(song, idx);

  const handleStreamingOpen = (event, service) => {
    event.preventDefault();
    event.stopPropagation();

    const appUrl = service.buildAppUrl(query);
    const webUrl = service.buildWebUrl(query);
    const fallbackTab = window.open('', '_blank');
    let cleanedUp = false;

    if (fallbackTab) {
      try {
        fallbackTab.opener = null;
        fallbackTab.document.title = `Opening ${service.name}`;
      } catch {
        // Ignore cross-context restrictions on placeholder tabs.
      }
    }

    const cleanup = (closeFallbackTab = true) => {
      if (cleanedUp) return;
      cleanedUp = true;
      window.clearTimeout(fallbackTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', cleanup);
      if (closeFallbackTab && fallbackTab && !fallbackTab.closed) {
        fallbackTab.close();
      }
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanup();
      }
    };

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    iframe.style.display = 'none';

    const fallbackTimer = window.setTimeout(() => {
      cleanup(false);
      if (fallbackTab && !fallbackTab.closed) {
        fallbackTab.location.replace(webUrl);
        fallbackTab.focus();
        return;
      }
      const webTab = window.open(webUrl, '_blank', 'noopener,noreferrer');
      if (!webTab) {
        window.location.assign(webUrl);
      }
    }, 1400);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', cleanup);
    document.body.appendChild(iframe);
    iframe.src = appUrl;
  };

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
        <div className="song-signal" aria-label={`${song.title} signal profile`}>
          {songSignal.map((signal) => (
            <span className="song-signal-item" key={signal.label}>
              <span className="song-signal-label">{signal.label}</span>
              <span className="song-signal-track">
                <span style={{ '--signal-width': `${signal.value}%` }}></span>
              </span>
            </span>
          ))}
        </div>
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
      </div>
      {open && (
        <div className="streaming-menu" role="menu" onClick={(e) => e.stopPropagation()}>
          <div className="streaming-menu-label">Open in app</div>
          {STREAMING_SERVICES.map((service) => (
            <a
              key={service.id}
              role="menuitem"
              href={service.buildWebUrl(query)}
              className="streaming-link"
              onClick={(event) => handleStreamingOpen(event, service)}
            >
              <span>{service.name}</span>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      )}
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

      <div className="drop-meta" aria-label="Set details">
        <span>{data.songs.length}-track drop</span>
        <span>Stream links ready</span>
        <span>Fresh match</span>
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
