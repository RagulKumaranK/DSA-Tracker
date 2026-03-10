package com.dsa.tracker.dto;

import com.dsa.tracker.entity.Revision;
import java.time.LocalDate;

public class RevisionResponse {
    private Long id;
    private Long problemId;
    private String problemTitle;
    private String problemTopic;
    private String problemDifficulty;
    private LocalDate revisionDate;
    private Revision.RevisionStatus status;
    private Integer dayOffset;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProblemId() { return problemId; }
    public void setProblemId(Long problemId) { this.problemId = problemId; }

    public String getProblemTitle() { return problemTitle; }
    public void setProblemTitle(String problemTitle) { this.problemTitle = problemTitle; }

    public String getProblemTopic() { return problemTopic; }
    public void setProblemTopic(String problemTopic) { this.problemTopic = problemTopic; }

    public String getProblemDifficulty() { return problemDifficulty; }
    public void setProblemDifficulty(String problemDifficulty) { this.problemDifficulty = problemDifficulty; }

    public LocalDate getRevisionDate() { return revisionDate; }
    public void setRevisionDate(LocalDate revisionDate) { this.revisionDate = revisionDate; }

    public Revision.RevisionStatus getStatus() { return status; }
    public void setStatus(Revision.RevisionStatus status) { this.status = status; }

    public Integer getDayOffset() { return dayOffset; }
    public void setDayOffset(Integer dayOffset) { this.dayOffset = dayOffset; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final RevisionResponse r = new RevisionResponse();
        public Builder id(Long v) { r.id = v; return this; }
        public Builder problemId(Long v) { r.problemId = v; return this; }
        public Builder problemTitle(String v) { r.problemTitle = v; return this; }
        public Builder problemTopic(String v) { r.problemTopic = v; return this; }
        public Builder problemDifficulty(String v) { r.problemDifficulty = v; return this; }
        public Builder revisionDate(LocalDate v) { r.revisionDate = v; return this; }
        public Builder status(Revision.RevisionStatus v) { r.status = v; return this; }
        public Builder dayOffset(Integer v) { r.dayOffset = v; return this; }
        public RevisionResponse build() { return r; }
    }
}
