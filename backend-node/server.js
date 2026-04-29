import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { UserDB, HistoryDB, FavoritesDB } from './database.js';
import { EXTENDED_SONG_DATABASE } from './songs.js';
import { BehaviorLearning } from './behavior-learning.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIST_DIR = path.resolve(__dirname, '../frontend/dist');
const USER_ID_COOKIE = 'music_recommender_user_id';
const USER_ID_PATTERN = /^[a-zA-Z0-9_-]{8,80}$/;
const LANGUAGE_CODES = new Set(['en', 'es', 'fr', 'de', 'ja', 'hi']);
const APP_ORIGINS = (process.env.APP_ORIGIN || (IS_PRODUCTION ? '' : 'http://localhost:5173,http://127.0.0.1:5173'))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set('trust proxy', 1);

app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin && !APP_ORIGINS.includes(origin)) {
    return res.status(403).json({ message: 'Origin is not allowed' });
  }
  return next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || APP_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '20kb' }));

function logError(message, error) {
  console.error(message, {
    message: error?.message,
    stack: IS_PRODUCTION ? undefined : error?.stack,
  });
}

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [rawKey, ...rawValue] = cookie.trim().split('=');
    if (!rawKey) return cookies;
    cookies[rawKey] = decodeURIComponent(rawValue.join('=') || '');
    return cookies;
  }, {});
}

function isValidUserId(userId) {
  return typeof userId === 'string' && USER_ID_PATTERN.test(userId);
}

function attachUserId(req, res, next) {
  const suppliedUserId = req.get('x-user-id') || req.query.userId;
  if (suppliedUserId && !isValidUserId(suppliedUserId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  const cookies = parseCookies(req.get('cookie'));
  let userId = suppliedUserId || cookies[USER_ID_COOKIE];

  if (!isValidUserId(userId)) {
    userId = `anon-${randomUUID()}`;
    res.cookie(USER_ID_COOKIE, userId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: IS_PRODUCTION,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
  }

  req.userId = userId;
  return next();
}

function createRateLimiter({ windowMs, max }) {
  const hits = new Map();

  return (req, res, next) => {
    const key = `${req.ip}:${req.userId || 'anonymous'}`;
    const now = Date.now();
    const current = hits.get(key);

    if (!current || current.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > max) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ message: 'Too many requests. Please try again shortly.' });
    }

    return next();
  };
}

const recommendationLimiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const analyticsLimiter = createRateLimiter({ windowMs: 60_000, max: 120 });
const similarSongsLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });
const mutationLimiter = createRateLimiter({ windowMs: 60_000, max: 40 });

function cleanString(value, maxLength) {
  if (value == null) return '';
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/\s+/g, ' ').trim();
  if (cleaned.length > maxLength) return null;
  return cleaned;
}

function validateRecommendationPayload(body) {
  const mood = cleanString(body?.mood, 40);
  const genre = cleanString(body?.genre, 60);
  const activity = cleanString(body?.activity, 60);
  const language = body?.language == null || body?.language === ''
    ? 'en'
    : cleanString(body?.language, 8);

  if (!mood) {
    return { error: 'Mood is required and must be 40 characters or fewer' };
  }
  if (genre === null) {
    return { error: 'Genre must be 60 characters or fewer' };
  }
  if (activity === null) {
    return { error: 'Activity must be 60 characters or fewer' };
  }
  if (!language || !LANGUAGE_CODES.has(language)) {
    return { error: 'Unsupported language' };
  }

  return {
    value: {
      mood,
      genre,
      activity,
      language,
    },
  };
}

function validateSongIdentity(body) {
  const title = cleanString(body?.title, 120);
  const artist = cleanString(body?.artist, 120);
  if (!title || !artist) {
    return { error: 'Song title and artist are required' };
  }
  return { value: { title, artist } };
}

