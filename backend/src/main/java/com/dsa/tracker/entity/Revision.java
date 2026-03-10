package com.dsa.tracker.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "revisions")
public class Revision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(name = "revision_date", nullable = false)
    private LocalDate revisionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RevisionStatus status = RevisionStatus.PENDING;

    @Column(name = "day_offset")
    private Integer dayOffset;

    public enum RevisionStatus {
        PENDING, DONE
    }

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Problem getProblem() { return problem; }
    public void setProblem(Problem problem) { this.problem = problem; }

    public LocalDate getRevisionDate() { return revisionDate; }
    public void setRevisionDate(LocalDate revisionDate) { this.revisionDate = revisionDate; }

    public RevisionStatus getStatus() { return status; }
    public void setStatus(RevisionStatus status) { this.status = status; }

    public Integer getDayOffset() { return dayOffset; }
    public void setDayOffset(Integer dayOffset) { this.dayOffset = dayOffset; }

    // --- Builder ---
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Revision r = new Revision();
        public Builder problem(Problem v) { r.problem = v; return this; }
        public Builder revisionDate(LocalDate v) { r.revisionDate = v; return this; }
        public Builder status(RevisionStatus v) { r.status = v; return this; }
        public Builder dayOffset(Integer v) { r.dayOffset = v; return this; }
        public Revision build() { return r; }
    }
}
