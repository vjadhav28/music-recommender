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

    // For streaming services, we'll open their app/website and guide user to add songs
    // Generate URLs for individual songs that user can add to a playlist
    switch (service) {
      case 'spotify':
        // Open Spotify and search for first song as starting point
        const spotifyFirstSong = songs[0];
        return `https://open.spotify.com/search/${encodeURIComponent(spotifyFirstSong.title + ' ' + spotifyFirstSong.artist)}`;
      case 'appleMusic':
        // Apple Music search for first song
        const appleSong = songs[0];
        return `https://music.apple.com/search?term=${encodeURIComponent(appleSong.title + ' ' + appleSong.artist)}`;
      case 'youtubeMusic':
        // YouTube Music search for first song
        const ytSong = songs[0];
        return `https://music.youtube.com/search?q=${encodeURIComponent(ytSong.title + ' ' + ytSong.artist)}`;
      case 'amazonMusic':
        // Amazon Music search for first song
        const amzSong = songs[0];
        return `https://music.amazon.com/search/${encodeURIComponent(amzSong.title + ' ' + amzSong.artist)}`;
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
        <div>
          <h3>Save Your Playlist</h3>
          <p>Share your recommendations on your favorite music platform</p>
        </div>
      </div>

      <div className="export-services">
        <button
          onClick={() => handleExport('spotify')}
          disabled={isExporting}
          className="export-service-btn spotify"
          title="Export to Spotify"
        >
          <span className="service-emoji">🎵</span>
          <span className="service-name">Spotify</span>
        </button>

        <button
          onClick={() => handleExport('appleMusic')}
          disabled={isExporting}
          className="export-service-btn apple"
          title="Export to Apple Music"
        >
          <span className="service-emoji">🎶</span>
          <span className="service-name">Apple Music</span>
        </button>

        <button
          onClick={() => handleExport('youtubeMusic')}
          disabled={isExporting}
          className="export-service-btn youtube"
          title="Export to YouTube Music"
        >
          <span className="service-emoji">▶️</span>
          <span className="service-name">YouTube Music</span>
        </button>

        <button
          onClick={() => handleExport('amazonMusic')}
          disabled={isExporting}
          className="export-service-btn amazon"
          title="Export to Amazon Music"
        >
          <span className="service-emoji">🎧</span>
          <span className="service-name">Amazon Music</span>
        </button>
      </div>

      <div className="export-divider">or</div>

      <div className="export-downloads">
        <button
          onClick={() => handleExport('json')}
          disabled={isExporting}
          className="export-download-btn"
          title="Download as JSON"
        >
          <Download size={18} />
          <span>Download JSON</span>
        </button>

        <button
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="export-download-btn"
          title="Download as CSV"
        >
          <Download size={18} />
          <span>Download CSV</span>
        </button>
      </div>

      <p className="export-note">
        Streaming services will open in a new tab. Download formats let you import elsewhere.
      </p>
    </div>
  );
}
