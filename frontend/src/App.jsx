import React, { useEffect, useMemo, useState } from 'react';
import MoodInput from './components/MoodInput';
import RecommendationList from './components/RecommendationList';
import RequestHistory from './components/RequestHistory';
import AdSlot from './components/AdSlot';
import { buildFallbackResponse } from './lib/fallbackCatalog';

const AD_SLOT_HERO = import.meta.env.VITE_ADSENSE_SLOT_HERO;
const AD_SLOT_RESULTS = import.meta.env.VITE_ADSENSE_SLOT_RESULTS;
const AD_SLOT_FOOTER = import.meta.env.VITE_ADSENSE_SLOT_FOOTER;

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

const HERO_STACK = [
  { title: 'Afterglow', artist: 'Velvet Static', mood: 'Warm' },
  { title: 'Night Drive', artist: 'Luma Vale', mood: 'Fast' },
  { title: 'Soft Focus', artist: 'Northline', mood: 'Deep' },
];

const HERO_BARS = [42, 74, 56, 92, 48, 68, 84, 54, 78, 46, 64, 88, 52, 72, 58, 96];

const SIGNAL_STATS = [
  { label: 'Taste memory', value: '8 moods' },
  { label: 'Drop size', value: '5+ tracks' },
  { label: 'Replay pull', value: 'High' },
];

function buildApiUrl() {
  const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  if (apiBase) return `${apiBase}/api/recommendations`;
  if (import.meta.env.VITE_USE_RELATIVE_API === 'true' || import.meta.env.VITE_USE_API_PROXY === 'true') {
    return '/api/recommendations';
  }
  return null;
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

    if (!apiUrl) {
      // No backend configured — serve curated fallback directly.
      await new Promise((r) => setTimeout(r, 600));
      finishWith(buildFallbackResponse({ mood, genre, activity, language }));
      setLoading(false);
      return;
    }

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
    } catch {
      // Network failure or unreachable backend — serve curated fallback
      finishWith(buildFallbackResponse({ mood, genre, activity, language }));
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
        <div className="hero-stage" aria-hidden="true">
          <div className="stage-label">Live taste scan</div>
          <div className="album-stack">
            {HERO_STACK.map((track, index) => (
              <div className={`album-card album-card-${index + 1}`} key={track.title}>
                <span>{track.mood}</span>
                <strong>{track.title}</strong>
                <small>{track.artist}</small>
              </div>
            ))}
          </div>
          <div className="hero-spectrum">
            {HERO_BARS.map((height, index) => (
              <span key={index} style={{ '--bar-height': `${height}%` }}></span>
            ))}
          </div>
          <div className="queue-ribbon">
            <span>Fresh queue</span>
            <span>Deep match</span>
            <span>One more set</span>
          </div>
        </div>

        <div className="hero-copy">
          <span className="hero-eyebrow">Now playing · your vibe</span>
          <h1>
            Find your <span className="accent">next</span>
            <br />
            favorite <span className="accent">song.</span>
          </h1>
          <p>
            A tight five-track drop for the exact mood you&apos;re in: familiar enough to trust, fresh enough to chase.
          </p>
        </div>

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

      <AdSlot slot={AD_SLOT_HERO} className="ad-slot--horizontal" />

      <main className="layout-grid">
        <section className="surface panel">
          <MoodInput onSubmit={handleSubmit} loading={loading} />
        </section>

        <aside className="surface side-panel">
          <div className="side-panel-section side-panel-hero">
            <span className="panel-kicker">Live signal</span>
            <h2>Keep the streak warm.</h2>
            <p>Recent moods stay on deck, so every return visit feels a little more like your room.</p>
          </div>

          <div className="signal-board" aria-label="Recommendation status">
            {SIGNAL_STATS.map((stat) => (
              <div className="signal-stat" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>

          <div className="mini-player" aria-hidden="true">
            <div className="mini-player-disc"></div>
            <div>
              <span>Next set</span>
              <strong>Mood locked</strong>
            </div>
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

        {recommendations && (
          <>
            <RecommendationList data={recommendations} request={lastRequest} />
            <AdSlot slot={AD_SLOT_RESULTS} className="ad-slot--inline" />
          </>
        )}
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

      <AdSlot slot={AD_SLOT_FOOTER} className="ad-slot--horizontal" />
    </div>
  );
}
