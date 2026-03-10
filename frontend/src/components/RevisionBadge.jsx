import { format, isToday, isPast } from 'date-fns';

export default function RevisionBadge({ revision, onMarkDone }) {
  const revDate = new Date(revision.revisionDate);
  const overdue = isPast(revDate) && !isToday(revDate) && revision.status === 'PENDING';

  return (
    <div className={`revision-card${overdue ? ' overdue' : isToday(revDate) ? ' today' : ''}`}>
      <div className="badge badge-day" style={{ minWidth: 60, justifyContent: 'center' }}>
        Day {revision.dayOffset}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{revision.problemTitle}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
          {revision.problemTopic} • {format(revDate, 'MMM d, yyyy')}
          {overdue && <span style={{ color: 'var(--hard)', marginLeft: 8 }}>Overdue</span>}
          {isToday(revDate) && <span style={{ color: 'var(--accent-orange)', marginLeft: 8 }}>Today!</span>}
        </div>
      </div>
      <DifficultyPill diff={revision.problemDifficulty} />
      {revision.status === 'PENDING' && (
        <button className="btn btn-success" style={{ fontSize: '0.75rem', padding: '4px 12px' }}
          onClick={(e) => { e.stopPropagation(); onMarkDone(revision.id); }}>
          ✓ Done
        </button>
      )}
      {revision.status === 'DONE' && (
        <span className="badge badge-done">✓ Done</span>
      )}
    </div>
  );
}

function DifficultyPill({ diff }) {
  const map = { EASY: 'badge-easy', MEDIUM: 'badge-medium', HARD: 'badge-hard' };
  return <span className={`badge ${map[diff] || ''}`} style={{ whiteSpace: 'nowrap' }}>{diff}</span>;
}
