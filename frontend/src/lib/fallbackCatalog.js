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

const EXTRA_CATALOG = {
  happy: [
    { title: 'I Wanna Dance with Somebody', artist: 'Whitney Houston', genre: 'Pop', reason: 'Big-chorus energy keeps the mood bright and celebratory.' },
    { title: 'Dancing Queen', artist: 'ABBA', genre: 'Disco Pop', reason: 'Sparkling melodies make upbeat moods feel even lighter.' },
    { title: 'Best Day Of My Life', artist: 'American Authors', genre: 'Indie Pop', reason: 'Stomping percussion and chant hooks feel instantly uplifting.' },
    { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', genre: 'Funk Pop', reason: 'Brassy swagger turns happy energy into a full-room singalong.' },
    { title: 'Good Life', artist: 'OneRepublic', genre: 'Pop Rock', reason: 'Open-road optimism works well for easy, feel-good listening.' },
    { title: 'Valerie', artist: 'Mark Ronson ft. Amy Winehouse', genre: 'Soul Pop', reason: 'Bouncy retro groove adds warmth to cheerful moments.' },
  ],
  sad: [
    { title: 'drivers license', artist: 'Olivia Rodrigo', genre: 'Pop Ballad', reason: 'Detailed heartbreak storytelling suits late-night reflection.' },
    { title: 'All I Want', artist: 'Kodaline', genre: 'Indie Folk', reason: 'Slow build and aching vocals leave room for big feelings.' },
    { title: 'Back to Black', artist: 'Amy Winehouse', genre: 'Soul', reason: 'Smoky delivery gives sadness a sharper edge.' },
    { title: 'Let Her Go', artist: 'Passenger', genre: 'Folk Pop', reason: 'Gentle acoustic pacing fits quiet, reflective listening.' },
    { title: 'When the Party\'s Over', artist: 'Billie Eilish', genre: 'Alt Pop', reason: 'Bare arrangement and fragile vocals make the mood feel intimate.' },
    { title: 'Everybody Hurts', artist: 'R.E.M.', genre: 'Alternative Rock', reason: 'Comforting classic for sitting with heavier emotions.' },
  ],
  energetic: [
    { title: 'Can\'t Hold Us', artist: 'Macklemore & Ryan Lewis ft. Ray Dalton', genre: 'Hip-Hop', reason: 'Rapid-fire momentum keeps the adrenaline high.' },
    { title: 'Till I Collapse', artist: 'Eminem', genre: 'Hip-Hop', reason: 'Relentless cadence is built for pushing harder.' },
    { title: 'Bangarang', artist: 'Skrillex ft. Sirah', genre: 'EDM', reason: 'Hyperactive drops bring instant intensity.' },
    { title: 'Wake Me Up', artist: 'Avicii', genre: 'EDM', reason: 'Big melodic lift fuels long-burst energy.' },
    { title: 'Run Boy Run', artist: 'Woodkid', genre: 'Alternative', reason: 'Marching drums feel cinematic and propulsive.' },
    { title: 'Remember the Name', artist: 'Fort Minor', genre: 'Rap Rock', reason: 'Punchy hook and swagger make it ideal for high-drive moments.' },
  ],
  relaxed: [
    { title: 'Come Away With Me', artist: 'Norah Jones', genre: 'Jazz Pop', reason: 'Soft vocal phrasing settles the room immediately.' },
    { title: 'Banana Pancakes', artist: 'Jack Johnson', genre: 'Acoustic', reason: 'Loose acoustic swing is perfect for slow mornings.' },
    { title: 'Bloom', artist: 'ODESZA', genre: 'Chill Electronic', reason: 'Airy synth layers create a spacious, easy mood.' },
    { title: 'Pink + White', artist: 'Frank Ocean', genre: 'R&B', reason: 'Feathery production makes calm listening feel luxurious.' },
    { title: 'River Flows in You', artist: 'Yiruma', genre: 'Piano', reason: 'Gentle piano movement supports a quieter pace.' },
    { title: 'Opaline', artist: 'Novo Amor', genre: 'Indie Folk', reason: 'Breathy textures keep everything soft and unhurried.' },
  ],
  focused: [
    { title: 'Nuvole Bianche', artist: 'Ludovico Einaudi', genre: 'Classical', reason: 'Steady piano phrasing supports deep concentration.' },
    { title: 'Gymnopedie No. 1', artist: 'Erik Satie', genre: 'Classical', reason: 'Minimal melodic repetition stays present without distracting.' },
    { title: 'Awake', artist: 'Tycho', genre: 'Downtempo', reason: 'Clean rhythms and atmosphere help maintain flow.' },
    { title: 'An Ending (Ascent)', artist: 'Brian Eno', genre: 'Ambient', reason: 'Weightless ambient layers are ideal for low-distraction work.' },
    { title: 'Near Light', artist: 'Olafur Arnalds', genre: 'Neo-Classical', reason: 'Measured build keeps focus steady over longer sessions.' },
    { title: 'Says', artist: 'Nils Frahm', genre: 'Ambient', reason: 'Patient electronic progression supports immersive work blocks.' },
  ],
  romantic: [
    { title: 'Thinking Out Loud', artist: 'Ed Sheeran', genre: 'Pop', reason: 'Warm intimacy and slow groove suit affectionate moments.' },
    { title: 'Best Part', artist: 'Daniel Caesar ft. H.E.R.', genre: 'R&B', reason: 'Tender duet energy keeps the room soft and close.' },
    { title: 'Can\'t Help Falling in Love', artist: 'Elvis Presley', genre: 'Classic Pop', reason: 'Timeless melody adds effortless romance.' },
    { title: 'Until I Found You', artist: 'Stephen Sanchez', genre: 'Pop', reason: 'Retro croon makes the mood feel cinematic and sincere.' },
    { title: 'My Girl', artist: 'The Temptations', genre: 'Soul', reason: 'Bright, classic charm keeps romance light and easy.' },
    { title: 'Moon River', artist: 'Frank Ocean', genre: 'Soul', reason: 'Sparse arrangement creates a hushed late-night closeness.' },
  ],
  nostalgic: [
    { title: 'Everybody Wants to Rule the World', artist: 'Tears for Fears', genre: 'Synth-Pop', reason: 'Instantly familiar groove invites reflective nostalgia.' },
    { title: 'I Want It That Way', artist: 'Backstreet Boys', genre: 'Pop', reason: 'Millennial singalong energy hits the memory center fast.' },
    { title: 'Yellow', artist: 'Coldplay', genre: 'Alternative Rock', reason: 'Warm melodic lift carries a sentimental glow.' },
    { title: 'Dreams', artist: 'The Cranberries', genre: 'Alternative Rock', reason: '90s shimmer feels wistful without getting heavy.' },
    { title: 'No Scrubs', artist: 'TLC', genre: 'R&B', reason: 'Iconic late-90s hook makes the throwback feel playful.' },
    { title: 'Hey Ya!', artist: 'OutKast', genre: 'Pop', reason: 'Big, unmistakable hooks bring nostalgic energy with movement.' },
  ],
  angry: [
    { title: 'Break Stuff', artist: 'Limp Bizkit', genre: 'Nu Metal', reason: 'Volatile delivery helps vent pressure fast.' },
    { title: 'Chop Suey!', artist: 'System of a Down', genre: 'Metal', reason: 'Chaotic stop-start energy channels frustration into motion.' },
    { title: 'Sabotage', artist: 'Beastie Boys', genre: 'Rap Rock', reason: 'Shouted urgency and grit make the emotion feel kinetic.' },
    { title: 'One Step Closer', artist: 'Linkin Park', genre: 'Rock', reason: 'Explosive chorus is built for letting tension out.' },
    { title: 'Psychosocial', artist: 'Slipknot', genre: 'Metal', reason: 'Dense riffs and forceful percussion push catharsis forward.' },
    { title: 'X Gon\' Give It To Ya', artist: 'DMX', genre: 'Hip-Hop', reason: 'Aggressive bark and pounding beat feel confrontational in the best way.' },
  ],
};

const FULL_CATALOG = Object.fromEntries(
  Object.entries(CATALOG).map(([key, songs]) => [key, [...songs, ...(EXTRA_CATALOG[key] || [])]])
);

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

const EXTRA_LANGUAGE_CATALOG = {
  spanish: [
    { title: 'Me Rehuso', artist: 'Danny Ocean', genre: 'Latin Pop', reason: 'Smooth, catchy chorus keeps Spanish-language listening easy and melodic.' },
    { title: 'Eres', artist: 'Cafe Tacvba', genre: 'Latin Rock', reason: 'Warm romantic phrasing gives the set a beloved singalong anchor.' },
  ],
  hindi: [
    { title: 'Ilahi', artist: 'Arijit Singh', genre: 'Bollywood', reason: 'Open-road melody adds lift and wanderlust to the mix.' },
    { title: 'Zinda', artist: 'Siddharth Mahadevan', genre: 'Bollywood Rock', reason: 'Big, motivational energy broadens the Hindi selection nicely.' },
  ],
  french: [
    { title: 'Papaoutai', artist: 'Stromae', genre: 'Electropop', reason: 'Sharp hooks and motion make the French set feel more expansive.' },
    { title: 'Je te laisserai des mots', artist: 'Patrick Watson', genre: 'French Indie', reason: 'Soft intimacy gives the French library a gentler edge.' },
  ],
  korean: [
    { title: 'Love Scenario', artist: 'iKON', genre: 'K-Pop', reason: 'Easy melodic flow makes it one of the most replayable K-pop picks.' },
    { title: 'Ditto', artist: 'NewJeans', genre: 'K-Pop', reason: 'Dreamy, understated production adds a softer modern Korean option.' },
  ],
  japanese: [
    { title: 'Sparkle', artist: 'RADWIMPS', genre: 'J-Rock', reason: 'Sweeping dynamics give the Japanese library more cinematic range.' },
    { title: 'Stay With Me', artist: 'Miki Matsubara', genre: 'City Pop', reason: 'Beloved city-pop warmth makes the throwback selection richer.' },
  ],
  portuguese: [
    { title: 'Chega de Saudade', artist: 'Joao Gilberto', genre: 'Bossa Nova', reason: 'Foundational bossa nova deepens the Brazilian side of the catalog.' },
    { title: 'Anna Julia', artist: 'Los Hermanos', genre: 'Brazilian Rock', reason: 'Singalong rock energy balances the softer Portuguese picks.' },
  ],
  arabic: [
    { title: 'Ah W Noss', artist: 'Nancy Ajram', genre: 'Arabic Pop', reason: 'Light, catchy phrasing adds another high-recognition Arabic favorite.' },
    { title: 'El Donia Helwa', artist: 'Nancy Ajram', genre: 'Arabic Pop', reason: 'Upbeat production broadens the brighter Arabic lane.' },
  ],
  german: [
    { title: 'Major Tom (vollig losgelost)', artist: 'Peter Schilling', genre: 'Synth-Pop', reason: 'Classic synth pulse expands the German throwback range.' },
    { title: '80 Millionen', artist: 'Max Giesinger', genre: 'Pop', reason: 'Anthemic modern pop gives the German set a stronger singalong option.' },
  ],
  italian: [
    { title: 'Con Te Partiro', artist: 'Andrea Bocelli', genre: 'Italian Classic', reason: 'A sweeping standard adds depth and drama to the Italian catalog.' },
    { title: 'Soldi', artist: 'Mahmood', genre: 'Italian Pop', reason: 'Modern rhythmic edge keeps the Italian list from feeling too traditional.' },
  ],
};

const FULL_LANGUAGE_CATALOG = Object.fromEntries(
  Object.entries(LANGUAGE_CATALOG).map(([key, songs]) => [key, [...songs, ...(EXTRA_LANGUAGE_CATALOG[key] || [])]])
);

const GENERIC = [
  { title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Pop', reason: 'High replay value and broad appeal.' },
  { title: 'Levitating', artist: 'Dua Lipa', genre: 'Pop', reason: 'Groove-driven production with energetic bounce.' },
  { title: 'Heat Waves', artist: 'Glass Animals', genre: 'Indie Pop', reason: 'Melodic, modern track that works across contexts.' },
  { title: 'Lose Yourself', artist: 'Eminem', genre: 'Hip-Hop', reason: 'Motivational pacing for activity-oriented listening.' },
  { title: 'As It Was', artist: 'Harry Styles', genre: 'Pop', reason: 'Balanced mood and accessible melodic structure.' },
  { title: 'Stay With Me', artist: 'Sam Smith', genre: 'Soul Pop', reason: 'Crossover ballad with emotional pull.' },
];

const EXTRA_GENERIC = [
  { title: 'Feel It Still', artist: 'Portugal. The Man', genre: 'Alt Pop', reason: 'Compact, hooky groove keeps the fallback library feeling lively.' },
  { title: 'Treasure', artist: 'Bruno Mars', genre: 'Pop', reason: 'Disco-funk sheen gives the broader catalog another instant replay pick.' },
  { title: 'Bad Guy', artist: 'Billie Eilish', genre: 'Alt Pop', reason: 'Minimal punch makes it flexible across moods and activities.' },
  { title: 'Take Me Out', artist: 'Franz Ferdinand', genre: 'Indie Rock', reason: 'Sharp guitar drive adds broader cross-genre reach.' },
  { title: 'Dog Days Are Over', artist: 'Florence + The Machine', genre: 'Indie Pop', reason: 'Big dynamic lift makes the library feel more expansive.' },
  { title: 'Electric Feel', artist: 'MGMT', genre: 'Indie Pop', reason: 'Psychedelic groove works across relaxed, nostalgic, and upbeat requests.' },
  { title: 'Royals', artist: 'Lorde', genre: 'Alt Pop', reason: 'Cool, restrained production rounds out the modern pop bench.' },
  { title: 'Locked Out of Heaven', artist: 'Bruno Mars', genre: 'Pop Rock', reason: 'Fast-moving chorus adds another versatile crowd-pleaser.' },
];

const FULL_GENERIC = [...GENERIC, ...EXTRA_GENERIC];

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
  if (FULL_CATALOG[m]) return m;
  return 'focused';
}

function normalizeLanguageKey(language) {
  const l = (language || '').toLowerCase().trim();
  if (!l || l === 'any') return null;
  if (FULL_LANGUAGE_CATALOG[l]) return l;
  return null;
}

function dedupeKey(song) {
  return `${song.title}|${song.artist}`.toLowerCase();
}

function rotateSongs(songs, seed) {
  if (songs.length < 2) return songs;

  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }

  const offset = Math.abs(hash) % songs.length;
  if (offset === 0) return songs;
  return [...songs.slice(offset), ...songs.slice(0, offset)];
}

