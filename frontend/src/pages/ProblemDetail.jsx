import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { format, isPast, isToday } from 'date-fns';
import { getProblem, getRevisionsByProblem, markRevisionDone, deleteProblem } from '../api/api';
import DifficultyBadge from '../components/DifficultyBadge';

/* ---- helper: classify what kind of line this is ---- */
function classifyLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return 'empty';

  // Explicit bullet / numbered list item
  if (/^\s*[-*•]\s/.test(line) || /^\s*\d+[.)]\s/.test(line))
    return 'bullet';

  // Heading: short line ending with ':'  (e.g. "Logic:", "Calculate:")
  if (trimmed.endsWith(':') && trimmed.length <= 60)
    return 'heading';

  // Heading: very short standalone word/phrase (≤ 2 words, no operators)
  if (trimmed.split(/\s+/).length <= 2 && !/[=<>;{}\[\]()]/.test(trimmed) && /^[A-Z]/.test(trimmed))
    return 'heading';

  // Code-like: contains assignment, semicolons, array access, or math operators with variables
  if (/[=;{}\[\]]/.test(trimmed) && /[a-zA-Z]/.test(trimmed))
    return 'code';

  // Code-like: starts with operators like + or looks like a code continuation
  if (/^\s*[+\-*/]/.test(line) && trimmed.length < 40)
    return 'code';

  return 'text';
}

/* ---- inline formatting: detect `code`, **bold**, and auto-highlight code tokens ---- */
function renderInlineFormatting(text) {
  // First: split by backtick-wrapped code
  const parts = text.split(/(`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    // bold **text**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/);
    return boldParts.map((bp, j) => {
      if (bp.startsWith('**') && bp.endsWith('**')) {
        return <strong key={`${i}-${j}`}>{bp.slice(2, -2)}</strong>;
      }
      return <span key={`${i}-${j}`}>{bp}</span>;
    });
  });
}

/* ---- main formatted text component ---- */
function FormattedText({ text }) {
  if (!text) return null;

  const allLines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < allLines.length) {
    const line = allLines[i];
    const type = classifyLine(line);
    const trimmed = line.trim();

    if (type === 'empty') {
      // skip empty lines (they create natural spacing via CSS gaps)
      i++;
      continue;
    }

    if (type === 'heading') {
      elements.push(
        <div key={i} className="notes-heading">
          {trimmed.endsWith(':') ? trimmed : trimmed}
        </div>
      );
      i++;
      continue;
    }

    if (type === 'code') {
      // Gather consecutive code lines into a single code block
      const codeLines = [];
      while (i < allLines.length) {
        const ct = classifyLine(allLines[i]);
        if (ct === 'code' || ct === 'empty') {
          codeLines.push(allLines[i]);
          i++;
        } else break;
      }
      // Trim trailing empty lines
      while (codeLines.length && !codeLines[codeLines.length - 1].trim()) codeLines.pop();
      elements.push(
        <pre key={`code-${i}`} className="notes-code-block">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    if (type === 'bullet') {
      // Gather consecutive bullet items
      const items = [];
      while (i < allLines.length) {
        const bt = classifyLine(allLines[i]);
        if (bt === 'bullet') {
          items.push(allLines[i].trim().replace(/^\s*[-*•]\s*/, '').replace(/^\s*\d+[.)]\s*/, ''));
          i++;
        } else if (bt === 'empty') {
          i++;
        } else break;
      }
      elements.push(
        <ul key={`list-${i}`} className="notes-list">
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // type === 'text' → regular step/point
    // Gather consecutive text lines as individual step points
    const steps = [];
    while (i < allLines.length) {
      const tt = classifyLine(allLines[i]);
      if (tt === 'text') {
        steps.push(allLines[i].trim());
        i++;
      } else if (tt === 'empty') {
        i++;
        break; // paragraph break
      } else break;
    }
    if (steps.length === 1) {
      // Single text line → render as a simple paragraph
      elements.push(
        <p key={`p-${i}`} className="notes-para">
          {renderInlineFormatting(steps[0])}
        </p>
      );
    } else {
      // Multiple text lines → render as step points
      elements.push(
        <ul key={`steps-${i}`} className="notes-steps">
          {steps.map((step, idx) => (
            <li key={idx}>{renderInlineFormatting(step)}</li>
          ))}
        </ul>
      );
    }
  }

  return <div className="formatted-text">{elements}</div>;
}

export default function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(-1);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = useCallback(async (code) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success('Code copied!');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Copy failed');
      }
      document.body.removeChild(textarea);
    }
  }, []);

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

  const currentSolution = activeTab === -1 
    ? { title: 'Main Solution', approach: problem.approach, code: problem.code, language: problem.codeLanguage }
    : problem.alternateSolutions[activeTab];

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

      {/* Detail Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card notes-card">
          <h3 className="section-label">
            💡 Approach ({currentSolution?.title || 'Main'})
          </h3>
          {currentSolution?.approach ? (
            <FormattedText text={currentSolution.approach} />
          ) : (
            <p className="empty-text">No approach recorded for this solution.</p>
          )}
        </div>

        <div className="card notes-card">
          <h3 className="section-label">
            📝 Overall Notes
          </h3>
          {problem.notes ? (
            <FormattedText text={problem.notes} />
          ) : (
            <p className="empty-text">No notes recorded.</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      {(problem.alternateSolutions && problem.alternateSolutions.length > 0) && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '4px' }}>
          <button 
            className={`btn ${activeTab === -1 ? 'btn-primary' : 'btn-ghost'}`}
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => setActiveTab(-1)}
          >
            💻 Main Solution
          </button>
          {problem.alternateSolutions.map((sol, idx) => (
            <button key={idx}
              className={`btn ${activeTab === idx ? 'btn-primary' : 'btn-ghost'}`}
              style={{ whiteSpace: 'nowrap' }}
              onClick={() => setActiveTab(idx)}
            >
              💻 {sol.title || `Solution ${idx + 2}`}
            </button>
          ))}
        </div>
      )}

      {/* Code Viewer (Full Width) */}
      <div className="code-container" style={{ width: '100%', marginBottom: '2rem' }}>
        <div className="code-header">
          <span style={{ fontWeight: 600 }}>{currentSolution?.title || 'Solution Code'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-day">{currentSolution?.language || 'java'}</span>
            {currentSolution?.code && (
              <button
                className="copy-btn"
                onClick={() => handleCopyCode(currentSolution.code)}
                title="Copy code"
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        {currentSolution?.code ? (
          <Editor
            height="500px"
            language={currentSolution.language || 'java'}
            value={currentSolution.code}
            theme="vs-dark"
            options={{
              readOnly: true,
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              fontFamily: 'JetBrains Mono, monospace',
              padding: { top: 16, bottom: 16 },
              lineNumbers: 'on',
              automaticLayout: true,
              domReadOnly: true,
              cursorStyle: 'line',
            }}
          />
        ) : (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#1e1e1e', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No code saved for this solution.
          </div>
        )}
      </div>
    </div>
  );
}
