import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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
  const songs = SONG_DATABASE[lowerMood] || SONG_DATABASE['happy'];
  
  // Filter by genre if provided
  let filtered = songs;
  if (genre && genre.trim()) {
    const lowerGenre = genre.toLowerCase();
    filtered = songs.filter(song => 
      song.genre.toLowerCase().includes(lowerGenre) || lowerGenre.includes(song.genre.toLowerCase())
    );
    
    // If no genre match, use original songs but note it in the response
    if (filtered.length === 0) {
      filtered = songs;
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
      reason: reasonTemplates[idx % reasonTemplates.length],
    })),
  };
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

  if (!mood || typeof mood !== 'string') {
    return res.status(400).json({ 
      message: 'Mood is required and must be a string' 
    });
  }

  console.log(`[${new Date().toISOString()}] Recommendation request:`, { mood, genre, activity, language });

  try {
    const recommendations = getRecommendations(mood, genre, activity, language || 'en');
    res.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ 
      message: 'Error generating recommendations',
      error: error.message,
    });
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
