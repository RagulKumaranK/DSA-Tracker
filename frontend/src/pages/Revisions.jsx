import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format, isPast, isToday, isFuture } from 'date-fns';
import { getPendingRevisions, getUpcomingRevisions, markRevisionDone } from '../api/api';

export default function Revisions() {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('pending'); // 'pending' | 'upcoming'
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const fn = view === 'upcoming' ? getUpcomingRevisions : getPendingRevisions;
      const res = await fn();
      setRevisions(res.data);
    } catch { toast.error('Failed to load revisions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [view]);

  const handleMarkDone = async (id) => {
    try {
      await markRevisionDone(id);
      setRevisions((prev) => prev.filter((r) => r.id !== id));
      toast.success('Marked as done!');
    } catch { toast.error('Failed'); }
  };

  const grouped = revisions.reduce((acc, rev) => {
    const d = new Date(rev.revisionDate);
    let group = 'Upcoming';
    if (rev.status === 'DONE') group = 'Done';
    else if (isPast(d) && !isToday(d)) group = 'Overdue';
    else if (isToday(d)) group = 'Today';
    (acc[group] = acc[group] || []).push(rev);
    return acc;
  }, {});

  const groupOrder = ['Overdue', 'Today', 'Upcoming', 'Done'];
  const groupColors = {
    Overdue: 'var(--hard)',
    Today: 'var(--accent-orange)',
    Upcoming: 'var(--accent-blue)',
    Done: 'var(--accent-teal)',
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Revisions</h2>
          <p className="page-subtitle">
            {revisions.length} {view === 'pending' ? 'pending' : 'upcoming'} revision{revisions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn ${view === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('pending')}>All Pending</button>
          <button className={`btn ${view === 'upcoming' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('upcoming')}>Next 30 Days</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : revisions.length === 0 ? (
        <div className="empty-state">
          <h3>🎉 All caught up!</h3>
          <p>No pending revisions. Great work!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {groupOrder.filter(g => grouped[g]).map(group => (
            <div key={group}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: groupColors[group],
                  textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {group === 'Overdue' ? '⚠️' : group === 'Today' ? '⏰' : group === 'Done' ? '✓' : '📅'} {group}
                </span>
                <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                  {grouped[group].length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {grouped[group].map((rev) => (
                  <div key={rev.id}
                    className={`revision-card${isPast(new Date(rev.revisionDate)) && !isToday(new Date(rev.revisionDate)) && rev.status !== 'DONE' ? ' overdue' : isToday(new Date(rev.revisionDate)) ? ' today' : ''}`}
                    onClick={() => navigate(`/problems/${rev.problemId}`)}
                    style={{ cursor: 'pointer' }}>
                    <div className="badge badge-day" style={{ minWidth: 64, justifyContent: 'center' }}>
                      Day {rev.dayOffset}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{rev.problemTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {rev.problemTopic} · {format(new Date(rev.revisionDate), 'EEEE, MMM d yyyy')}
                      </div>
                    </div>
                    <span className={`badge ${rev.problemDifficulty === 'EASY' ? 'badge-easy' : rev.problemDifficulty === 'MEDIUM' ? 'badge-medium' : 'badge-hard'}`}>
                      {rev.problemDifficulty}
                    </span>
                    {rev.status === 'PENDING' && (
                      <button className="btn btn-success" style={{ fontSize: '0.75rem', padding: '5px 14px', whiteSpace: 'nowrap' }}
                        onClick={(e) => { e.stopPropagation(); handleMarkDone(rev.id); }}>
                        ✓ Done
                      </button>
                    )}
                    {rev.status === 'DONE' && (
                      <span className="badge badge-done">✓ Done</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
