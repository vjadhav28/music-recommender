// Curated client-side fallback used only when the backend API is unreachable
// (e.g. preview deployments without the Java service running). Always returns
// at least 5 unique tracks tailored to the user's mood/genre/activity/language.

const CATALOG = {
  happy: [
    { title: 'Good as Hell', artist: 'Lizzo', genre: 'Pop', reason: 'Confident, high-energy vocals that amplify a happy mood.' },
    { title: 'Shut Up and Dance', artist: 'WALK THE MOON', genre: 'Pop Rock', reason: 'Bright rhythm and singalong hooks keep the vibe upbeat.' },
    { title: 'Happy', artist: 'Pharrell Williams', genre: 'Pop', reason: 'A classic feel-good groove that matches positive energy.' },
    { title: "Can't Stop the Feeling!", artist: 'Justin Timberlake', genre: 'Pop', reason: 'Dance-forward production suited for joyful moments.' },
    { title: 'Walking on Sunshine', artist: 'Katrina & The Waves', genre: 'Pop Rock', reason: 'Classic uplifting anthem with sunny momentum.' },
    { title: 'September', artist: 'Earth, Wind & Fire', genre: 'Funk', reason: 'Timeless feel-good groove that lifts any room.' },
  ],
  sad: [
    { title: 'Someone Like You', artist: 'Adele', genre: 'Soul Pop', reason: 'Emotionally resonant ballad for a reflective mood.' },
    { title: 'Skinny Love', artist: 'Bon Iver', genre: 'Indie Folk', reason: 'Intimate acoustic texture supports quiet introspection.' },
    { title: 'Fix You', artist: 'Coldplay', genre: 'Alternative Rock', reason: 'Gentle build and hopeful tone offer comfort.' },
    { title: 'Liability', artist: 'Lorde', genre: 'Alternative Pop', reason: 'Minimal arrangement and honest lyricism fit low-energy moments.' },
    { title: 'The Night We Met', artist: 'Lord Huron', genre: 'Indie Folk', reason: 'Melancholic atmosphere for deeply reflective listening.' },
    { title: 'Motion Picture Soundtrack', artist: 'Radiohead', genre: 'Art Rock', reason: 'Sparse, cinematic ache for slow evenings.' },
  ],
  energetic: [
    { title: 'Titanium', artist: 'David Guetta ft. Sia', genre: 'EDM', reason: 'Powerful drops and vocals sustain high energy.' },
    { title: 'Eye of the Tiger', artist: 'Survivor', genre: 'Rock', reason: 'Driving rhythm helps maintain momentum.' },
    { title: 'Stronger', artist: 'Kanye West', genre: 'Hip-Hop', reason: 'Punchy production ideal for high-intensity sessions.' },
    { title: 'Levels', artist: 'Avicii', genre: 'EDM', reason: 'Festival-style progression that boosts motivation.' },
    { title: "Don't Stop Me Now", artist: 'Queen', genre: 'Rock', reason: 'Fast tempo and dynamic vocals fuel energetic activity.' },
    { title: 'POWER', artist: 'Kanye West', genre: 'Hip-Hop', reason: 'Anthemic percussion and chant-like hook.' },
  ],
  relaxed: [
    { title: 'Sunset Lover', artist: 'Petit Biscuit', genre: 'Chill Electronic', reason: 'Soft textures and gentle rhythm support relaxation.' },
    { title: 'Better Together', artist: 'Jack Johnson', genre: 'Acoustic', reason: 'Warm acoustic tones create a calm listening space.' },
    { title: 'Holocene', artist: 'Bon Iver', genre: 'Indie Folk', reason: 'Atmospheric soundscape suitable for winding down.' },
    { title: 'Breathe', artist: 'Télépopmusik', genre: 'Downtempo', reason: 'Smooth groove promotes an unhurried mood.' },
    { title: 'Dreams', artist: 'Fleetwood Mac', genre: 'Soft Rock', reason: 'Laid-back rhythm and melodic flow feel effortless.' },
    { title: 'Sunday Morning', artist: 'Maroon 5', genre: 'Pop', reason: 'Easy chord progression for slow mornings.' },
  ],
  focused: [
    { title: 'Time', artist: 'Hans Zimmer', genre: 'Instrumental', reason: 'Minimalist progression helps sustain concentration.' },
    { title: 'Experience', artist: 'Ludovico Einaudi', genre: 'Classical', reason: 'Repetitive piano motifs support deep work.' },
    { title: 'Weightless', artist: 'Marconi Union', genre: 'Ambient', reason: 'Low-arousal ambient design aids focus.' },
    { title: 'Intro', artist: 'The xx', genre: 'Indie', reason: 'Steady pulse and sparse arrangement reduce distraction.' },
    { title: 'A Walk', artist: 'Tycho', genre: 'Downtempo', reason: 'Consistent electronic texture is great for flow-state work.' },
    { title: 'Avril 14th', artist: 'Aphex Twin', genre: 'Ambient', reason: 'Solo piano study that fades into the background.' },
  ],
  romantic: [
    { title: 'All of Me', artist: 'John Legend', genre: 'R&B', reason: 'Warm vocals and tender lyrics suit romantic settings.' },
    { title: 'Earned It', artist: 'The Weeknd', genre: 'R&B', reason: 'Slow, atmospheric groove supports intimate mood.' },
    { title: 'Perfect', artist: 'Ed Sheeran', genre: 'Pop', reason: 'Soft arrangement and affectionate tone fit romantic moments.' },
    { title: 'At Last', artist: 'Etta James', genre: 'Soul', reason: 'Classic soulful phrasing reinforces romantic ambience.' },
    { title: 'Adore You', artist: 'Harry Styles', genre: 'Pop', reason: 'Easy-going melody with affectionate lyrical framing.' },
    { title: 'Lover', artist: 'Taylor Swift', genre: 'Pop', reason: 'Soft waltz tempo perfect for slow dancing.' },
  ],
  nostalgic: [
    { title: 'Viva La Vida', artist: 'Coldplay', genre: 'Alternative Rock', reason: 'Familiar anthem evokes reflective nostalgia.' },
    { title: 'Mr. Brightside', artist: 'The Killers', genre: 'Indie Rock', reason: 'Iconic 2000s track with lasting emotional recall.' },
    { title: 'Take On Me', artist: 'a-ha', genre: 'Synth-Pop', reason: 'Retro melody instantly triggers nostalgic memory.' },
    { title: 'Wonderwall', artist: 'Oasis', genre: 'Britpop', reason: 'Acoustic-driven classic tied to shared musical memory.' },
    { title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock', reason: 'Timeless arrangement often associated with nostalgia.' },
    { title: 'Africa', artist: 'Toto', genre: 'Soft Rock', reason: 'Universally beloved 80s singalong.' },
  ],
  angry: [
    { title: 'Killing In The Name', artist: 'Rage Against The Machine', genre: 'Rock', reason: 'Raw intensity channels frustration into motion.' },
    { title: 'Duality', artist: 'Slipknot', genre: 'Metal', reason: 'Heavy percussion provides a cathartic outlet.' },
    { title: 'Numb', artist: 'Linkin Park', genre: 'Rock', reason: 'High emotional intensity for release and reset.' },
    { title: 'Bulls on Parade', artist: 'Rage Against The Machine', genre: 'Rock', reason: 'Aggressive groove matches confrontational energy.' },
    { title: 'DNA.', artist: 'Kendrick Lamar', genre: 'Hip-Hop', reason: 'Explosive cadence and rhythm support venting energy.' },
    { title: 'Bodies', artist: 'Drowning Pool', genre: 'Metal', reason: 'Pure adrenaline release.' },
  ],
};

const LANGUAGE_CATALOG = {
  spanish: [
    { title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', genre: 'Reggaeton', reason: 'Smooth Latin rhythm with universal appeal.' },
    { title: 'Bailando', artist: 'Enrique Iglesias', genre: 'Latin Pop', reason: 'Infectious flamenco-pop hybrid.' },
    { title: 'Tusa', artist: 'Karol G & Nicki Minaj', genre: 'Reggaeton', reason: 'Modern reggaeton with a confident hook.' },
    { title: 'Vivir Mi Vida', artist: 'Marc Anthony', genre: 'Salsa', reason: 'Uplifting salsa anthem about living fully.' },
    { title: 'La Bicicleta', artist: 'Carlos Vives & Shakira', genre: 'Cumbia Pop', reason: 'Sunny coastal Colombian energy.' },
  ],
  hindi: [
    { title: 'Tum Hi Ho', artist: 'Arijit Singh', genre: 'Bollywood', reason: 'Soulful ballad with lasting emotional pull.' },
    { title: 'Kal Ho Naa Ho', artist: 'Sonu Nigam', genre: 'Bollywood', reason: 'Iconic, heartfelt, instantly recognizable.' },
    { title: 'Kesariya', artist: 'Arijit Singh', genre: 'Bollywood', reason: 'Modern romantic anthem with rich orchestration.' },
    { title: 'Channa Mereya', artist: 'Arijit Singh', genre: 'Bollywood', reason: 'Aching vocal performance for reflective moods.' },
    { title: 'Senorita', artist: 'Farhan Akhtar, Hrithik Roshan, Abhay Deol', genre: 'Bollywood', reason: 'Joyful flamenco-tinged road-trip vibe.' },
  ],
  french: [
    { title: 'La Vie en Rose', artist: 'Édith Piaf', genre: 'Chanson', reason: 'The definitive French romantic standard.' },
    { title: 'Dernière Danse', artist: 'Indila', genre: 'French Pop', reason: 'Emotive vocal over cinematic strings.' },
    { title: 'Tous les mêmes', artist: 'Stromae', genre: 'Electropop', reason: 'Sharp lyricism with a danceable groove.' },
    { title: 'Je ne sais pas', artist: 'Joyce Jonathan', genre: 'French Pop', reason: 'Gentle acoustic tenderness.' },
    { title: 'Comme des enfants', artist: 'Cœur de Pirate', genre: 'Indie Folk', reason: 'Whimsical piano-pop introspection.' },
  ],
  korean: [
    { title: 'Dynamite', artist: 'BTS', genre: 'K-Pop', reason: 'Bright disco-pop made for repeat listens.' },
    { title: 'How You Like That', artist: 'BLACKPINK', genre: 'K-Pop', reason: 'High-impact production with iconic drops.' },
    { title: 'Spring Day', artist: 'BTS', genre: 'K-Pop', reason: 'Wistful, cinematic ballad.' },
    { title: 'Eight', artist: 'IU & Suga', genre: 'K-Indie', reason: 'Dreamy mid-tempo nostalgia.' },
    { title: 'Next Level', artist: 'aespa', genre: 'K-Pop', reason: 'Hyper-modern, genre-bending energy.' },
  ],
  japanese: [
    { title: 'Pretender', artist: 'Official HIGE DANdism', genre: 'J-Pop', reason: 'Sweeping J-pop with vocal acrobatics.' },
    { title: 'Lemon', artist: 'Kenshi Yonezu', genre: 'J-Pop', reason: 'Hauntingly beautiful modern classic.' },
    { title: 'Gurenge', artist: 'LiSA', genre: 'J-Rock', reason: 'High-octane anime opener with wide appeal.' },
    { title: 'Plastic Love', artist: 'Mariya Takeuchi', genre: 'City Pop', reason: 'Iconic 80s city pop revival.' },
    { title: 'Kaikai Kitan', artist: 'Eve', genre: 'J-Rock', reason: 'Frenetic alt-rock energy.' },
  ],
  portuguese: [
    { title: 'Garota de Ipanema', artist: 'João Gilberto & Stan Getz', genre: 'Bossa Nova', reason: 'The definitive Brazilian standard.' },
    { title: 'Ai Se Eu Te Pego', artist: 'Michel Teló', genre: 'Sertanejo', reason: 'Bouncy global crossover hit.' },
    { title: 'Mais Que Nada', artist: 'Sérgio Mendes', genre: 'Bossa Nova', reason: 'Unmistakable Brazilian groove.' },
    { title: 'Trem-Bala', artist: 'Ana Vilela', genre: 'MPB', reason: 'Tender acoustic reflection on time.' },
    { title: 'Evidências', artist: 'Chitãozinho & Xororó', genre: 'Sertanejo', reason: 'Sing-at-the-top-of-your-lungs classic.' },
  ],
  arabic: [
    { title: 'Habibi', artist: 'Tamer Hosny', genre: 'Arabic Pop', reason: 'Modern Arabic pop with warm production.' },
    { title: 'Nour El Ein', artist: 'Amr Diab', genre: 'Arabic Pop', reason: 'Classic crossover dance-pop.' },
    { title: '3 Daqat', artist: 'Abu ft. Yousra', genre: 'Arabic Pop', reason: 'Upbeat romantic energy.' },
    { title: 'Lamouni', artist: 'Saad Lamjarred', genre: 'Maghrebi Pop', reason: 'Catchy North African pop.' },
    { title: 'Tamally Maak', artist: 'Amr Diab', genre: 'Arabic Pop', reason: 'Beloved romantic standard.' },
  ],
  german: [
    { title: '99 Luftballons', artist: 'Nena', genre: 'New Wave', reason: 'Iconic German-language synth-pop.' },
    { title: 'Auf uns', artist: 'Andreas Bourani', genre: 'Pop', reason: 'Anthemic celebration of togetherness.' },
    { title: 'Atemlos durch die Nacht', artist: 'Helene Fischer', genre: 'Schlager', reason: 'Massive dance-pop singalong.' },
    { title: 'Lass jetzt los', artist: 'Willemijn Verkaik', genre: 'Pop', reason: 'Powerhouse vocal performance.' },
    { title: 'Stadt', artist: 'Cassandra Steen & Adel Tawil', genre: 'Pop', reason: 'Reflective duet with strong hook.' },
  ],
  italian: [
    { title: "L'Italiano", artist: 'Toto Cutugno', genre: 'Italian Pop', reason: 'Quintessential Italian singalong.' },
    { title: 'Volare', artist: 'Domenico Modugno', genre: 'Italian Classic', reason: 'Sweeping romantic standard.' },
    { title: 'Roma', artist: 'Måneskin', genre: 'Rock', reason: 'Modern Italian rock with swagger.' },
    { title: 'Andiamo a comandare', artist: 'Fabio Rovazzi', genre: 'Italian Pop', reason: 'Playful summertime hit.' },
    { title: 'Brividi', artist: 'Mahmood & Blanco', genre: 'Italian Pop', reason: 'Tender modern duet.' },
  ],
};

const GENERIC = [
  { title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Pop', reason: 'High replay value and broad appeal.' },
  { title: 'Levitating', artist: 'Dua Lipa', genre: 'Pop', reason: 'Groove-driven production with energetic bounce.' },
  { title: 'Heat Waves', artist: 'Glass Animals', genre: 'Indie Pop', reason: 'Melodic, modern track that works across contexts.' },
  { title: 'Lose Yourself', artist: 'Eminem', genre: 'Hip-Hop', reason: 'Motivational pacing for activity-oriented listening.' },
  { title: 'As It Was', artist: 'Harry Styles', genre: 'Pop', reason: 'Balanced mood and accessible melodic structure.' },
  { title: 'Stay With Me', artist: 'Sam Smith', genre: 'Soul Pop', reason: 'Crossover ballad with emotional pull.' },
];

function normalizeMoodKey(mood) {
  const m = (mood || '').toLowerCase().trim();
  if (!m) return 'focused';
  if (/(focus|study|work|deep)/.test(m)) return 'focused';
  if (/(calm|chill|relax|mellow)/.test(m)) return 'relaxed';
  if (/(energy|hype|pump|workout)/.test(m)) return 'energetic';
  if (/(nostalg|throwback|memory)/.test(m)) return 'nostalgic';
  if (/(romantic|love|date)/.test(m)) return 'romantic';
  if (/(angry|mad|frustrat|rage)/.test(m)) return 'angry';
  if (/(sad|down|blue|melanchol|heartbr)/.test(m)) return 'sad';
  if (/(happy|joy|excited|glad)/.test(m)) return 'happy';
  if (CATALOG[m]) return m;
  return 'focused';
}

function normalizeLanguageKey(language) {
  const l = (language || '').toLowerCase().trim();
  if (!l || l === 'any') return null;
  if (LANGUAGE_CATALOG[l]) return l;
  return null;
}

function dedupeKey(song) {
  return `${song.title}|${song.artist}`.toLowerCase();
}

export function buildFallbackResponse({ mood, genre, activity, language }) {
  const moodKey = normalizeMoodKey(mood);
  const languageKey = normalizeLanguageKey(language);

  const pool = [];
  if (languageKey) {
    pool.push(...LANGUAGE_CATALOG[languageKey]);
  }
  pool.push(...(CATALOG[moodKey] || GENERIC));
  pool.push(...GENERIC);

  // Bias toward the user's preferred genre, if any
  const preferredGenre = (genre || '').toLowerCase().trim();
  if (preferredGenre) {
    pool.sort((a, b) => {
      const aMatch = a.genre.toLowerCase().includes(preferredGenre) ? 1 : 0;
      const bMatch = b.genre.toLowerCase().includes(preferredGenre) ? 1 : 0;
      return bMatch - aMatch;
    });
  }

  const seen = new Set();
  const songs = [];
  for (const song of pool) {
    const key = dedupeKey(song);
    if (seen.has(key)) continue;
    seen.add(key);
    songs.push(song);
    if (songs.length >= 6) break;
  }

  const parts = [
    `Curated picks tailored to your ${(mood || 'current').toLowerCase()} mood`,
  ];
  if (genre) parts.push(`with a lean toward ${genre}`);
  if (activity) parts.push(`for ${activity.toLowerCase()}`);
  if (language && language.toLowerCase() !== 'any') parts.push(`in ${language}`);

  return {
    summary: `${parts.join(' ')}. Served from the offline catalog while the live service warms up.`,
    songs,
    fallback: true,
  };
}
