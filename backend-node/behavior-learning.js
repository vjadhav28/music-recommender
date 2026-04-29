// Behavior Learning Algorithm
// Learns from user interactions to improve recommendations

export const BehaviorLearning = {
  // Calculate mood preference weights based on user history
  calculateMoodWeights(history) {
    if (!history || history.length === 0) {
      return {};
    }

    const weights = {};
    history.forEach(entry => {
      weights[entry.mood] = (weights[entry.mood] || 0) + 1;
    });

    // Normalize to 0-1 range
    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
    Object.keys(weights).forEach(mood => {
      weights[mood] = weights[mood] / total;
    });

    return weights;
  },

  // Calculate genre preference weights
  calculateGenreWeights(history) {
    if (!history || history.length === 0) {
      return {};
    }

    const weights = {};
    history.forEach(entry => {
      if (entry.genre) {
        weights[entry.genre] = (weights[entry.genre] || 0) + 1;
      }
    });

    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
    Object.keys(weights).forEach(genre => {
      weights[genre] = weights[genre] / total;
    });

    return weights;
  },

  // Calculate activity patterns
  calculateActivityPatterns(history) {
    if (!history || history.length === 0) {
      return {};
    }

    const patterns = {};
    history.forEach(entry => {
      if (entry.activity) {
        patterns[entry.activity] = (patterns[entry.activity] || 0) + 1;
      }
    });

    return patterns;
  },

  // Predict next mood based on patterns
  predictNextMood(history, moodWeights) {
    if (!history || history.length === 0) {
      return 'happy'; // Default
    }

    // Get last 3 moods and their patterns
    const recentMoods = history.slice(-3).map(entry => entry.mood);
    const moodTransitions = {};

    // If user has been using sad moods, they might switch to energetic
    if (recentMoods.every(m => m === 'sad' || m === 'nostalgic')) {
      return 'energetic';
    }

    // If user has been using energetic, they might switch to relaxed
    if (recentMoods.every(m => m === 'energetic')) {
      return 'relaxed';
    }

    // Otherwise return most frequent mood
    const mostFrequent = Object.entries(moodWeights)
      .sort((a, b) => b[1] - a[1])[0];
    
    return mostFrequent ? mostFrequent[0] : 'happy';
  },

  // Calculate personalization score based on favorites
  calculatePersonalizationScore(favorites, history) {
    if (!favorites || !history) return 0;

    let matchCount = 0;
    favorites.forEach(fav => {
      history.forEach(entry => {
        if (entry.songs && entry.songs.some(s => s.title === fav.title && s.artist === fav.artist)) {
          matchCount++;
        }
      });
    });

    return matchCount / Math.max(favorites.length, history.length);
  },

  // Generate personalized recommendation boost
  generatePersonalizationBoost(userProfile, currentRequest) {
    const boost = {
      moodSimilarity: 0,
      genreSimilarity: 0,
      activityBoost: 0,
    };

    if (!userProfile || !currentRequest) {
      return boost;
    }

    // Calculate mood similarity to user preferences
    const moodWeights = this.calculateMoodWeights(userProfile.history);
    if (currentRequest.mood && moodWeights[currentRequest.mood]) {
      boost.moodSimilarity = moodWeights[currentRequest.mood] * 0.3;
    }

    // Calculate genre similarity
    const genreWeights = this.calculateGenreWeights(userProfile.history);
    if (currentRequest.genre && genreWeights[currentRequest.genre]) {
      boost.genreSimilarity = genreWeights[currentRequest.genre] * 0.3;
    }

    // Activity-based boost
    const activityPatterns = this.calculateActivityPatterns(userProfile.history);
    if (currentRequest.activity && activityPatterns[currentRequest.activity]) {
      boost.activityBoost = Math.min(activityPatterns[currentRequest.activity] / 10, 0.2);
    }

    return boost;
  },

  // Calculate recommendation score based on user behavior
  calculateRecommendationScore(song, userProfile, userFavorites) {
    let score = 0.5; // Base score

    if (!userProfile || !userFavorites) {
      return score;
    }

    // Check if similar songs were liked before
    const history = userProfile.history || [];
    const likedSimilarGenres = userFavorites
      .filter(fav => fav.genre === song.genre)
      .length;

    if (likedSimilarGenres > 0) {
      score += likedSimilarGenres * 0.1;
    }

    // Check if user likes songs from this artist
    const likedArtistSongs = userFavorites
      .filter(fav => fav.artist === song.artist)
      .length;

    if (likedArtistSongs > 0) {
      score += likedArtistSongs * 0.15;
    }

    // Recency boost - recent favorites get higher scores
    const recentFavorites = userFavorites
      .filter(fav => {
        const likedAt = new Date(fav.likedAt || 0);
        const daysSince = (Date.now() - likedAt) / (1000 * 60 * 60 * 24);
        return daysSince < 7; // Last 7 days
      })
      .length;

    if (recentFavorites > 0) {
      score += 0.15;
    }

    return Math.min(score, 1.0);
  },

  // Adapt recommendation parameters based on user behavior
  adaptRecommendationParameters(userProfile) {
    const params = {
      diversityLevel: 0.5,
      explorationRate: 0.3,
      reliance: 0.7,
    };

    if (!userProfile || !userProfile.history || userProfile.history.length === 0) {
      return params;
    }

    // If user has strong genre preferences, reduce diversity
    const genreWeights = this.calculateGenreWeights(userProfile.history);
    const maxGenreWeight = Math.max(...Object.values(genreWeights));
    if (maxGenreWeight > 0.4) {
      params.diversityLevel = 0.3;
      params.reliance = 0.85;
    }

    // If user has diverse history, increase exploration
    if (Object.keys(genreWeights).length > 5) {
      params.explorationRate = 0.5;
      params.diversityLevel = 0.7;
    }

    // If user has many favorites, increase reliance on learned preferences
    if (userProfile.stats && userProfile.stats.totalSongsLiked > 10) {
      params.reliance = 0.9;
    }

    return params;
  },
};
