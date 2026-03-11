package com.dsa.tracker.dto;

public class SolutionDetails {
    private String title;      // e.g. "Brute Force", "Optimal Approach"
    private String approach;   // Explanation for this specific solution
    private String code;       // The code implementation
    private String codeLanguage; // e.g. "java", "cpp"

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getApproach() { return approach; }
    public void setApproach(String approach) { this.approach = approach; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getCodeLanguage() { return codeLanguage; }
    public void setCodeLanguage(String codeLanguage) { this.codeLanguage = codeLanguage; }
}
