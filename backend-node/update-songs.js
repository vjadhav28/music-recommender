import fs from 'fs';
import { EXTENDED_SONG_DATABASE } from './songs.js';

// Update all songs with language metadata
const LANGUAGE_MAP = {
  'Bura Na Mano Holi Hai': 'hi',
  'Ek Ajnabee Haseena Se': 'hi',
  'Chaleya Jhumka': 'hi',
  'Tum Hi Ho': 'hi',
};

for (const mood in EXTENDED_SONG_DATABASE) {
  EXTENDED_SONG_DATABASE[mood].forEach(song => {
    if (!song.language) {
      song.language = LANGUAGE_MAP[song.title] || 'en';
    }
  });
}

// Save back to file
fs.writeFileSync(
  './songs.js',
  `// Extended song database with streaming URLs\nexport const EXTENDED_SONG_DATABASE = ${JSON.stringify(EXTENDED_SONG_DATABASE, null, 2)};`
);

console.log('Songs database updated with language metadata');
