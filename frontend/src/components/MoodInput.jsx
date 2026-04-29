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
        <label>01 — How are you feeling?</label>
        <div className="mood-grid">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={`mood-chip ${mood === m ? 'active' : ''}`}
              aria-pressed={mood === m}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <label htmlFor="genre-input">02 — Preferred genre (optional)</label>
        <input
          id="genre-input"
          type="text"
          placeholder="Jazz, Hip-Hop, Classical, Lo-fi..."
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="text-input"
        />
      </div>

      <div className="form-section">
        <label htmlFor="activity-input">03 — What are you doing? (optional)</label>
        <input
          id="activity-input"
          type="text"
          placeholder="Working out, studying, driving home..."
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          className="text-input"
        />
      </div>

      <button type="submit" disabled={!mood || loading} className="primary-btn">
        <span>{loading ? 'Tuning your frequency' : 'Tune my playlist'}</span>
        <span className="arrow" aria-hidden="true">→</span>
      </button>
    </form>
  );
}
