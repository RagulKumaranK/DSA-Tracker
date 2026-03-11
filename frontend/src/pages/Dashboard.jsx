import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { getDashboardStats, getTodayRevisions, markRevisionDone, getProblems } from '../api/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [todayRevisions, setTodayRevisions] = useState([]);
  const [activeDates, setActiveDates] = useState(new Set());
  const [recentProblems, setRecentProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getDashboardStats(), getTodayRevisions(), getProblems({})])
      .then(([statsRes, revRes, probRes]) => {
        setStats(statsRes.data);
        setTodayRevisions(revRes.data);
        
        // Extract unique dates for the calendar heatmap
        const dates = new Set();
        // Also get the 5 most recent problems
        const sortedProbs = [...probRes.data].sort((a, b) => new Date(b.dateSolved || 0) - new Date(a.dateSolved || 0));
        setRecentProblems(sortedProbs.slice(0, 5));

        probRes.data.forEach(p => {
          if (p.dateSolved) {
            dates.add(format(parseISO(p.dateSolved), 'yyyy-MM-dd'));
          }
        });
        setActiveDates(dates);
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

  // Calendar Logic
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDayOfWeek = monthStart.getDay(); // 0 is Sunday
  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/problems/add')}>
          + Add Problem
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* Left Column (Main) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Study Plan Banners (Mock) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #007aff 0%, #00af9b 100%)', 
              borderRadius: '8px', padding: '1.5rem', color: '#fff', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', justifyContent: 'center'
            }} onClick={() => navigate('/problems')}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Top DSA Questions</h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '1rem' }}>Master the most frequently asked patterns</p>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, width: 'fit-content' }}>
                Start Learning
              </div>
            </div>
            
            <div style={{ 
              background: 'linear-gradient(135deg, #ffa116 0%, #ff2d55 100%)', 
              borderRadius: '8px', padding: '1.5rem', color: '#fff', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', justifyContent: 'center'
            }} onClick={() => navigate('/revisions')}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Spaced Repetition</h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '1rem' }}>Review problems before you forget them</p>
              <div style={{ background: '#fff', color: '#ff5416', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content' }}>
                View Pending Revisions
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
            {[
              { label: 'Total Solved', value: stats?.totalProblems ?? 0, color: '#fff' },
              { label: 'Easy', value: stats?.easyCount ?? 0, color: 'var(--easy)' },
              { label: 'Medium', value: stats?.mediumCount ?? 0, color: 'var(--medium)' },
              { label: 'Hard', value: stats?.hardCount ?? 0, color: 'var(--hard)' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                className="stat-card"
                style={{ alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 600, color: s.color }}>{s.value}</span>
              </motion.div>
            ))}
          </div>

          {/* Today's Revision Alert */}
          {todayRevisions.length > 0 && (
            <div className="alert-banner" style={{ marginBottom: 0 }}>
              <span style={{ fontSize: '1.2rem' }}>⏰</span>
              <span><strong>{todayRevisions.length} problem{todayRevisions.length > 1 ? 's' : ''}</strong> need revision today!</span>
            </div>
          )}

          {/* Today's Revisions Content */}
          {todayRevisions.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>📅 Today&apos;s Revisions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {todayRevisions.map((r) => (
                  <div key={r.id} className="revision-card today" style={{ cursor: 'pointer' }} onClick={() => navigate(`/problems/${r.problemId}`)}>
                    <div className="badge badge-day" style={{ minWidth: 60, justifyContent: 'center' }}>Day {r.dayOffset}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.problemTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.problemTopic}</div>
                    </div>
                    <button className="btn btn-success" style={{ fontSize: '0.75rem', padding: '4px 12px' }} onClick={(e) => { e.stopPropagation(); handleMarkDone(r.id); }}>✓ Done</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats?.totalProblems === 0 ? (
            <div className="empty-state" style={{ background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h3>No problems yet 💡</h3>
              <p>Start by adding your first solved DSA problem!</p>
              <button className="btn btn-primary" style={{ margin: '1rem auto', display: 'flex' }} onClick={() => navigate('/problems/add')}>
                + Add Your First Problem
              </button>
            </div>
          ) : (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>📝 Recent Submissions</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-orange)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/problems')}>View All</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentProblems.map((p) => (
                  <div key={p.id} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '0.75rem 0', borderBottom: '1px solid var(--border)', cursor: 'pointer'
                  }} onClick={() => navigate(`/problems/${p.id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{p.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="tag" style={{ fontSize: '0.65rem' }}>{p.topic}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {p.dateSolved ? format(new Date(p.dateSolved), 'MMM d') : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column (Sidebar) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Calendar Heatmap Widget */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{format(today, 'MMM yyyy')} Calendar</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(0, 175, 155, 0.15)', color: 'var(--easy)', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>
                {activeDates.size} days active
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
              {weekDays.map(d => <div key={d} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{d}</div>)}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {blanks.map(b => <div key={`blank-${b}`} style={{ aspectRatio: '1/1' }} />)}
              {daysInMonth.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isActive = activeDates.has(dateStr);
                const isCurrentDay = isToday(day);
                return (
                  <div key={dateStr} style={{ 
                    aspectRatio: '1/1', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 600,
                    borderRadius: '50%',
                    background: isActive ? 'rgba(0, 175, 155, 0.2)' : 'transparent',
                    color: isActive ? 'var(--easy)' : isCurrentDay ? '#fff' : 'var(--text-secondary)',
                    border: isCurrentDay ? '1px solid var(--accent-orange)' : '1px solid transparent',
                    cursor: 'default'
                  }}>
                    {format(day, 'd')}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topic Breakdown */}
          {topicEntries.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Topic Mastery
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topicEntries.sort((a, b) => b[1] - a[1]).map(([topic, count]) => (
                  <div key={topic}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{topic}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{count}</span>
                    </div>
                    <div className="progress-bar-track" style={{ height: '5px' }}>
                      <div className="progress-bar-fill" style={{ width: `${(count / maxTopicCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
