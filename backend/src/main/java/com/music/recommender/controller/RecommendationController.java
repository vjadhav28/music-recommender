package com.music.recommender.controller;

import com.music.recommender.model.RecommendationRequest;
import com.music.recommender.model.RecommendationResponse;
import com.music.recommender.service.RecommendationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping("/recommendations")
    public ResponseEntity<RecommendationResponse> getRecommendations(
            @Valid @RequestBody RecommendationRequest request) {
        RecommendationResponse response = recommendationService.getRecommendations(request);
        return ResponseEntity.ok(response);
    }
}