function validateSongPayload(song) {
  const identity = validateSongIdentity(song);
  if (identity.error) return identity;

  const genre = cleanString(song?.genre, 60);
  const reason = cleanString(song?.reason, 300);
  if (genre === null || reason === null) {
    return { error: 'Song fields are too long' };
  }

  return {
    value: {
      ...song,
      title: identity.value.title,
      artist: identity.value.artist,
      genre: genre || '',
      reason: reason || '',
    },
  };
}

function validatePreferences(preferences) {
  if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) {
    return { error: 'Preferences must be an object' };
  }

  const allowedKeys = ['favoriteGenres', 'favoriteArtists', 'favoriteMoods', 'favoriteDecades', 'streamingServices'];
  const sanitized = {};
  for (const key of allowedKeys) {
    if (preferences[key] == null) continue;
    if (!Array.isArray(preferences[key]) || preferences[key].length > 50) {
      return { error: `${key} must be an array with 50 items or fewer` };
    }
    sanitized[key] = preferences[key]
      .map((item) => cleanString(item, 80))
      .filter(Boolean);
  }
  return { value: sanitized };
}

function sendServerError(res, publicMessage, error) {
  logError(publicMessage, error);
  return res.status(500).json({
    message: publicMessage,
    error: IS_PRODUCTION ? undefined : error?.message,
  });
}

app.use('/api', attachUserId);

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
  
  // STRICT language filtering - only return songs in the selected language
  let languageFiltered = songs.filter(song => {
    // Check if song has language field that matches
    if (song.language === language) {
      return true;
    }
    // Fallback: if no language field, assume based on genre for known mappings
    const genreLanguageMap = {
      'Bollywood': 'hi',
      'Latino': 'es',
      'French': 'fr',
      'German': 'de',
      'J-Pop': 'ja',
    };
    
    // If song doesn't have language field but has genre, match by genre
    if (!song.language && genreLanguageMap[song.genre] === language) {
      return true;
    }
    
    // For English, include songs without explicit language field (except known language-specific genres)
    if (language === 'en' && !song.language && !Object.values(genreLanguageMap).includes(song.genre)) {
      return true;
    }
    
    return false;
  });
  
  // Filter by genre if provided (only on already filtered songs)
  let filtered = languageFiltered;
  if (genre && genre.trim()) {
    const lowerGenre = genre.toLowerCase();
    filtered = languageFiltered.filter(song => 
      song.genre.toLowerCase().includes(lowerGenre) || lowerGenre.includes(song.genre.toLowerCase())
    );
  }
  
  // If filtering removed all songs, at least return language-filtered songs
  if (filtered.length === 0) {
    filtered = languageFiltered;
  }

  if (filtered.length < 5) {
    const seen = new Set(filtered.map(song => `${song.title}-${song.artist}`));
    const fallbackPool = [
      ...languageFiltered,
      ...songs,
      ...Object.values(EXTENDED_SONG_DATABASE).flat().filter(song => song.language === language),
      ...Object.values(EXTENDED_SONG_DATABASE).flat().filter(song => song.language === 'en'),
    ];

    for (const song of fallbackPool) {
      const key = `${song.title}-${song.artist}`;
      if (!seen.has(key)) {
        filtered.push(song);
        seen.add(key);
      }
      if (filtered.length >= 5) break;
    }
  }
  
  // Shuffle and select top 5
  const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 5);
  
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
app.get('/api/genres', analyticsLimiter, (req, res) => {
  res.json(Object.keys(GENRES).map(genre => ({
    name: genre,
    ...GENRES[genre],
  })));
});

// Main recommendations endpoint
app.post('/api/recommendations', recommendationLimiter, (req, res) => {
  const validation = validateRecommendationPayload(req.body);
  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  const { mood, genre, activity, language } = validation.value;
  const userId = req.userId;

  try {
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
      language,
      summary: enhancedRecommendations.summary,
      songs: enhancedRecommendations.songs,
    });
    
    // Update user stats
    UserDB.updateStats(userId, {
      totalRecommendations: (user.stats.totalRecommendations || 0) + 1,
    });
    
    res.json(enhancedRecommendations);
  } catch (error) {
    return sendServerError(res, 'Error generating recommendations', error);
  }
});

