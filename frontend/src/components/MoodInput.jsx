import React, { useState } from 'react';

const MOODS = ['Happy', 'Sad', 'Energetic', 'Relaxed', 'Romantic', 'Focused', 'Angry', 'Nostalgic'];

export default function MoodInput({ onSubmit, loading }) {
  const [mood, setMood] = useState('');
  const [genre, setGenre] = useState('');
  const [activity, setActivity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mood) return;

    onSubmit({
      mood: mood.trim(),
      genre: genre.trim(),
      activity: activity.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="recommender-form">
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
        <input
          id="genre-input"
          type="text"
          placeholder="e.g. Jazz, Hip-Hop, Classical..."
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="text-input"
        />
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
