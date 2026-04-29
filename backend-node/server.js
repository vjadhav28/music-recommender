import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { UserDB, HistoryDB, FavoritesDB, SongFeaturesDB } from './database.js';
import { EXTENDED_SONG_DATABASE } from './songs.js';
import { BehaviorLearning } from './behavior-learning.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Generate or get user ID from header or session
function getUserId(req) {
  return req.headers['x-user-id'] || req.query.userId || 'anonymous-' + Date.now();
}

// Genre database
const GENRES = {
  'jazz': { color: '#FFD700', icon: '🎷' },
  'hip-hop': { color: '#FF6B6B', icon: '🎤' },
  'classical': { color: '#9B59B6', icon: '🎻' },
  'rock': { color: '#E74C3C', icon: '🎸' },
  'pop': { color: '#3498DB', icon: '🎵' },
  'electronic': { color: '#1ABC9C', icon: '🎧' },
  'country': { color: '#D4A373', icon: '🤠' },
  'r&b': { color: '#E91E63', icon: '🎤' },
  'indie': { color: '#95A5A6', icon: '🎸' },
  'reggae': { color: '#F39C12', icon: '🎶' },
};

// Mock song database
const SONG_DATABASE = {
  'happy': [
    { title: 'Walking on Sunshine', artist: 'Katrina & The Waves', genre: 'Pop', year: 1985 },
    { title: 'Good as Hell', artist: 'Lizzo', genre: 'Pop', year: 2016 },
    { title: 'Don\'t Stop Me Now', artist: 'Queen', genre: 'Rock', year: 1978 },
    { title: 'I Will Follow You into the Dark', artist: 'Death Cab for Cutie', genre: 'Indie', year: 2005 },
    { title: 'Levitating', artist: 'Dua Lipa', genre: 'Pop', year: 2020 },
  ],
  'sad': [
    { title: 'Someone Like You', artist: 'Adele', genre: 'Pop', year: 2011 },
    { title: 'Hurt', artist: 'Johnny Cash', genre: 'Country', year: 2002 },
    { title: 'Mad World', artist: 'Gary Jules', genre: 'Alternative', year: 2001 },
    { title: 'The Night We Met', artist: 'Lord Huron', genre: 'Indie', year: 2015 },
    { title: 'Black', artist: 'Pearl Jam', genre: 'Rock', year: 1991 },
  ],
  'energetic': [
    { title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Electronic', year: 2019 },
    { title: 'Kickstart My Heart', artist: 'Mötley Crüe', genre: 'Rock', year: 1989 },
    { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', genre: 'Funk', year: 2014 },
    { title: 'Eye of the Tiger', artist: 'Survivor', genre: 'Rock', year: 1982 },
    { title: 'Titanium', artist: 'David Guetta ft. Sia', genre: 'Electronic', year: 2011 },
  ],
  'relaxed': [
    { title: 'Fly Me to the Moon', artist: 'Frank Sinatra', genre: 'Jazz', year: 1954 },
    { title: 'weightless', artist: 'Marconi Union', genre: 'Ambient', year: 2011 },
    { title: 'Breathe', artist: 'Pink Floyd', genre: 'Rock', year: 1973 },
    { title: 'Green Eyes', artist: 'Erykah Badu', genre: 'R&B', year: 2000 },
    { title: 'Claire de Lune', artist: 'Claude Debussy', genre: 'Classical', year: 1890 },
  ],
  'romantic': [
    { title: 'Thinking Out Loud', artist: 'Ed Sheeran', genre: 'Pop', year: 2014 },
    { title: 'Perfect', artist: 'Ed Sheeran', genre: 'Pop', year: 2017 },
    { title: 'At Last', artist: 'Etta James', genre: 'Jazz', year: 1960 },
    { title: 'Something', artist: 'The Beatles', genre: 'Rock', year: 1969 },
    { title: 'Wonderful Tonight', artist: 'Eric Clapton', genre: 'Rock', year: 1977 },
  ],
  'focused': [
    { title: 'Lo-Fi Hip Hop Study Mix', artist: 'Various', genre: 'Hip-Hop', year: 2020 },
    { title: 'Brian Eno - Music for Airports', artist: 'Brian Eno', genre: 'Ambient', year: 1978 },
    { title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock', year: 1975 },
    { title: 'Comptine d\'un autre été', artist: 'Yann Tiersen', genre: 'Classical', year: 2001 },
    { title: 'Nuvole Bianche', artist: 'Ludovico Einaudi', genre: 'Classical', year: 2009 },
  ],
  'angry': [
    { title: 'Dani California', artist: 'Red Hot Chili Peppers', genre: 'Rock', year: 2006 },
    { title: 'The Middle', artist: 'Jimmy Eat World', genre: 'Rock', year: 2001 },
    { title: 'Killing in the Name', artist: 'Rage Against the Machine', genre: 'Metal', year: 1992 },
    { title: 'Last Resort', artist: 'Papa Roach', genre: 'Metal', year: 2000 },
    { title: 'Numb', artist: 'Linkin Park', genre: 'Metal', year: 2002 },
  ],
  'nostalgic': [
    { title: 'Good Old Days', artist: 'Macklemore & Keane Town', genre: 'Hip-Hop', year: 2018 },
    { title: 'The Way', artist: 'Fastball', genre: 'Pop', year: 1998 },
    { title: 'Time After Time', artist: 'Cyndi Lauper', genre: 'Pop', year: 1984 },
    { title: 'Come On Eileen', artist: 'Dexys Midnight Runners', genre: 'Pop', year: 1982 },
    { title: 'Tears in Heaven', artist: 'Eric Clapton', genre: 'Rock', year: 1992 },
  ],
};

// Multilingual support
const TRANSLATIONS = {
  'en': {
    summary: 'Perfect playlist for your vibe',
    reason: 'Why this song fits: ',
  },
  'es': {
    summary: 'Lista de reproducción perfecta para tu vibe',
    reason: 'Por qué esta canción encaja: ',
  },
  'fr': {
    summary: 'Playlist parfaite pour votre vibe',
    reason: 'Pourquoi cette chanson convient: ',
  },
  'de': {
    summary: 'Perfekte Playlist für Ihre Stimmung',
    reason: 'Warum dieser Song passt: ',
  },
  'ja': {
    summary: 'あなたの雰囲気に最適なプレイリスト',
    reason: 'この曲が合う理由: ',
  },
  'hi': {
    summary: 'आपके मूड के लिए सही प्लेलिस्ट',
    reason: 'यह गाना क्यों फिट है: ',
  },
};

// Reason templates
const REASON_TEMPLATES = {
  'happy': [
    'uplifting melody that matches your mood',
    'feel-good track perfect for today',
    'energetic vibe with positive lyrics',
    'classic feel-good anthem',
    'modern pop hit with infectious energy',
  ],
  'sad': [
    'emotionally resonant and deeply moving',
    'cathartic ballad for introspective moments',
    'powerful vocals paired with melancholic instrumentation',
    'haunting melody that captures the feeling',
    'thoughtful lyrics reflecting the mood',
  ],
  'energetic': [
    'high-energy beat to fuel your day',
    'driving rhythm with powerful vocals',
    'electrifying instrumentation perfect for motivation',
    'intense and captivating track',
    'dynamic composition built to energize',
  ],
  'relaxed': [
    'smooth and calming composition',
    'laid-back groove perfect for unwinding',
    'soothing atmosphere to ease your mind',
    'mellow vibe ideal for relaxation',
    'gentle instrumentation for peace',
  ],
  'romantic': [
    'tender love song with heartfelt lyrics',
    'sweeping orchestration that conveys romance',
    'beautiful duet capturing love\'s essence',
    'ballad perfect for intimate moments',
    'timeless romantic classic',
  ],
  'focused': [
    'instrumental focus aid that maintains concentration',
    'repetitive rhythm supporting deep work',
    'non-intrusive background perfect for productivity',
    'hypnotic beat supporting flow state',
    'concentration-friendly composition',
  ],
  'angry': [
    'powerful expression of raw emotion',
    'aggressive instrumentation matching intensity',
    'cathartic release through music',
    'intense vocals channeling frustration',
    'hard-hitting track for unleashing energy',
  ],
  'nostalgic': [
    'timeless classic evoking memories',
    'throwback hit capturing a moment in time',
    'retro vibe with enduring appeal',
    'vintage gem with lasting impact',
    'reminiscent track with sentimental value',
  ],
};

// Helper function to get recommendations
function getRecommendations(mood, genre, activity, language = 'en') {
  const lowerMood = mood.toLowerCase();
  let songs = EXTENDED_SONG_DATABASE[lowerMood] || EXTENDED_SONG_DATABASE['happy'];
  
  // Language mapping for song filtering
  const languageGenreMap = {
    'hi': 'Bollywood',
    'en': null, // All non-Bollywood songs
    'es': 'Latino',
    'fr': 'French',
    'de': 'German',
    'ja': 'J-Pop',
  };
  
  // Filter by language first - prioritize songs in the selected language
  const targetLanguageGenre = languageGenreMap[language];
  let languageFiltered = songs;
  
  if (language !== 'en' && targetLanguageGenre) {
    // Try to find songs in the requested language
    languageFiltered = songs.filter(song => 
      song.genre === targetLanguageGenre || (song.language && song.language === language)
    );
    
    // If no songs found for that language, fall back to all songs
    if (languageFiltered.length === 0) {
      languageFiltered = songs;
    }
  } else if (language === 'en') {
    // For English, exclude Bollywood and other language-specific genres
    languageFiltered = songs.filter(song => 
      song.genre !== 'Bollywood' && !song.language || song.language === 'en'
    );
  }
  
  // Filter by genre if provided
  let filtered = languageFiltered;
  if (genre && genre.trim()) {
    const lowerGenre = genre.toLowerCase();
    filtered = languageFiltered.filter(song => 
      song.genre.toLowerCase().includes(lowerGenre) || lowerGenre.includes(song.genre.toLowerCase())
    );
    
    if (filtered.length === 0) {
      filtered = languageFiltered;
    }
  }
  
  // Shuffle and select top 5
  const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 5);
  
  // Get reasons
  const reasonTemplates = REASON_TEMPLATES[lowerMood] || REASON_TEMPLATES['happy'];
  
  const lang = TRANSLATIONS[language] || TRANSLATIONS['en'];
  
  // Build summary based on genre and activity
  let summaryParts = [lang.summary];
  if (genre && genre.trim()) {
    summaryParts.push(`with ${genre} vibes`);
  }
  if (activity && activity.trim()) {
    summaryParts.push(`perfect for ${activity}`);
  }
  
  return {
    summary: summaryParts.join(' '),
    songs: shuffled.map((song, idx) => ({
      title: song.title,
      artist: song.artist,
      genre: song.genre,
      year: song.year,
      reason: reasonTemplates[idx % reasonTemplates.length],
      links: song.links,
      audioFeatures: song.audioFeatures,
    })),
  };
}

// Calculate similarity score between two songs based on audio features
function calculateSimilarity(song1Features, song2Features) {
  if (!song1Features || !song2Features) return 0;
  
  const features = ['energy', 'danceability', 'valence'];
  let similarityScore = 0;
  
  features.forEach(feature => {
    const diff = Math.abs((song1Features[feature] || 0) - (song2Features[feature] || 0));
    similarityScore += (1 - diff);
  });
  
  return similarityScore / features.length;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Genres endpoint
app.get('/api/genres', (req, res) => {
  res.json(Object.keys(GENRES).map(genre => ({
    name: genre,
    ...GENRES[genre],
  })));
});

// Main recommendations endpoint
app.post('/api/recommendations', (req, res) => {
  const { mood, genre, activity, language } = req.body;
  const userId = getUserId(req);

  if (!mood || typeof mood !== 'string') {
    return res.status(400).json({ 
      message: 'Mood is required and must be a string' 
    });
  }

  console.log(`[${new Date().toISOString()}] Recommendation request:`, { userId, mood, genre, activity, language });

  try {
    // Ensure user profile exists
    const user = UserDB.createUser(userId);
    const history = HistoryDB.getHistory(userId);
    const favorites = FavoritesDB.getFavorites(userId);
    
    // Get behavioral learning boost
    const learningBoost = BehaviorLearning.generatePersonalizationBoost(
      { history, favorites },
      { mood, genre, activity }
    );
    
    // Get base recommendations
    const recommendations = getRecommendations(mood, genre, activity, language || 'en');
    
    // Apply behavioral learning scoring to songs
    const scoredSongs = recommendations.songs.map(song => {
      const score = BehaviorLearning.calculateRecommendationScore(song, { history, favorites }, favorites);
      return {
        ...song,
        personalizedScore: score,
        boosts: learningBoost,
      };
    });
    
    // Sort by personalized score
    const rankedSongs = scoredSongs.sort((a, b) => b.personalizedScore - a.personalizedScore);
    
    const enhancedRecommendations = {
      ...recommendations,
      songs: rankedSongs,
      personalizationLevel: (learningBoost.moodSimilarity + learningBoost.genreSimilarity + learningBoost.activityBoost) / 3,
    };
    
    // Record recommendation in history
    HistoryDB.addToHistory(userId, {
      mood,
      genre,
      activity,
      songs: enhancedRecommendations.songs,
    });
    
    // Update user stats
    UserDB.updateStats(userId, {
      totalRecommendations: (user.stats.totalRecommendations || 0) + 1,
    });
    
    res.json(enhancedRecommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ 
      message: 'Error generating recommendations',
      error: error.message,
    });
  }
});

// Get similar songs endpoint
app.post('/api/similar-songs', (req, res) => {
  const { title, artist } = req.body;

  if (!title || !artist) {
    return res.status(400).json({ 
      message: 'Title and artist are required' 
    });
  }

  try {
    const allSongs = Object.values(EXTENDED_SONG_DATABASE).flat();
    const targetSong = allSongs.find(s => s.title === title && s.artist === artist);
    
    if (!targetSong) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Find similar songs based on audio features
    const similarSongs = allSongs
      .filter(s => !(s.title === title && s.artist === artist))
      .map(song => ({
        ...song,
        similarity: calculateSimilarity(targetSong.audioFeatures, song.audioFeatures),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    res.json({
      original: targetSong,
      similarSongs: similarSongs,
    });
  } catch (error) {
    console.error('Error finding similar songs:', error);
    res.status(500).json({ error: error.message });
  }
});

// User profile endpoints
app.post('/api/user/create', (req, res) => {
  const userId = getUserId(req);
  const preferences = req.body.preferences || {};

  try {
    const user = UserDB.createUser(userId, preferences);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/profile', (req, res) => {
  const userId = getUserId(req);
  const user = UserDB.getUser(userId) || UserDB.createUser(userId);
  res.json(user);
});

app.put('/api/user/preferences', (req, res) => {
  const userId = getUserId(req);
  const preferences = req.body;

  try {
    const user = UserDB.updatePreferences(userId, preferences);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Favorites endpoints
app.post('/api/favorites/add', (req, res) => {
  const userId = getUserId(req);
  const song = req.body.song;

  if (!song || !song.title || !song.artist) {
    return res.status(400).json({ message: 'Song title and artist required' });
  }

  try {
    FavoritesDB.addFavorite(userId, song);
    const user = UserDB.getUser(userId);
    UserDB.updateStats(userId, {
      totalSongsLiked: (user.stats.totalSongsLiked || 0) + 1,
    });
    res.json({ success: true, message: 'Song added to favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/favorites/remove', (req, res) => {
  const userId = getUserId(req);
  const { title, artist } = req.body;

  if (!title || !artist) {
    return res.status(400).json({ message: 'Song title and artist required' });
  }

  try {
    FavoritesDB.removeFavorite(userId, title, artist);
    res.json({ success: true, message: 'Song removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/favorites', (req, res) => {
  const userId = getUserId(req);

  try {
    const favorites = FavoritesDB.getFavorites(userId);
    res.json({ favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// History endpoints
app.get('/api/history', (req, res) => {
  const userId = getUserId(req);
  const limit = req.query.limit || 50;

  try {
    const history = HistoryDB.getHistoryWithLimit(userId, parseInt(limit));
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics endpoint
app.get('/api/analytics', (req, res) => {
  const userId = getUserId(req);

  try {
    const user = UserDB.getUser(userId);
    const history = HistoryDB.getHistory(userId);
    const favorites = FavoritesDB.getFavorites(userId);
    
    // Calculate analytics
    const moodCounts = {};
    const genreCounts = {};
    
    history.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      if (entry.genre) {
        genreCounts[entry.genre] = (genreCounts[entry.genre] || 0) + 1;
      }
    });

    res.json({
      stats: user?.stats || {},
      moodDistribution: moodCounts,
      genrePreferences: genreCounts,
      favoriteCount: favorites.length,
      historyCount: history.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Endpoint not found',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`\n🎵 Music Recommender Backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Docs:\n  POST /api/recommendations - Get music recommendations\n  GET /api/genres - Get available genres\n`);
});
