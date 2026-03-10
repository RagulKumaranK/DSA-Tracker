package com.dsa.tracker.dto;

import java.util.Map;

public class DashboardStats {
    private long totalProblems;
    private long easyCount;
    private long mediumCount;
    private long hardCount;
    private long todayRevisionCount;
    private long pendingRevisionCount;
    private Map<String, Long> topicBreakdown;

    public long getTotalProblems() { return totalProblems; }
    public void setTotalProblems(long totalProblems) { this.totalProblems = totalProblems; }

    public long getEasyCount() { return easyCount; }
    public void setEasyCount(long easyCount) { this.easyCount = easyCount; }

    public long getMediumCount() { return mediumCount; }
    public void setMediumCount(long mediumCount) { this.mediumCount = mediumCount; }

    public long getHardCount() { return hardCount; }
    public void setHardCount(long hardCount) { this.hardCount = hardCount; }

    public long getTodayRevisionCount() { return todayRevisionCount; }
    public void setTodayRevisionCount(long todayRevisionCount) { this.todayRevisionCount = todayRevisionCount; }

    public long getPendingRevisionCount() { return pendingRevisionCount; }
    public void setPendingRevisionCount(long pendingRevisionCount) { this.pendingRevisionCount = pendingRevisionCount; }

    public Map<String, Long> getTopicBreakdown() { return topicBreakdown; }
    public void setTopicBreakdown(Map<String, Long> topicBreakdown) { this.topicBreakdown = topicBreakdown; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final DashboardStats d = new DashboardStats();
        public Builder totalProblems(long v) { d.totalProblems = v; return this; }
        public Builder easyCount(long v) { d.easyCount = v; return this; }
        public Builder mediumCount(long v) { d.mediumCount = v; return this; }
        public Builder hardCount(long v) { d.hardCount = v; return this; }
        public Builder todayRevisionCount(long v) { d.todayRevisionCount = v; return this; }
        public Builder pendingRevisionCount(long v) { d.pendingRevisionCount = v; return this; }
        public Builder topicBreakdown(Map<String, Long> v) { d.topicBreakdown = v; return this; }
        public DashboardStats build() { return d; }
    }
}