function prioritizeByGenre(songs, preferredGenre) {
  if (!preferredGenre) return songs;

  return [...songs].sort((a, b) => {
    const aMatch = a.genre.toLowerCase().includes(preferredGenre) ? 1 : 0;
    const bMatch = b.genre.toLowerCase().includes(preferredGenre) ? 1 : 0;
    return bMatch - aMatch;
  });
}

export function buildFallbackResponse({ mood, genre, activity, language }) {
  const moodKey = normalizeMoodKey(mood);
  const languageKey = normalizeLanguageKey(language);

  // Bias toward the user's preferred genre, if any
  const preferredGenre = (genre || '').toLowerCase().trim();
  const seed = `${moodKey}|${activity || ''}|${languageKey || ''}`;
  const languagePool = languageKey
    ? prioritizeByGenre(FULL_LANGUAGE_CATALOG[languageKey], preferredGenre)
    : [];
  const moodPool = prioritizeByGenre(FULL_CATALOG[moodKey] || FULL_GENERIC, preferredGenre);
  const genericPool = prioritizeByGenre(FULL_GENERIC, preferredGenre);
  const buckets = preferredGenre
    ? [languagePool, moodPool, genericPool]
    : [
        rotateSongs(languagePool, `${seed}|language`),
        rotateSongs(moodPool, `${seed}|mood`),
        rotateSongs(genericPool, `${seed}|generic`),
      ];

  const seen = new Set();
  const songs = [];
  for (const bucket of buckets) {
    for (const song of bucket) {
      const key = dedupeKey(song);
      if (seen.has(key)) continue;
      seen.add(key);
      songs.push(song);
      if (songs.length >= 6) break;
    }
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
