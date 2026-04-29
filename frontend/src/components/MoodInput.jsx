import React, { useState } from 'react';
import { Globe } from 'lucide-react';

const MOODS = ['Happy', 'Sad', 'Energetic', 'Relaxed', 'Romantic', 'Focused', 'Angry', 'Nostalgic'];

const GENRES = [
  'Jazz',
  'Hip-Hop',
  'Classical',
  'Rock',
  'Pop',
  'Electronic',
  'Country',
  'R&B',
  'Indie',
  'Reggae',
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' },
  { code: 'hi', name: 'हिन्दी' },
];

export default function MoodInput({ onSubmit, loading }) {
  const [mood, setMood] = useState('');
  const [genre, setGenre] = useState('');
  const [activity, setActivity] = useState('');
  const [language, setLanguage] = useState('en');
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mood) return;

    onSubmit({
      mood: mood.trim(),
      genre: genre.trim(),
      activity: activity.trim(),
      language,
    });
  };

  const selectGenre = (selectedGenre) => {
    setGenre(selectedGenre);
    setShowGenreDropdown(false);
  };

  return (
    <form onSubmit={handleSubmit} className="recommender-form">
      <div className="form-header">
        <h2>What&apos;s Your Vibe?</h2>
        <div className="language-selector">
          <Globe size={18} />
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="language-select">
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <label>How are you feeling?</label>
        <div className="mood-grid">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={`mood-chip ${mood === m ? 'active' : ''}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <label htmlFor="genre-input">Preferred genre (optional)</label>
        <div className="genre-input-wrapper">
          <button
            type="button"
            onClick={() => setShowGenreDropdown(!showGenreDropdown)}
            className="genre-button"
          >
            {genre || 'Select a genre...'}
          </button>
          {showGenreDropdown && (
            <div className="genre-dropdown">
              <input
                type="text"
                placeholder="Type to search..."
                className="genre-search"
                onChange={(e) => {
                  // Filter genres based on input
                }}
              />
              <div className="genre-list">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => selectGenre(g)}
                    className={`genre-option ${genre === g ? 'selected' : ''}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="form-section">
        <label htmlFor="activity-input">What are you doing? (optional)</label>
        <input
          id="activity-input"
          type="text"
          placeholder="e.g. Working out, Studying, Driving..."
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          className="text-input"
        />
      </div>

      <button type="submit" disabled={!mood || loading} className="primary-btn">
        {loading ? 'Getting recommendations...' : '🎧 Get Recommendations'}
      </button>
    </form>
  );
}
