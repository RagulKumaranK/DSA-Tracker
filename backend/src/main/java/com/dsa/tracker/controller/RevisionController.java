package com.dsa.tracker.controller;

import com.dsa.tracker.dto.DashboardStats;
import com.dsa.tracker.dto.RevisionResponse;
import com.dsa.tracker.service.RevisionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RevisionController {

    private final RevisionService revisionService;

    public RevisionController(RevisionService revisionService) {
        this.revisionService = revisionService;
    }

    @GetMapping("/revisions/today")
    public ResponseEntity<List<RevisionResponse>> getTodayRevisions() {
        return ResponseEntity.ok(revisionService.getTodayRevisions());
    }

    @GetMapping("/revisions/upcoming")
    public ResponseEntity<List<RevisionResponse>> getUpcomingRevisions() {
        return ResponseEntity.ok(revisionService.getUpcomingRevisions());
    }

    @GetMapping("/revisions/pending")
    public ResponseEntity<List<RevisionResponse>> getAllPendingRevisions() {
        return ResponseEntity.ok(revisionService.getAllPendingRevisions());
    }

    @GetMapping("/revisions/problem/{problemId}")
    public ResponseEntity<List<RevisionResponse>> getRevisionsByProblem(@PathVariable("problemId") Long problemId) {
        return ResponseEntity.ok(revisionService.getRevisionsByProblem(problemId));
    }

    @PutMapping("/revisions/{id}/done")
    public ResponseEntity<RevisionResponse> markRevisionDone(@PathVariable("id") Long id) {
        return ResponseEntity.ok(revisionService.markAsDone(id));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(revisionService.getDashboardStats());
    }
}
