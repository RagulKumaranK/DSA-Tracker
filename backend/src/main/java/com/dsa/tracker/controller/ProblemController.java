package com.dsa.tracker.controller;

import com.dsa.tracker.dto.ProblemRequest;
import com.dsa.tracker.entity.Problem;
import com.dsa.tracker.service.ProblemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

    @GetMapping
    public ResponseEntity<List<Problem>> getAllProblems(
            @RequestParam(name = "topic", required = false) String topic,
            @RequestParam(name = "difficulty", required = false) String difficulty,
            @RequestParam(name = "search", required = false) String search) {
        return ResponseEntity.ok(problemService.getAllProblems(topic, difficulty, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Problem> getProblem(@PathVariable("id") Long id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    @PostMapping
    public ResponseEntity<Problem> createProblem(@Valid @RequestBody ProblemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(problemService.createProblem(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Problem> updateProblem(@PathVariable("id") Long id,
                                                  @Valid @RequestBody ProblemRequest request) {
        return ResponseEntity.ok(problemService.updateProblem(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblem(@PathVariable("id") Long id) {
        problemService.deleteProblem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/topics")
    public ResponseEntity<List<String>> getAllTopics() {
        return ResponseEntity.ok(problemService.getAllTopics());
    }
}