// Get similar songs endpoint
app.post('/api/similar-songs', similarSongsLimiter, (req, res) => {
  const validation = validateSongIdentity(req.body);
  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  const { title, artist } = validation.value;

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
    return sendServerError(res, 'Error finding similar songs', error);
  }
});

// User profile endpoints
app.post('/api/user/create', mutationLimiter, (req, res) => {
  const userId = req.userId;
  const validation = validatePreferences(req.body.preferences || {});
  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  try {
    const user = UserDB.createUser(userId, validation.value);
    res.json(user);
  } catch (error) {
    return sendServerError(res, 'Error creating user profile', error);
  }
});

app.get('/api/user/profile', analyticsLimiter, (req, res) => {
  const userId = req.userId;
  const user = UserDB.getUser(userId) || UserDB.createUser(userId);
  res.json(user);
});

app.put('/api/user/preferences', mutationLimiter, (req, res) => {
  const userId = req.userId;
  const validation = validatePreferences(req.body);
  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  try {
    const user = UserDB.updatePreferences(userId, validation.value);
    res.json(user);
  } catch (error) {
    return sendServerError(res, 'Error updating preferences', error);
  }
});

// Favorites endpoints
app.post('/api/favorites/add', mutationLimiter, (req, res) => {
  const userId = req.userId;
  const validation = validateSongPayload(req.body.song);
  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  try {
    const inserted = FavoritesDB.addFavorite(userId, validation.value);
    if (inserted) {
      const user = UserDB.getUser(userId) || UserDB.createUser(userId);
      UserDB.updateStats(userId, {
        totalSongsLiked: (user.stats.totalSongsLiked || 0) + 1,
      });
    }
    res.json({ success: true, message: 'Song added to favorites' });
  } catch (error) {
    return sendServerError(res, 'Error adding favorite', error);
  }
});

app.delete('/api/favorites/remove', mutationLimiter, (req, res) => {
  const userId = req.userId;
  const validation = validateSongIdentity(req.body);
  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  try {
    FavoritesDB.removeFavorite(userId, validation.value.title, validation.value.artist);
    res.json({ success: true, message: 'Song removed from favorites' });
  } catch (error) {
    return sendServerError(res, 'Error removing favorite', error);
  }
});

app.get('/api/favorites', analyticsLimiter, (req, res) => {
  const userId = req.userId;

  try {
    const favorites = FavoritesDB.getFavorites(userId);
    res.json({ favorites });
  } catch (error) {
    return sendServerError(res, 'Error loading favorites', error);
  }
});

// History endpoints
app.get('/api/history', analyticsLimiter, (req, res) => {
  const userId = req.userId;
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 100);

  try {
    const history = HistoryDB.getHistoryWithLimit(userId, limit);
    res.json({ history });
  } catch (error) {
    return sendServerError(res, 'Error loading history', error);
  }
});

// Analytics endpoint
app.get('/api/analytics', analyticsLimiter, (req, res) => {
  const userId = req.userId;

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
    return sendServerError(res, 'Error loading analytics', error);
  }
});

if (fs.existsSync(path.join(FRONTEND_DIST_DIR, 'index.html'))) {
  app.use(express.static(FRONTEND_DIST_DIR, {
    index: false,
    maxAge: IS_PRODUCTION ? '1y' : 0,
  }));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    return res.sendFile(path.join(FRONTEND_DIST_DIR, 'index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Endpoint not found',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  logError('Unhandled server error', err);
  res.status(500).json({
    message: 'Internal server error',
    error: IS_PRODUCTION ? undefined : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`\nMusic Recommender service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  if (fs.existsSync(path.join(FRONTEND_DIST_DIR, 'index.html'))) {
    console.log(`Serving frontend from ${FRONTEND_DIST_DIR}`);
  }
});
