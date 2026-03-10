package com.dsa.tracker.repository;

import com.dsa.tracker.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {

        List<Problem> findByTopicIgnoreCase(String topic);

        List<Problem> findByDifficulty(Problem.Difficulty difficulty);

        List<Problem> findByTopicIgnoreCaseAndDifficulty(String topic, Problem.Difficulty difficulty);

        @Query("SELECT p FROM Problem p WHERE " +
            "(CAST(:topic AS string) IS NULL OR LOWER(p.topic) = LOWER(CAST(:topic AS string))) AND " +
            "(:difficulty IS NULL OR p.difficulty = :difficulty) AND " +
            "(CAST(:search AS string) IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
        List<Problem> findWithFilters(
                        @Param("topic") String topic,
                        @Param("difficulty") Problem.Difficulty difficulty,
                        @Param("search") String search);

        @Query("SELECT p.topic, COUNT(p) FROM Problem p GROUP BY p.topic")
        List<Object[]> countByTopic();

        @Query("SELECT p.difficulty, COUNT(p) FROM Problem p GROUP BY p.difficulty")
        List<Object[]> countByDifficulty();
}
