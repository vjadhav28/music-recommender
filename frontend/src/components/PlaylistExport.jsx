import React, { useState } from 'react';
import { Download, Share2 } from 'lucide-react';

export default function PlaylistExport({ songs, request }) {
  const [exportFormat, setExportFormat] = useState('spotify');
  const [isExporting, setIsExporting] = useState(false);

  const generatePlaylistURL = (service) => {
    if (!songs || songs.length === 0) return '';

    const playlistName = request?.mood 
      ? `Music Recommender - ${request.mood}${request.genre ? ' - ' + request.genre : ''}`
      : 'My Recommendations';

    const songQueries = songs
      .map(song => `${song.title} ${song.artist}`)
      .join(' ');

    switch (service) {
      case 'spotify':
        return `https://open.spotify.com/search/${encodeURIComponent(playlistName)}`;
      case 'appleMusic':
        return `https://music.apple.com/search?term=${encodeURIComponent(playlistName)}`;
      case 'youtubeMusic':
        return `https://music.youtube.com/search?q=${encodeURIComponent(playlistName)}`;
      case 'amazonMusic':
        return `https://music.amazon.com/search/${encodeURIComponent(playlistName)}`;
      default:
        return '';
    }
  };

  const exportAsJSON = () => {
    const playlist = {
      name: request?.mood 
        ? `Music Recommender - ${request.mood}${request.genre ? ' - ' + request.genre : ''}`
        : 'My Recommendations',
      createdAt: new Date().toISOString(),
      request,
      songs: songs,
    };

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(playlist, null, 2)));
    element.setAttribute('download', `playlist-${Date.now()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportAsCSV = () => {
    const headers = ['Title', 'Artist', 'Genre', 'Year', 'Reason'];
    const rows = songs.map(song => [
      song.title,
      song.artist,
      song.genre,
      song.year || '',
      song.reason || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `playlist-${Date.now()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExport = async (service) => {
    setIsExporting(true);
    try {
      if (service === 'json') {
        exportAsJSON();
      } else if (service === 'csv') {
        exportAsCSV();
      } else {
        const url = generatePlaylistURL(service);
        if (url) {
          window.open(url, '_blank');
        }
      }
    } finally {
      setIsExporting(false);
    }
  };

  if (!songs || songs.length === 0) {
    return null;
  }

  return (
    <div className="playlist-export">
      <div className="export-header">
        <h3>Export Playlist</h3>
        <p>Share your recommendations on your favorite platform</p>
      </div>

      <div className="export-buttons">
        <button
          onClick={() => handleExport('spotify')}
          disabled={isExporting}
          className="export-btn export-spotify"
          title="Export to Spotify"
        >
          <span className="export-icon">🎵</span>
          <span>Spotify</span>
        </button>

        <button
          onClick={() => handleExport('appleMusic')}
          disabled={isExporting}
          className="export-btn export-apple"
          title="Export to Apple Music"
        >
          <span className="export-icon">🎶</span>
          <span>Apple Music</span>
        </button>

        <button
          onClick={() => handleExport('youtubeMusic')}
          disabled={isExporting}
          className="export-btn export-youtube"
          title="Export to YouTube Music"
        >
          <span className="export-icon">▶️</span>
          <span>YouTube Music</span>
        </button>

        <button
          onClick={() => handleExport('amazonMusic')}
          disabled={isExporting}
          className="export-btn export-amazon"
          title="Export to Amazon Music"
        >
          <span className="export-icon">🎧</span>
          <span>Amazon Music</span>
        </button>

        <button
          onClick={() => handleExport('json')}
          disabled={isExporting}
          className="export-btn export-json"
          title="Download as JSON"
        >
          <span className="export-icon"><Download size={16} /></span>
          <span>JSON</span>
        </button>

        <button
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="export-btn export-csv"
          title="Download as CSV"
        >
          <span className="export-icon"><Download size={16} /></span>
          <span>CSV</span>
        </button>
      </div>

      <p className="export-note">
        Click any service to search for the playlist and add it, or download as a file to import elsewhere.
      </p>
    </div>
  );
}
