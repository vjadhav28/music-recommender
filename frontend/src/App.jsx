import React, { useEffect, useMemo, useState } from 'react';
import MoodInput from './components/MoodInput';
import RecommendationList from './components/RecommendationList';
import RequestHistory from './components/RequestHistory';
import { buildFallbackResponse } from './lib/fallbackCatalog';

const HISTORY_STORAGE_KEY = 'music-recommender-history';

const MARQUEE_WORDS = [
  'Late night drives',
  'Sunday mornings',
  'Coding in flow',
  'Heartbreak hours',
  'Pre-game energy',
  'Rainy afternoons',
  'First date jitters',
  'Long hauls',
  'Friday wind-down',
  'Solo dance party',
];

function buildApiUrl() {
  const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  return `${apiBase}/api/recommendations`;
}

function readHistory() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const apiUrl = useMemo(() => buildApiUrl(), []);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRequest, setLastRequest] = useState(null);
  const [history, setHistory] = useState(readHistory);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }
  }, [history]);

  const handleSubmit = async ({ mood, genre, activity, language }) => {
    setLoading(true);
    setError(null);
    setRecommendations(null);
    setLastRequest({ mood, genre, activity, language });

    const finishWith = (data) => {
      setRecommendations(data);
      setHistory((previous) => {
        const entry = {
          id: `${Date.now()}`,
          mood,
          genre,
          activity,
          language,
          summary: data?.summary || '',
          createdAt: new Date().toISOString(),
        };
        return [entry, ...previous].slice(0, 8);
      });
    };

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, genre, activity, language }),
      });

      if (!res.ok) {
        // 404 / 5xx — backend not deployed or route missing. Fall back gracefully.
        if (res.status === 404 || res.status >= 500) {
          finishWith(buildFallbackResponse({ mood, genre, activity, language }));
          return;
        }
        const errorPayload = await res.json().catch(() => null);
        throw new Error(errorPayload?.message || `Server error: ${res.status}`);
      }

      const data = await res.json();
      // Safety net: ensure we always show at least 5 picks
      if (!data?.songs || data.songs.length < 5) {
        const padded = buildFallbackResponse({ mood, genre, activity, language });
        const seen = new Set((data?.songs || []).map((s) => `${s.title}|${s.artist}`.toLowerCase()));
        const merged = [...(data?.songs || [])];
        for (const song of padded.songs) {
          const key = `${song.title}|${song.artist}`.toLowerCase();
          if (seen.has(key)) continue;
          merged.push(song);
          seen.add(key);
          if (merged.length >= 5) break;
        }
        finishWith({ ...data, songs: merged, summary: data?.summary || padded.summary });
        return;
      }
      finishWith(data);
    } catch (err) {
      // Network failure or unreachable backend — serve curated fallback
      finishWith(buildFallbackResponse({ mood, genre, activity, language }));
      console.log('[v0] api unreachable, served fallback:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  const marqueeItems = [...MARQUEE_WORDS, ...MARQUEE_WORDS];

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-dot" aria-hidden="true"></span>
          SONAR
        </div>
        <div className="equalizer" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </header>

      <section className="hero">
        <span className="hero-eyebrow">Now playing · your vibe</span>
        <h1>
          Find your <span className="accent">next</span>
          <br />
          favorite <span className="accent">song.</span>
        </h1>
        <p>
          Tell us how you feel and what you&apos;re doing. We&apos;ll tune a playlist that fits the moment — not yesterday&apos;s
          algorithm.
        </p>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {marqueeItems.map((word, i) => (
              <React.Fragment key={`${word}-${i}`}>
                <span>{word}</span>
                <span className="dot">●</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <main className="layout-grid">
        <section className="surface panel">
          <MoodInput onSubmit={handleSubmit} loading={loading} />
        </section>

        <aside className="surface side-panel">
          <div className="side-panel-section">
            <h2>Pro tip</h2>
            <p className="tip-card">
              Pair a mood with an activity for sharper picks. Try <strong>focused + coding</strong> or{' '}
              <strong>nostalgic + driving</strong>.
            </p>
          </div>
        </aside>
      </main>

      <section className="results-area">
        {error && <div className="alert-error">{error}</div>}

        {loading && (
          <div className="loading-state">
            <div className="vinyl" aria-hidden="true"></div>
            <p>Tuning your frequency</p>
          </div>
        )}

        {recommendations && <RecommendationList data={recommendations} request={lastRequest} />}
      </section>

      {history.length > 0 && (
        <section className="history-section">
          <div className="history-section-header">
            <h2>Recent prompts</h2>
            <span>{history.length} saved</span>
          </div>
          <RequestHistory
            items={history}
            onSelect={(entry) =>
              handleSubmit({
                mood: entry.mood,
                genre: entry.genre,
                activity: entry.activity,
                language: entry.language,
              })
            }
          />
        </section>
      )}
    </div>
  );
}
