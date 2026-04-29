import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'music-recommender.sqlite');

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    preferences TEXT NOT NULL,
    stats TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS listening_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    payload TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_history_user_time
    ON listening_history(user_id, timestamp DESC);

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    payload TEXT NOT NULL,
    liked_at TEXT NOT NULL,
    UNIQUE(user_id, title, artist),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_favorites_user
    ON favorites(user_id, liked_at DESC);

  CREATE TABLE IF NOT EXISTS song_features (
    song_key TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

const DEFAULT_PREFERENCES = {
  favoriteGenres: [],
  favoriteArtists: [],
  favoriteMoods: [],
  favoriteDecades: [],
  streamingServices: [],
};

const DEFAULT_STATS = {
  totalRecommendations: 0,
  totalSongsLiked: 0,
  totalPlaylists: 0,
};

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function serializeJson(value) {
  return JSON.stringify(value ?? {});
}

function normalizeUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    preferences: {
      ...DEFAULT_PREFERENCES,
      ...parseJson(row.preferences, {}),
    },
    stats: {
      ...DEFAULT_STATS,
      ...parseJson(row.stats, {}),
    },
  };
}

const getUserStatement = db.prepare('SELECT * FROM users WHERE id = ?');
const insertUserStatement = db.prepare(`
  INSERT INTO users (id, created_at, preferences, stats)
  VALUES (?, ?, ?, ?)
`);
const updatePreferencesStatement = db.prepare(`
  UPDATE users SET preferences = ? WHERE id = ?
`);
const updateStatsStatement = db.prepare(`
  UPDATE users SET stats = ? WHERE id = ?
`);
const insertHistoryStatement = db.prepare(`
  INSERT INTO listening_history (user_id, payload, timestamp)
  VALUES (?, ?, ?)
`);
const getHistoryStatement = db.prepare(`
  SELECT payload, timestamp
  FROM listening_history
  WHERE user_id = ?
  ORDER BY id ASC
`);
const getHistoryWithLimitStatement = db.prepare(`
  SELECT payload, timestamp
  FROM listening_history
  WHERE user_id = ?
  ORDER BY id DESC
  LIMIT ?
`);
const insertFavoriteStatement = db.prepare(`
  INSERT OR IGNORE INTO favorites (user_id, title, artist, payload, liked_at)
  VALUES (?, ?, ?, ?, ?)
`);
const deleteFavoriteStatement = db.prepare(`
  DELETE FROM favorites
  WHERE user_id = ? AND title = ? AND artist = ?
`);
const getFavoritesStatement = db.prepare(`
  SELECT payload, liked_at
  FROM favorites
  WHERE user_id = ?
  ORDER BY liked_at DESC
`);
const getFavoriteStatement = db.prepare(`
  SELECT 1
  FROM favorites
  WHERE user_id = ? AND title = ? AND artist = ?
`);
const upsertSongFeaturesStatement = db.prepare(`
  INSERT INTO song_features (song_key, payload, updated_at)
  VALUES (?, ?, ?)
  ON CONFLICT(song_key) DO UPDATE SET
    payload = excluded.payload,
    updated_at = excluded.updated_at
`);
const getSongFeaturesStatement = db.prepare(`
  SELECT payload
  FROM song_features
  WHERE song_key = ?
`);
const getAllFeaturesStatement = db.prepare('SELECT payload FROM song_features');

export const UserDB = {
  createUser(userId, preferences = {}) {
    const existing = this.getUser(userId);
    if (existing) {
      return existing;
    }

    const user = {
      id: userId,
      createdAt: new Date().toISOString(),
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...preferences,
      },
      stats: {
        ...DEFAULT_STATS,
      },
    };

    insertUserStatement.run(
      user.id,
      user.createdAt,
      serializeJson(user.preferences),
      serializeJson(user.stats)
    );
    return user;
  },

  getUser(userId) {
    return normalizeUser(getUserStatement.get(userId));
  },

  updatePreferences(userId, preferences) {
    const user = this.getUser(userId) || this.createUser(userId);
    const updatedPreferences = {
      ...user.preferences,
      ...preferences,
    };
    updatePreferencesStatement.run(serializeJson(updatedPreferences), userId);
    return {
      ...user,
      preferences: updatedPreferences,
    };
  },

  updateStats(userId, statUpdates) {
    const user = this.getUser(userId) || this.createUser(userId);
    const updatedStats = {
      ...user.stats,
      ...statUpdates,
    };
    updateStatsStatement.run(serializeJson(updatedStats), userId);
    return {
      ...user,
      stats: updatedStats,
    };
  },
};

export const HistoryDB = {
  addToHistory(userId, recommendation) {
    UserDB.createUser(userId);
    const timestamp = new Date().toISOString();
    insertHistoryStatement.run(userId, serializeJson(recommendation), timestamp);
  },

  getHistory(userId) {
    return getHistoryStatement.all(userId).map((row) => ({
      ...parseJson(row.payload, {}),
      timestamp: row.timestamp,
    }));
  },

  getHistoryWithLimit(userId, limit = 50) {
    const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 50, 1), 100);
    return getHistoryWithLimitStatement.all(userId, safeLimit).map((row) => ({
      ...parseJson(row.payload, {}),
      timestamp: row.timestamp,
    }));
  },
};

export const FavoritesDB = {
  addFavorite(userId, song) {
    UserDB.createUser(userId);
    const likedAt = new Date().toISOString();
    const result = insertFavoriteStatement.run(
      userId,
      song.title,
      song.artist,
      serializeJson({ ...song, likedAt }),
      likedAt
    );
    return Boolean(result.changes);
  },

  removeFavorite(userId, songTitle, songArtist) {
    deleteFavoriteStatement.run(userId, songTitle, songArtist);
  },

  getFavorites(userId) {
    return getFavoritesStatement.all(userId).map((row) => ({
      ...parseJson(row.payload, {}),
      likedAt: row.liked_at,
    }));
  },

  isFavorite(userId, songTitle, songArtist) {
    return Boolean(getFavoriteStatement.get(userId, songTitle, songArtist));
  },
};

export const SongFeaturesDB = {
  setSongFeatures(song, features) {
    const songKey = `${song.title}-${song.artist}`;
    const updatedAt = new Date().toISOString();
    upsertSongFeaturesStatement.run(
      songKey,
      serializeJson({ ...song, ...features, updatedAt }),
      updatedAt
    );
  },

  getSongFeatures(songTitle, songArtist) {
    const songKey = `${songTitle}-${songArtist}`;
    const row = getSongFeaturesStatement.get(songKey);
    return row ? parseJson(row.payload, null) : null;
  },

  getAllFeatures() {
    return getAllFeaturesStatement.all().reduce((features, row) => {
      const song = parseJson(row.payload, null);
      if (song?.title && song?.artist) {
        features[`${song.title}-${song.artist}`] = song;
      }
      return features;
    }, {});
  },
};
