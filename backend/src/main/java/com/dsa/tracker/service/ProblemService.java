package com.dsa.tracker.service;

import com.dsa.tracker.dto.ProblemRequest;
import com.dsa.tracker.entity.Problem;
import com.dsa.tracker.entity.Revision;
import com.dsa.tracker.repository.ProblemRepository;
import com.dsa.tracker.repository.RevisionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final RevisionRepository revisionRepository;

    public ProblemService(ProblemRepository problemRepository, RevisionRepository revisionRepository) {
        this.problemRepository = problemRepository;
        this.revisionRepository = revisionRepository;
    }

    private static final int[] REVISION_DAYS = {3, 7, 15};

    @Transactional
    public Problem createProblem(ProblemRequest request) {
        Problem problem = Problem.builder()
                .title(request.getTitle())
                .problemLink(request.getProblemLink())
                .topic(request.getTopic())
                .difficulty(request.getDifficulty())
                .approach(request.getApproach())
                .notes(request.getNotes())
                .code(request.getCode())
                .codeLanguage(request.getCodeLanguage() != null ? request.getCodeLanguage() : "java")
                .dateSolved(request.getDateSolved())
                .alternateSolutions(request.getAlternateSolutions() != null ? request.getAlternateSolutions() : new java.util.ArrayList<>())
                .build();

        Problem saved = problemRepository.save(problem);

        for (int day : REVISION_DAYS) {
            Revision revision = Revision.builder()
                    .problem(saved)
                    .revisionDate(request.getDateSolved().plusDays(day))
                    .dayOffset(day)
                    .status(Revision.RevisionStatus.PENDING)
                    .build();
            revisionRepository.save(revision);
        }

        return saved;
    }

    public List<Problem> getAllProblems(String topic, String difficulty, String search) {
        Problem.Difficulty difficultyEnum = null;
        if (difficulty != null && !difficulty.isBlank()) {
            try {
                difficultyEnum = Problem.Difficulty.valueOf(difficulty.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        final Problem.Difficulty finalDiff = difficultyEnum;

        List<Problem> problems = problemRepository.findAll();

        return problems.stream()
                .filter(p -> topic == null || topic.isBlank() || p.getTopic().equalsIgnoreCase(topic))
                .filter(p -> finalDiff == null || p.getDifficulty() == finalDiff)
                .filter(p -> search == null || search.isBlank() || p.getTitle().toLowerCase().contains(search.toLowerCase()))
                .toList();
    }

    public Problem getProblemById(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found with id: " + id));
    }

    @Transactional
    public Problem updateProblem(Long id, ProblemRequest request) {
        Problem problem = getProblemById(id);
        problem.setTitle(request.getTitle());
        problem.setProblemLink(request.getProblemLink());
        problem.setTopic(request.getTopic());
        problem.setDifficulty(request.getDifficulty());
        problem.setApproach(request.getApproach());
        problem.setNotes(request.getNotes());
        problem.setCode(request.getCode());
        problem.setCodeLanguage(request.getCodeLanguage());
        problem.setDateSolved(request.getDateSolved());
        problem.setAlternateSolutions(request.getAlternateSolutions() != null ? request.getAlternateSolutions() : new java.util.ArrayList<>());
        return problemRepository.save(problem);
    }

    @Transactional
    public void deleteProblem(Long id) {
        problemRepository.deleteById(id);
    }

    public List<String> getAllTopics() {
        return problemRepository.findAll()
                .stream()
                .map(Problem::getTopic)
                .distinct()
                .sorted()
                .toList();
    }
}
