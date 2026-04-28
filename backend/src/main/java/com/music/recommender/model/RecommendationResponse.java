package com.music.recommender.model;

import java.util.List;

public class RecommendationResponse {

    private List<Song> songs;
    private String summary;

    public RecommendationResponse() {}

    public RecommendationResponse(List<Song> songs, String summary) {
        this.songs = songs;
        this.summary = summary;
    }

    public List<Song> getSongs() { return songs; }
    public void setSongs(List<Song> songs) { this.songs = songs; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
}
