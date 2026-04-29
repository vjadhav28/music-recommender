import React, { useState, useEffect } from 'react');
import { BarChart, TrendingUp, Music } from 'lucide-react';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="mini-spinner"></div>
        <p>Loading your insights...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="analytics-error">
        <p>Unable to load analytics. {error && `Error: ${error}`}</p>
      </div>
    );
  }

  const { stats, moodDistribution, genrePreferences, favoriteCount, historyCount } = analytics;

  const topMoods = Object.entries(moodDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topGenres = Object.entries(genrePreferences)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Your Insights</h2>
        <button onClick={fetchAnalytics} className="refresh-btn" title="Refresh analytics">
          ⟲
        </button>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card stat-card">
          <div className="stat-icon">🎵</div>
          <div className="stat-content">
            <p className="stat-value">{stats.totalRecommendations || 0}</p>
            <p className="stat-label">Total Recommendations</p>
          </div>
        </div>

        <div className="analytics-card stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-content">
            <p className="stat-value">{stats.totalSongsLiked || 0}</p>
            <p className="stat-label">Songs Liked</p>
          </div>
        </div>

        <div className="analytics-card stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <p className="stat-value">{favoriteCount}</p>
            <p className="stat-label">Saved to Favorites</p>
          </div>
        </div>

        <div className="analytics-card stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <p className="stat-value">{historyCount}</p>
            <p className="stat-label">Search History</p>
          </div>
        </div>
      </div>

      <div className="analytics-charts">
        {topMoods.length > 0 && (
          <div className="analytics-card chart-card">
            <h3>Your Favorite Moods</h3>
            <div className="chart-bars">
              {topMoods.map(([mood, count]) => {
                const maxCount = Math.max(...topMoods.map(m => m[1]));
                const percentage = (count / maxCount) * 100;
                return (
                  <div key={mood} className="chart-bar-group">
                    <div className="chart-bar-label">{mood}</div>
                    <div className="chart-bar-container">
                      <div
                        className="chart-bar-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="chart-bar-value">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {topGenres.length > 0 && (
          <div className="analytics-card chart-card">
            <h3>Most Explored Genres</h3>
            <div className="genre-tags">
              {topGenres.map(([genre, count]) => (
                <span key={genre} className="genre-tag">
                  {genre}
                  <span className="genre-count">{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <button onClick={fetchAnalytics} className="refresh-full-btn">
        Refresh Insights
      </button>
    </div>
  );
}
