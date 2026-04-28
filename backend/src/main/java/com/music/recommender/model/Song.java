package com.music.recommender.model;

public class Song {

    private String title;
    private String artist;
    private String genre;
    private String reason;

    public Song() {}

    public Song(String title, String artist, String genre, String reason) {
        this.title = title;
        this.artist = artist;
        this.genre = genre;
        this.reason = reason;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getArtist() { return artist; }
    public void setArtist(String artist) { this.artist = artist; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
