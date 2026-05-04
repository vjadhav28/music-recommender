package com.music.recommender.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.music.recommender.model.RecommendationRequest;
import com.music.recommender.model.RecommendationResponse;
import com.music.recommender.model.Song;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class RecommendationService {
    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);
    private static final int TARGET_SONG_COUNT = 5;

    private static final String SYSTEM_PROMPT = """
            You are a senior music curator.
            Return recommendations as pure JSON only.
            Never include markdown, code fences, or commentary.
            Avoid duplicate songs and keep recommendations from real artists.
            """;

    private static final Map<String, List<Song>> CURATED_BY_MOOD = Map.of(
            "happy", List.of(
                    new Song("Good as Hell", "Lizzo", "Pop", "Confident, high-energy vocals that amplify a happy mood."),
                    new Song("Shut Up and Dance", "WALK THE MOON", "Pop Rock", "Bright rhythm and singalong hooks keep the vibe upbeat."),
                    new Song("Happy", "Pharrell Williams", "Pop", "A classic feel-good groove that matches positive energy."),
                    new Song("Can't Stop the Feeling!", "Justin Timberlake", "Pop", "Dance-forward production suited for joyful moments."),
                    new Song("Walking on Sunshine", "Katrina & The Waves", "Pop Rock", "Classic uplifting anthem with sunny momentum.")
            ),
            "sad", List.of(
                    new Song("Someone Like You", "Adele", "Soul Pop", "Emotionally resonant ballad that reflects a reflective mood."),
                    new Song("Skinny Love", "Bon Iver", "Indie Folk", "Intimate acoustic texture that supports quiet introspection."),
                    new Song("Fix You", "Coldplay", "Alternative Rock", "Gentle build and hopeful tone offer comfort."),
                    new Song("Liability", "Lorde", "Alternative Pop", "Minimal arrangement and honest lyricism fit low-energy moments."),
                    new Song("The Night We Met", "Lord Huron", "Indie Folk", "Melancholic atmosphere for deeply reflective listening.")
            ),
            "energetic", List.of(
                    new Song("Titanium", "David Guetta ft. Sia", "EDM", "Powerful drops and vocals sustain high energy."),
                    new Song("Eye of the Tiger", "Survivor", "Rock", "Driving rhythm helps maintain momentum."),
                    new Song("Stronger", "Kanye West", "Hip-Hop", "Punchy production ideal for high-intensity sessions."),
                    new Song("Levels", "Avicii", "EDM", "Festival-style progression that boosts motivation."),
                    new Song("Don't Stop Me Now", "Queen", "Rock", "Fast tempo and dynamic vocals fuel energetic activity.")
            ),
            "relaxed", List.of(
                    new Song("Sunset Lover", "Petit Biscuit", "Chill Electronic", "Soft textures and gentle rhythm support relaxation."),
                    new Song("Better Together", "Jack Johnson", "Acoustic", "Warm acoustic tones create a calm listening space."),
                    new Song("Holocene", "Bon Iver", "Indie Folk", "Atmospheric soundscape suitable for winding down."),
                    new Song("Breathe", "Télépopmusik", "Downtempo", "Smooth groove promotes an unhurried mood."),
                    new Song("Dreams", "Fleetwood Mac", "Soft Rock", "Laid-back rhythm and melodic flow feel effortless.")
            ),
            "focused", List.of(
                    new Song("Time", "Hans Zimmer", "Instrumental", "Minimalist progression helps sustain concentration."),
                    new Song("Experience", "Ludovico Einaudi", "Classical", "Repetitive piano motifs support deep work."),
                    new Song("Weightless", "Marconi Union", "Ambient", "Low-arousal ambient design aids focus."),
                    new Song("Intro", "The xx", "Indie", "Steady pulse and sparse arrangement reduce distraction."),
                    new Song("A Walk", "Tycho", "Downtempo", "Consistent electronic texture is great for flow-state work.")
            ),
            "romantic", List.of(
                    new Song("All of Me", "John Legend", "R&B", "Warm vocals and tender lyrics suit romantic settings."),
                    new Song("Earned It", "The Weeknd", "R&B", "Slow, atmospheric groove supports intimate mood."),
                    new Song("Perfect", "Ed Sheeran", "Pop", "Soft arrangement and affectionate tone fit romantic moments."),
                    new Song("At Last", "Etta James", "Soul", "Classic soulful phrasing reinforces romantic ambience."),
                    new Song("Adore You", "Harry Styles", "Pop", "Easy-going melody with affectionate lyrical framing.")
            ),
            "nostalgic", List.of(
                    new Song("Viva La Vida", "Coldplay", "Alternative Rock", "Familiar anthem evokes reflective nostalgia."),
                    new Song("Mr. Brightside", "The Killers", "Indie Rock", "Iconic 2000s track with lasting emotional recall."),
                    new Song("Take On Me", "a-ha", "Synth-Pop", "Retro melody instantly triggers nostalgic memory."),
                    new Song("Wonderwall", "Oasis", "Britpop", "Acoustic-driven classic tied to shared musical memory."),
                    new Song("Bohemian Rhapsody", "Queen", "Rock", "Timeless arrangement often associated with nostalgia.")
            ),
            "angry", List.of(
                    new Song("Killing In The Name", "Rage Against The Machine", "Rock", "Raw intensity channels frustration into motion."),
                    new Song("Duality", "Slipknot", "Metal", "Heavy percussion provides a cathartic outlet."),
                    new Song("Numb", "Linkin Park", "Rock", "High emotional intensity for release and reset."),
                    new Song("Bulls on Parade", "Rage Against The Machine", "Rock", "Aggressive groove matches confrontational energy."),
                    new Song("DNA.", "Kendrick Lamar", "Hip-Hop", "Explosive cadence and rhythm support venting energy.")
            )
    );

    private static final Map<String, List<Song>> EXTRA_CURATED_BY_MOOD = Map.of(
            "happy", List.of(
                    new Song("I Wanna Dance with Somebody", "Whitney Houston", "Pop", "Big-chorus energy keeps the mood bright and celebratory."),
                    new Song("Dancing Queen", "ABBA", "Disco Pop", "Sparkling melodies make upbeat moods feel even lighter."),
                    new Song("Best Day Of My Life", "American Authors", "Indie Pop", "Stomping percussion and chant hooks feel instantly uplifting."),
                    new Song("Uptown Funk", "Mark Ronson ft. Bruno Mars", "Funk Pop", "Brassy swagger turns happy energy into a full-room singalong.")
            ),
            "sad", List.of(
                    new Song("drivers license", "Olivia Rodrigo", "Pop Ballad", "Detailed heartbreak storytelling suits late-night reflection."),
                    new Song("All I Want", "Kodaline", "Indie Folk", "Slow build and aching vocals leave room for big feelings."),
                    new Song("Back to Black", "Amy Winehouse", "Soul", "Smoky delivery gives sadness a sharper edge."),
                    new Song("When the Party's Over", "Billie Eilish", "Alt Pop", "Bare arrangement and fragile vocals make the mood feel intimate.")
            ),
            "energetic", List.of(
                    new Song("Can't Hold Us", "Macklemore & Ryan Lewis ft. Ray Dalton", "Hip-Hop", "Rapid-fire momentum keeps the adrenaline high."),
                    new Song("Till I Collapse", "Eminem", "Hip-Hop", "Relentless cadence is built for pushing harder."),
                    new Song("Bangarang", "Skrillex ft. Sirah", "EDM", "Hyperactive drops bring instant intensity."),
                    new Song("Remember the Name", "Fort Minor", "Rap Rock", "Punchy hook and swagger make it ideal for high-drive moments.")
            ),
            "relaxed", List.of(
                    new Song("Come Away With Me", "Norah Jones", "Jazz Pop", "Soft vocal phrasing settles the room immediately."),
                    new Song("Banana Pancakes", "Jack Johnson", "Acoustic", "Loose acoustic swing is perfect for slow mornings."),
                    new Song("Bloom", "ODESZA", "Chill Electronic", "Airy synth layers create a spacious, easy mood."),
                    new Song("Pink + White", "Frank Ocean", "R&B", "Feathery production makes calm listening feel luxurious.")
            ),
            "focused", List.of(
                    new Song("Nuvole Bianche", "Ludovico Einaudi", "Classical", "Steady piano phrasing supports deep concentration."),
                    new Song("Gymnopedie No. 1", "Erik Satie", "Classical", "Minimal melodic repetition stays present without distracting."),
                    new Song("An Ending (Ascent)", "Brian Eno", "Ambient", "Weightless ambient layers are ideal for low-distraction work."),
                    new Song("Near Light", "Olafur Arnalds", "Neo-Classical", "Measured build keeps focus steady over longer sessions.")
            ),
            "romantic", List.of(
                    new Song("Thinking Out Loud", "Ed Sheeran", "Pop", "Warm intimacy and slow groove suit affectionate moments."),
                    new Song("Best Part", "Daniel Caesar ft. H.E.R.", "R&B", "Tender duet energy keeps the room soft and close."),
                    new Song("Can't Help Falling in Love", "Elvis Presley", "Classic Pop", "Timeless melody adds effortless romance."),
                    new Song("Until I Found You", "Stephen Sanchez", "Pop", "Retro croon makes the mood feel cinematic and sincere.")
            ),
            "nostalgic", List.of(
                    new Song("Everybody Wants to Rule the World", "Tears for Fears", "Synth-Pop", "Instantly familiar groove invites reflective nostalgia."),
                    new Song("I Want It That Way", "Backstreet Boys", "Pop", "Millennial singalong energy hits the memory center fast."),
                    new Song("Yellow", "Coldplay", "Alternative Rock", "Warm melodic lift carries a sentimental glow."),
                    new Song("No Scrubs", "TLC", "R&B", "Iconic late-90s hook makes the throwback feel playful.")
            ),
            "angry", List.of(
                    new Song("Break Stuff", "Limp Bizkit", "Nu Metal", "Volatile delivery helps vent pressure fast."),
                    new Song("Chop Suey!", "System of a Down", "Metal", "Chaotic stop-start energy channels frustration into motion."),
                    new Song("Sabotage", "Beastie Boys", "Rap Rock", "Shouted urgency and grit make the emotion feel kinetic."),
                    new Song("One Step Closer", "Linkin Park", "Rock", "Explosive chorus is built for letting tension out.")
            )
    );

    private static final List<Song> GENERIC_FALLBACK = List.of(
            new Song("Blinding Lights", "The Weeknd", "Pop", "High replay value and broad appeal."),
            new Song("Levitating", "Dua Lipa", "Pop", "Groove-driven production with energetic bounce."),
            new Song("Heat Waves", "Glass Animals", "Indie Pop", "Melodic, modern track that works across contexts."),
            new Song("Lose Yourself", "Eminem", "Hip-Hop", "Motivational pacing for activity-oriented listening."),
            new Song("As It Was", "Harry Styles", "Pop", "Balanced mood and accessible melodic structure.")
    );

    private static final List<Song> EXTRA_GENERIC_FALLBACK = List.of(
            new Song("Feel It Still", "Portugal. The Man", "Alt Pop", "Compact, hooky groove keeps the fallback library feeling lively."),
            new Song("Treasure", "Bruno Mars", "Pop", "Disco-funk sheen gives the broader catalog another instant replay pick."),
            new Song("Bad Guy", "Billie Eilish", "Alt Pop", "Minimal punch makes it flexible across moods and activities."),
            new Song("Take Me Out", "Franz Ferdinand", "Indie Rock", "Sharp guitar drive adds broader cross-genre reach."),
            new Song("Electric Feel", "MGMT", "Indie Pop", "Psychedelic groove works across relaxed, nostalgic, and upbeat requests.")
    );

    private static final Map<String, List<Song>> FULL_CURATED_BY_MOOD = mergeCatalogs(CURATED_BY_MOOD, EXTRA_CURATED_BY_MOOD);
    private static final List<Song> FULL_GENERIC_FALLBACK = mergeSongs(GENERIC_FALLBACK, EXTRA_GENERIC_FALLBACK);

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public RecommendationService(ChatClient.Builder chatClientBuilder, ObjectMapper objectMapper) {
        this.chatClient = chatClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public RecommendationResponse getRecommendations(RecommendationRequest request) {
        String prompt = buildPrompt(request);
        try {
            String rawResponse = chatClient.prompt()
                    .system(SYSTEM_PROMPT)
                    .user(prompt)
                    .call()
                    .content();

            RecommendationResponse parsed = parseResponse(rawResponse, request);
            if (parsed.getSongs().isEmpty()) {
                return buildFallbackResponse(request, "Curated picks were used while the AI response was refined.");
            }
            return parsed;
        } catch (Exception ex) {
            log.warn("AI recommendation request failed. Falling back to curated picks: {}", ex.getMessage());
            return buildFallbackResponse(request, "Curated picks were used because the AI recommender was unavailable.");
        }
    }

    private String buildPrompt(RecommendationRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Recommend exactly 5 songs as a JSON object.\n");
        sb.append("User preferences:\n");
        sb.append("- Mood: ").append(request.getMood()).append("\n");
        sb.append("- Genre preference: ").append(firstNonBlank(request.getGenre(), "Any")).append("\n");
        sb.append("- Activity: ").append(firstNonBlank(request.getActivity(), "General listening")).append("\n");
        sb.append("- Language preference: ").append(firstNonBlank(request.getLanguage(), "Any")).append("\n\n");
        sb.append("Rules:\n");
        sb.append("1) Return exactly 5 unique songs.\n");
        sb.append("2) Keep songs from real artists and widely recognized catalogs.\n");
        sb.append("3) Tailor reasons to mood and activity.\n");
        sb.append("4) Output only valid JSON in this shape:\n");
        sb.append("{\"summary\":\"...\",\"songs\":[{\"title\":\"...\",\"artist\":\"...\",\"genre\":\"...\",\"reason\":\"...\"}]}");
        return sb.toString();
    }

    private RecommendationResponse parseResponse(String response, RecommendationRequest request) {
        try {
            JsonNode rootNode = objectMapper.readTree(extractJsonObject(response));
            List<Song> parsedSongs = new ArrayList<>();

            JsonNode songsNode = rootNode.path("songs");
            if (songsNode.isArray()) {
                for (JsonNode songNode : songsNode) {
                    parsedSongs.add(new Song(
                            sanitizeText(songNode.path("title").asText("")),
                            sanitizeText(songNode.path("artist").asText("")),
                            sanitizeText(songNode.path("genre").asText(firstNonBlank(request.getGenre(), "Mixed"))),
                            sanitizeText(songNode.path("reason").asText("Chosen to match your preferences."))
                    ));
                }
            }

            List<Song> normalizedSongs = normalizeSongs(parsedSongs, request);
            String summary = sanitizeText(rootNode.path("summary").asText(""));
            if (!StringUtils.hasText(summary)) {
                summary = buildSummary(request, true);
            }
            return new RecommendationResponse(normalizedSongs, summary);
        } catch (Exception e) {
            log.warn("Could not parse AI recommendation response, switching to curated fallback: {}", e.getMessage());
            return buildFallbackResponse(request, "Curated picks were used because AI output could not be parsed safely.");
        }
    }

    private List<Song> normalizeSongs(List<Song> aiSongs, RecommendationRequest request) {
        List<Song> normalized = new ArrayList<>();
        Set<String> dedupeKeys = new LinkedHashSet<>();
        String fallbackGenre = firstNonBlank(request.getGenre(), "Mixed");

        for (Song song : aiSongs) {
            String title = sanitizeText(song.getTitle());
            String artist = sanitizeText(song.getArtist());
            if (!StringUtils.hasText(title) || !StringUtils.hasText(artist)) {
                continue;
            }

            String key = (title + "|" + artist).toLowerCase();
            if (!dedupeKeys.add(key)) {
                continue;
            }

            normalized.add(new Song(
                    title,
                    artist,
                    firstNonBlank(sanitizeText(song.getGenre()), fallbackGenre),
                    firstNonBlank(sanitizeText(song.getReason()), "Chosen to match your preferences.")
            ));

            if (normalized.size() == TARGET_SONG_COUNT) {
                return normalized;
            }
        }

        for (Song fallback : pickFallbackSongs(request)) {
            String key = (fallback.getTitle() + "|" + fallback.getArtist()).toLowerCase();
            if (!dedupeKeys.add(key)) {
                continue;
            }
            normalized.add(fallback);
            if (normalized.size() == TARGET_SONG_COUNT) {
                break;
            }
        }

        return normalized;
    }

    private RecommendationResponse buildFallbackResponse(RecommendationRequest request, String summaryPrefix) {
        List<Song> fallbackSongs = pickFallbackSongs(request);
        String summary = summaryPrefix + " " + buildSummary(request, false);
        return new RecommendationResponse(fallbackSongs, summary);
    }

    private List<Song> pickFallbackSongs(RecommendationRequest request) {
        String moodKey = normalizeMoodKey(request.getMood());
        List<Song> moodSongs = FULL_CURATED_BY_MOOD.getOrDefault(moodKey, FULL_GENERIC_FALLBACK);
        List<Song> fallback = new ArrayList<>(moodSongs);

        if (StringUtils.hasText(request.getGenre())) {
            String preferredGenre = request.getGenre().trim().toLowerCase();
            fallback.sort((left, right) -> {
                boolean leftPreferred = left.getGenre().toLowerCase().contains(preferredGenre);
                boolean rightPreferred = right.getGenre().toLowerCase().contains(preferredGenre);
                return Boolean.compare(rightPreferred, leftPreferred);
            });
        } else {
            fallback = rotateSongs(
                    fallback,
                    moodKey + "|" + firstNonBlank(request.getActivity(), "") + "|" + firstNonBlank(request.getLanguage(), "")
            );
        }

        if (fallback.size() < TARGET_SONG_COUNT) {
            for (Song song : FULL_GENERIC_FALLBACK) {
                boolean exists = fallback.stream().anyMatch(current ->
                        (current.getTitle() + "|" + current.getArtist())
                                .equalsIgnoreCase(song.getTitle() + "|" + song.getArtist()));
                if (!exists) {
                    fallback.add(song);
                }
                if (fallback.size() == TARGET_SONG_COUNT) {
                    break;
                }
            }
        }

        return fallback.subList(0, Math.min(TARGET_SONG_COUNT, fallback.size()));
    }

    private String normalizeMoodKey(String mood) {
        String normalized = firstNonBlank(mood, "focused").toLowerCase();
        if (normalized.contains("focus") || normalized.contains("study") || normalized.contains("work")) {
            return "focused";
        }
        if (normalized.contains("calm") || normalized.contains("chill") || normalized.contains("relax")) {
            return "relaxed";
        }
        if (normalized.contains("energy") || normalized.contains("hype")) {
            return "energetic";
        }
        if (normalized.contains("nostalgia") || normalized.contains("throwback")) {
            return "nostalgic";
        }
        if (normalized.contains("romance") || normalized.contains("love")) {
            return "romantic";
        }
        if (normalized.contains("mad") || normalized.contains("frustrat")) {
            return "angry";
        }
        for (String key : FULL_CURATED_BY_MOOD.keySet()) {
            if (normalized.contains(key)) {
                return key;
            }
        }
        return "focused";
    }

    private static Map<String, List<Song>> mergeCatalogs(Map<String, List<Song>> baseCatalog, Map<String, List<Song>> extraCatalog) {
        Map<String, List<Song>> merged = new LinkedHashMap<>();
        for (Map.Entry<String, List<Song>> entry : baseCatalog.entrySet()) {
            merged.put(entry.getKey(), mergeSongs(entry.getValue(), extraCatalog.getOrDefault(entry.getKey(), List.of())));
        }
        return Map.copyOf(merged);
    }

    private static List<Song> mergeSongs(List<Song> baseSongs, List<Song> extraSongs) {
        List<Song> merged = new ArrayList<>(baseSongs);
        merged.addAll(extraSongs);
        return List.copyOf(merged);
    }

    private static List<Song> rotateSongs(List<Song> songs, String seed) {
        if (songs.size() < 2) {
            return songs;
        }

        int offset = Math.floorMod(seed.hashCode(), songs.size());
        if (offset == 0) {
            return songs;
        }

        List<Song> rotated = new ArrayList<>(songs.size());
        rotated.addAll(songs.subList(offset, songs.size()));
        rotated.addAll(songs.subList(0, offset));
        return rotated;
    }

    private String extractJsonObject(String response) {
        String cleaned = firstNonBlank(response, "").strip();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("^```[a-zA-Z]*\\n?", "")
                    .replaceAll("```$", "")
                    .strip();
        }

        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return cleaned.substring(start, end + 1);
        }
        return cleaned;
    }

    private String buildSummary(RecommendationRequest request, boolean aiBacked) {
        String lead = aiBacked
                ? "These tracks were selected to align with your"
                : "These curated tracks align with your";
        return lead + " " + request.getMood().toLowerCase()
                + " mood"
                + appendIfPresent(request.getGenre(), ", genre preference for " + request.getGenre())
                + appendIfPresent(request.getActivity(), ", and activity: " + request.getActivity())
                + ".";
    }

    private String appendIfPresent(String value, String text) {
        return StringUtils.hasText(value) ? text : "";
    }

    private String sanitizeText(String value) {
        return firstNonBlank(value, "").replaceAll("\\s+", " ").trim();
    }

    private String firstNonBlank(String first, String fallback) {
        return StringUtils.hasText(first) ? first.trim() : fallback;
    }
}
