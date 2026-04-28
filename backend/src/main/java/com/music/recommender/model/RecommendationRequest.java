package com.music.recommender.model;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RecommendationRequest {
    @NotBlank(message = "Mood is required")
    @Size(max = 40, message = "Mood must be 40 characters or fewer")

    private String mood;
    @Size(max = 60, message = "Genre must be 60 characters or fewer")
    private String genre;
    @Size(max = 60, message = "Activity must be 60 characters or fewer")
    private String activity;

    public RecommendationRequest() {}

    public RecommendationRequest(String mood, String genre, String activity) {
        this.mood = mood;
        this.genre = genre;
        this.activity = activity;
    }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public String getActivity() { return activity; }
    public void setActivity(String activity) { this.activity = activity; }
}
