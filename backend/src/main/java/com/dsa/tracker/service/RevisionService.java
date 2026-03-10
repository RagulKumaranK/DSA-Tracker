package com.dsa.tracker.service;

import com.dsa.tracker.dto.DashboardStats;
import com.dsa.tracker.dto.RevisionResponse;
import com.dsa.tracker.entity.Problem;
import com.dsa.tracker.entity.Revision;
import com.dsa.tracker.repository.ProblemRepository;
import com.dsa.tracker.repository.RevisionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RevisionService {

    private final RevisionRepository revisionRepository;
    private final ProblemRepository problemRepository;

    public RevisionService(RevisionRepository revisionRepository, ProblemRepository problemRepository) {
        this.revisionRepository = revisionRepository;
        this.problemRepository = problemRepository;
    }

    public List<RevisionResponse> getTodayRevisions() {
        return revisionRepository
                .findByRevisionDateAndStatus(LocalDate.now(), Revision.RevisionStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<RevisionResponse> getRevisionsByProblem(Long problemId) {
        return revisionRepository.findByProblemId(problemId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<RevisionResponse> getUpcomingRevisions() {
        LocalDate futureDate = LocalDate.now().plusDays(30);
        return revisionRepository
                .findByStatusAndRevisionDateLessThanEqualOrderByRevisionDateAsc(Revision.RevisionStatus.PENDING, futureDate)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<RevisionResponse> getAllPendingRevisions() {
        return revisionRepository
                .findByStatusOrderByRevisionDateAsc(Revision.RevisionStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RevisionResponse markAsDone(Long revisionId) {
        Revision revision = revisionRepository.findById(revisionId)
                .orElseThrow(() -> new RuntimeException("Revision not found: " + revisionId));
        revision.setStatus(Revision.RevisionStatus.DONE);
        return toResponse(revisionRepository.save(revision));
    }

    public DashboardStats getDashboardStats() {
        long total = problemRepository.count();

        Map<String, Long> difficultyMap = problemRepository.countByDifficulty()
                .stream()
                .collect(Collectors.toMap(
                        row -> ((Problem.Difficulty) row[0]).name(),
                        row -> (Long) row[1]
                ));

        Map<String, Long> topicMap = problemRepository.countByTopic()
                .stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));

        long todayCount = revisionRepository
                .findByRevisionDateAndStatus(LocalDate.now(), Revision.RevisionStatus.PENDING)
                .size();

        long pendingCount = revisionRepository
                .findByStatusOrderByRevisionDateAsc(Revision.RevisionStatus.PENDING)
                .size();

        return DashboardStats.builder()
                .totalProblems(total)
                .easyCount(difficultyMap.getOrDefault("EASY", 0L))
                .mediumCount(difficultyMap.getOrDefault("MEDIUM", 0L))
                .hardCount(difficultyMap.getOrDefault("HARD", 0L))
                .todayRevisionCount(todayCount)
                .pendingRevisionCount(pendingCount)
                .topicBreakdown(topicMap)
                .build();
    }

    private RevisionResponse toResponse(Revision revision) {
        Problem p = revision.getProblem();
        return RevisionResponse.builder()
                .id(revision.getId())
                .problemId(p.getId())
                .problemTitle(p.getTitle())
                .problemTopic(p.getTopic())
                .problemDifficulty(p.getDifficulty().name())
                .revisionDate(revision.getRevisionDate())
                .status(revision.getStatus())
                .dayOffset(revision.getDayOffset())
                .build();
    }
}
