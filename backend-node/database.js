import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_FILES = {
  users: path.join(DB_DIR, 'users.json'),
  listeningHistory: path.join(DB_DIR, 'listening-history.json'),
  favorites: path.join(DB_DIR, 'favorites.json'),
  songAudioFeatures: path.join(DB_DIR, 'song-features.json'),
};

// Initialize database files if they don't exist
function initializeDB() {
  if (!fs.existsSync(DB_FILES.users)) {
    fs.writeFileSync(DB_FILES.users, JSON.stringify({}, null, 2));
  }
  if (!fs.existsSync(DB_FILES.listeningHistory)) {
    fs.writeFileSync(DB_FILES.listeningHistory, JSON.stringify({}, null, 2));
  }
  if (!fs.existsSync(DB_FILES.favorites)) {
    fs.writeFileSync(DB_FILES.favorites, JSON.stringify({}, null, 2));
  }
  if (!fs.existsSync(DB_FILES.songAudioFeatures)) {
    fs.writeFileSync(DB_FILES.songAudioFeatures, JSON.stringify({}, null, 2));
  }
}

// Read database file
function readDB(filename) {
  try {
    const data = fs.readFileSync(filename, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    return {};
  }
}

// Write database file
function writeDB(filename, data) {
  try {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error.message);
    return false;
  }
}

// User Profile Management
export const UserDB = {
  createUser(userId, preferences = {}) {
    const users = readDB(DB_FILES.users);
    if (users[userId]) {
      return users[userId];
    }
    
    const user = {
      id: userId,
      createdAt: new Date().toISOString(),
      preferences: {
        favoriteGenres: [],
        favoriteArtists: [],
        favoriteMoods: [],
        favoriteDecades: [],
        streamingServices: [],
        ...preferences,
      },
      stats: {
        totalRecommendations: 0,
        totalSongsLiked: 0,
        totalPlaylists: 0,
      },
    };
    
    users[userId] = user;
    writeDB(DB_FILES.users, users);
    return user;
  },

  getUser(userId) {
    const users = readDB(DB_FILES.users);
    return users[userId] || null;
  },

  updatePreferences(userId, preferences) {
    const users = readDB(DB_FILES.users);
    if (!users[userId]) {
      return this.createUser(userId, preferences);
    }
    
    users[userId].preferences = {
      ...users[userId].preferences,
      ...preferences,
    };
    
    writeDB(DB_FILES.users, users);
    return users[userId];
  },

  updateStats(userId, statUpdates) {
    const users = readDB(DB_FILES.users);
    if (!users[userId]) {
      this.createUser(userId);
    }
    
    users[userId].stats = {
      ...users[userId].stats,
      ...statUpdates,
    };
    
    writeDB(DB_FILES.users, users);
    return users[userId];
  },
};

// Listening History
export const HistoryDB = {
  addToHistory(userId, recommendation) {
    const history = readDB(DB_FILES.listeningHistory);
    
    if (!history[userId]) {
      history[userId] = [];
    }
    
    history[userId].push({
      ...recommendation,
      timestamp: new Date().toISOString(),
    });
    
    writeDB(DB_FILES.listeningHistory, history);
  },

  getHistory(userId) {
    const history = readDB(DB_FILES.listeningHistory);
    return history[userId] || [];
  },

  getHistoryWithLimit(userId, limit = 50) {
    const history = this.getHistory(userId);
    return history.slice(-limit).reverse();
  },
};

// Favorites & Likes
export const FavoritesDB = {
  addFavorite(userId, song) {
    const favorites = readDB(DB_FILES.favorites);
    
    if (!favorites[userId]) {
      favorites[userId] = [];
    }
    
    const songKey = `${song.title}-${song.artist}`;
    const exists = favorites[userId].some(s => `${s.title}-${s.artist}` === songKey);
    
    if (!exists) {
      favorites[userId].push({
        ...song,
        likedAt: new Date().toISOString(),
      });
    }
    
    writeDB(DB_FILES.favorites, favorites);
  },

  removeFavorite(userId, songTitle, songArtist) {
    const favorites = readDB(DB_FILES.favorites);
    
    if (!favorites[userId]) {
      return;
    }
    
    favorites[userId] = favorites[userId].filter(
      s => !(s.title === songTitle && s.artist === songArtist)
    );
    
    writeDB(DB_FILES.favorites, favorites);
  },

  getFavorites(userId) {
    const favorites = readDB(DB_FILES.favorites);
    return favorites[userId] || [];
  },

  isFavorite(userId, songTitle, songArtist) {
    const favorites = this.getFavorites(userId);
    return favorites.some(s => s.title === songTitle && s.artist === songArtist);
  },
};

// Song Audio Features for similarity matching
export const SongFeaturesDB = {
  setSongFeatures(song, features) {
    const songKey = `${song.title}-${song.artist}`;
    const db = readDB(DB_FILES.songAudioFeatures);
    
    db[songKey] = {
      ...song,
      ...features,
      updatedAt: new Date().toISOString(),
    };
    
    writeDB(DB_FILES.songAudioFeatures, db);
  },

  getSongFeatures(songTitle, songArtist) {
    const songKey = `${songTitle}-${songArtist}`;
    const db = readDB(DB_FILES.songAudioFeatures);
    return db[songKey] || null;
  },

  getAllFeatures() {
    return readDB(DB_FILES.songAudioFeatures);
  },
};

// Initialize database on module load
initializeDB();
