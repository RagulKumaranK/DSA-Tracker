import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getDashboardStats, getTodayRevisions, markRevisionDone } from '../api/api';
import { format } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [todayRevisions, setTodayRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getDashboardStats(), getTodayRevisions()])
      .then(([statsRes, revRes]) => {
        setStats(statsRes.data);
        setTodayRevisions(revRes.data);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkDone = async (id) => {
    try {
      await markRevisionDone(id);
      setTodayRevisions((prev) => prev.filter((r) => r.id !== id));
      toast.success('Revision marked as done!');
    } catch {
      toast.error('Failed to update revision');
    }
  };

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }

  const topicEntries = stats?.topicBreakdown ? Object.entries(stats.topicBreakdown) : [];
  const maxTopicCount = topicEntries.reduce((a, [, c]) => Math.max(a, c), 1);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/problems/add')}>
          + Add Problem
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Solved', value: stats?.totalProblems ?? 0, color: 'var(--accent-orange)' },
          { label: 'Easy', value: stats?.easyCount ?? 0, color: 'var(--easy)' },
          { label: 'Medium', value: stats?.mediumCount ?? 0, color: 'var(--medium)' },
          { label: 'Hard', value: stats?.hardCount ?? 0, color: 'var(--hard)' },
          { label: "Today's Revisions", value: stats?.todayRevisionCount ?? 0, color: 'var(--accent-blue)' },
          { label: 'Pending Total', value: stats?.pendingRevisionCount ?? 0, color: 'var(--accent-purple)' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <span className="stat-label">{s.label}</span>
            <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Today's Revision Alert */}
      {todayRevisions.length > 0 && (
        <div className="alert-banner">
          <span style={{ fontSize: '1.2rem' }}>⏰</span>
          <span>
            <strong>{todayRevisions.length} problem{todayRevisions.length > 1 ? 's' : ''}</strong> need revision today!
          </span>
        </div>
      )}

      {/* Today's Revisions */}
      {todayRevisions.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            📅 Today&apos;s Revisions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {todayRevisions.map((r) => (
              <div key={r.id} className="revision-card today" style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/problems/${r.problemId}`)}>
                <div className="badge badge-day" style={{ minWidth: 60, justifyContent: 'center' }}>
                  Day {r.dayOffset}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.problemTitle}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.problemTopic}</div>
                </div>
                <button className="btn btn-success" style={{ fontSize: '0.75rem', padding: '4px 12px' }}
                  onClick={(e) => { e.stopPropagation(); handleMarkDone(r.id); }}>
                  ✓ Done
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic Breakdown */}
      {topicEntries.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            📊 Progress by Topic
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topicEntries.sort((a, b) => b[1] - a[1]).map(([topic, count]) => (
              <div key={topic}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{topic}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{count} solved</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${(count / maxTopicCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats?.totalProblems === 0 && (
        <div className="empty-state">
          <h3>No problems yet 💡</h3>
          <p>Start by adding your first solved DSA problem!</p>
          <button className="btn btn-primary" style={{ margin: '1rem auto', display: 'flex' }}
            onClick={() => navigate('/problems/add')}>
            + Add Your First Problem
          </button>
        </div>
      )}
    </div>
  );
}
