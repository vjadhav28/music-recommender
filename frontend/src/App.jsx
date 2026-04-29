import React, { useEffect, useMemo, useState } from 'react';
import MoodInput from './components/MoodInput';
import RecommendationList from './components/RecommendationList';
import RequestHistory from './components/RequestHistory';
import LandingPage from './components/LandingPage';
import Analytics from './components/Analytics';
import PlaylistExport from './components/PlaylistExport';
import { Moon, Sun } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'music-recommender-history';
const THEME_KEY = 'music-recommender-theme';

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
  const [showApp, setShowApp] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = window.localStorage.getItem(THEME_KEY);
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_KEY, JSON.stringify(darkMode));
      if (darkMode) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    }
  }, [darkMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }
  }, [history]);

  const handleSubmit = async ({ mood, genre, activity }) => {
    setLoading(true);
    setError(null);
    setRecommendations(null);
    setLastRequest({ mood, genre, activity });

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, genre, activity }),
      });

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => null);
        throw new Error(errorPayload?.message || `Server error: ${res.status}`);
      }

      const data = await res.json();
      setRecommendations(data);
      setHistory((previous) => {
        const entry = {
          id: `${Date.now()}`,
          mood,
          genre,
          activity,
          summary: data?.summary || '',
          createdAt: new Date().toISOString(),
        };
        return [entry, ...previous].slice(0, 8);
      });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`app-shell ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <button 
        className="theme-toggle" 
        onClick={() => setDarkMode(!darkMode)}
        title="Toggle theme"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {!showApp ? (
        <LandingPage onStartClick={() => setShowApp(true)} />
      ) : (
        <>
          <header className="app-header">
            <h1>🎵 Music Recommender Studio</h1>
            <p>Describe your vibe and get a tuned playlist in seconds.</p>
          </header>

          <main className="layout-grid">
            <section className="surface panel">
              <MoodInput onSubmit={handleSubmit} loading={loading} />
            </section>

            <aside className="surface side-panel">
              <div className="side-panel-section">
                <h2>Tip</h2>
                <p>Include both mood and activity for tighter recommendations (for example: focused + coding).</p>
              </div>
            </aside>
          </main>

          <section className="results-area">
            {error && <div className="alert-error">⚠️ {error}</div>}

            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Composing recommendations...</p>
              </div>
            )}

            {recommendations && <RecommendationList data={recommendations} request={lastRequest} />}

            {recommendations && <PlaylistExport songs={recommendations.songs} request={lastRequest} />}

            <Analytics />

            {history.length > 0 && (
              <aside className="surface recent-prompts-section">
                <div className="side-panel-section">
                  <h2>Recent prompts</h2>
                  <RequestHistory
                    items={history}
                    onSelect={(entry) =>
                      handleSubmit({
                        mood: entry.mood,
                        genre: entry.genre,
                        activity: entry.activity,
                      })
                    }
                  />
                </div>
              </aside>
            )}
          </section>
        </>
      )}
    </div>
  );
}
