import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { getProblem, updateProblem } from '../api/api';

const LANGUAGES = ['java', 'python', 'cpp', 'c', 'javascript', 'typescript', 'go', 'rust'];
const TOPICS = ['Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Trees', 'Binary Search',
  'Dynamic Programming', 'Graphs', 'Greedy', 'Backtracking', 'Hashing', 'Two Pointers',
  'Sliding Window', 'Recursion', 'Bit Manipulation', 'Math', 'Sorting', 'Heap', 'Trie'];

export default function EditProblem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProblem(id)
      .then((res) => {
        const p = res.data;
        setForm({
          title: p.title || '',
          problemLink: p.problemLink || '',
          topic: p.topic || '',
          difficulty: p.difficulty || 'MEDIUM',
          approach: p.approach || '',
          notes: p.notes || '',
          code: p.code || '',
          codeLanguage: p.codeLanguage || 'java',
          dateSolved: p.dateSolved || format(new Date(), 'yyyy-MM-dd'),
        });
      })
      .catch(() => toast.error('Failed to load problem'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      await updateProblem(id, form);
      toast.success('Problem updated!');
      navigate(`/problems/${id}`);
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Edit Problem</h2>
          <p className="page-subtitle">Update your solution details</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate(`/problems/${id}`)}>← Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div className="card">
              <div className="form-group">
                <label className="form-label">Problem Title *</label>
                <input className="input" value={form.title} onChange={handleChange('title')} />
              </div>
              <div className="form-group">
                <label className="form-label">Problem Link</label>
                <input className="input" value={form.problemLink} onChange={handleChange('problemLink')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Topic *</label>
                  <select className="select" value={form.topic} onChange={handleChange('topic')}>
                    <option value="">Select topic</option>
                    {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                    <option value={form.topic}>{form.topic}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty *</label>
                  <select className="select" value={form.difficulty} onChange={handleChange('difficulty')}>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Date Solved</label>
                <input type="date" className="input" value={form.dateSolved} onChange={handleChange('dateSolved')} />
              </div>
              <div className="form-group">
                <label className="form-label">Approach</label>
                <textarea className="textarea" value={form.approach} onChange={handleChange('approach')} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Notes</label>
                <textarea className="textarea" value={form.notes} onChange={handleChange('notes')} />
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="code-header">
                <span style={{ fontWeight: 600 }}>Solution Code</span>
                <select className="select" style={{ width: 'auto', fontSize: '0.78rem', padding: '3px 28px 3px 10px' }}
                  value={form.codeLanguage} onChange={handleChange('codeLanguage')}>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
              </div>
              <Editor
                height="650px"
                language={form.codeLanguage}
                value={form.code}
                onChange={(val) => setForm((f) => ({ ...f, code: val || '' }))}
                theme="vs-dark"
                options={{
                  fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false,
                  wordWrap: 'on', fontFamily: 'JetBrains Mono, monospace',
                  padding: { top: 16 }, lineNumbers: 'on', automaticLayout: true,
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(`/problems/${id}`)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : '✓ Update Problem'}
          </button>
        </div>
      </form>
    </div>
  );
}
