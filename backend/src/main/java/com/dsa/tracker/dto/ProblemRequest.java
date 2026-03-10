package com.dsa.tracker.dto;

import com.dsa.tracker.entity.Problem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ProblemRequest {

    @NotBlank(message = "Title is required")
    private String title;
    private String problemLink;

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotNull(message = "Difficulty is required")
    private Problem.Difficulty difficulty;

    private String approach;
    private String notes;
    private String code;
    private String codeLanguage = "java";

    @NotNull(message = "Date solved is required")
    private LocalDate dateSolved;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getProblemLink() { return problemLink; }
    public void setProblemLink(String problemLink) { this.problemLink = problemLink; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public Problem.Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Problem.Difficulty difficulty) { this.difficulty = difficulty; }

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
}
