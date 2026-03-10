package com.dsa.tracker.repository;

import com.dsa.tracker.entity.Revision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RevisionRepository extends JpaRepository<Revision, Long> {

    List<Revision> findByRevisionDate(LocalDate date);

    List<Revision> findByRevisionDateAndStatus(LocalDate date, Revision.RevisionStatus status);

    List<Revision> findByProblemId(Long problemId);

    List<Revision> findByStatusAndRevisionDateLessThanEqualOrderByRevisionDateAsc(Revision.RevisionStatus status, LocalDate end);

    List<Revision> findByStatusOrderByRevisionDateAsc(Revision.RevisionStatus status);
}
