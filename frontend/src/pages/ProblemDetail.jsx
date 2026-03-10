import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { format, isPast, isToday } from 'date-fns';
import { getProblem, getRevisionsByProblem, markRevisionDone, deleteProblem } from '../api/api';
import DifficultyBadge from '../components/DifficultyBadge';

export default function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProblem(id), getRevisionsByProblem(id)])
      .then(([pRes, rRes]) => {
        setProblem(pRes.data);
        setRevisions(rRes.data);
      })
      .catch(() => toast.error('Failed to load problem'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMarkDone = async (revId) => {
    try {
      const res = await markRevisionDone(revId);
      setRevisions((prev) => prev.map((r) => r.id === revId ? res.data : r));
      toast.success('Revision done!');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this problem and all its revisions?')) return;
    try {
      await deleteProblem(id);
      toast.success('Deleted');
      navigate('/problems');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!problem) return <div className="empty-state"><h3>Problem not found</h3></div>;

  const revisionStatus = (rev) => {
    const d = new Date(rev.revisionDate);
    if (rev.status === 'DONE') return { label: '✓ Done', cls: 'badge-done' };
    if (isToday(d)) return { label: 'Today!', cls: 'badge-medium' };
    if (isPast(d)) return { label: 'Overdue', cls: 'badge-hard' };
    return { label: format(d, 'MMM d'), cls: 'badge-pending' };
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => navigate('/problems')}>←</button>
          <div>
            <h2 className="page-title">{problem.title}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
              <DifficultyBadge difficulty={problem.difficulty} />
              <span className="tag">{problem.topic}</span>
              {problem.dateSolved && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Solved {format(new Date(problem.dateSolved), 'MMM d, yyyy')}
                </span>
              )}
              {problem.problemLink && (
                <a href={problem.problemLink} target="_blank" rel="noreferrer"
                  className="btn btn-ghost" style={{ padding: '3px 10px', fontSize: '0.75rem' }}>
                  ↗ LeetCode
                </a>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate(`/problems/${id}/edit`)}>Edit</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {/* Revision Timeline */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          📅 Revision Schedule
        </h3>
        <div className="revision-timeline">
          {revisions.map((rev) => {
            const st = revisionStatus(rev);
            return (
              <div key={rev.id} className="timeline-item">
                <div className="timeline-day">Day {rev.dayOffset}</div>
                <div className="timeline-date">{format(new Date(rev.revisionDate), 'MMM d, yyyy')}</div>
                <span className={`badge ${st.cls}`} style={{ marginBottom: rev.status === 'PENDING' ? 8 : 0 }}>{st.label}</span>
                {rev.status === 'PENDING' && (
                  <button className="btn btn-success" style={{ width: '100%', marginTop: 6, fontSize: '0.75rem', padding: '4px' }}
                    onClick={() => handleMarkDone(rev.id)}>
                    Mark Done
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Grid */}
      <div className="detail-grid">
        {/* Approach + Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
              💡 Approach
            </h3>
            {problem.approach ? (
              <p style={{ fontSize: '0.875rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{problem.approach}</p>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No approach recorded.</p>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
              📝 Notes
            </h3>
            {problem.notes ? (
              <p style={{ fontSize: '0.875rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{problem.notes}</p>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No notes recorded.</p>
            )}
          </div>
        </div>

        {/* Code Viewer */}
        <div className="code-container">
          <div className="code-header">
            <span style={{ fontWeight: 600 }}>Solution Code</span>
            <span className="badge badge-day">{problem.codeLanguage || 'java'}</span>
          </div>
          {problem.code ? (
            <Editor
              height="650px"
              language={problem.codeLanguage || 'java'}
              value={problem.code}
              theme="vs-dark"
              options={{
                readOnly: true,
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                fontFamily: 'JetBrains Mono, monospace',
                padding: { top: 16 },
                lineNumbers: 'on',
                automaticLayout: true,
                domReadOnly: true,
                cursorStyle: 'line',
              }}
            />
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#1e1e1e', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No code saved for this problem.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
