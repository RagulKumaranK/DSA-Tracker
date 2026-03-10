package com.dsa.tracker.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "problems")
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "problem_link")
    private String problemLink;

    @Column(nullable = false)
    private String topic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Column(columnDefinition = "TEXT")
    private String approach;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String code;

    @Column(name = "code_language")
    private String codeLanguage = "java";

    @Column(name = "date_solved", nullable = false)
    private LocalDate dateSolved;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Revision> revisions;

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getProblemLink() { return problemLink; }
    public void setProblemLink(String problemLink) { this.problemLink = problemLink; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }

    public String getApproach() { return approach; }
    public void setApproach(String approach) { this.approach = approach; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getCodeLanguage() { return codeLanguage; }
    public void setCodeLanguage(String codeLanguage) { this.codeLanguage = codeLanguage; }

    public LocalDate getDateSolved() { return dateSolved; }
    public void setDateSolved(LocalDate dateSolved) { this.dateSolved = dateSolved; }

    public List<Revision> getRevisions() { return revisions; }
    public void setRevisions(List<Revision> revisions) { this.revisions = revisions; }

    // --- Builder ---
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Problem p = new Problem();
        public Builder title(String v) { p.title = v; return this; }
        public Builder problemLink(String v) { p.problemLink = v; return this; }
        public Builder topic(String v) { p.topic = v; return this; }
        public Builder difficulty(Difficulty v) { p.difficulty = v; return this; }
        public Builder approach(String v) { p.approach = v; return this; }
        public Builder notes(String v) { p.notes = v; return this; }
        public Builder code(String v) { p.code = v; return this; }
        public Builder codeLanguage(String v) { p.codeLanguage = v; return this; }
        public Builder dateSolved(LocalDate v) { p.dateSolved = v; return this; }
        public Problem build() { return p; }
    }
}
