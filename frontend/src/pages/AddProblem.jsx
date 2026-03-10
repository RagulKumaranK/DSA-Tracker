import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { createProblem } from '../api/api';
import { format } from 'date-fns';

const LANGUAGES = ['java', 'python', 'cpp', 'c', 'javascript', 'typescript', 'go', 'rust'];
const TOPICS = ['Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Trees', 'Binary Search',
  'Dynamic Programming', 'Graphs', 'Greedy', 'Backtracking', 'Hashing', 'Two Pointers',
  'Sliding Window', 'Recursion', 'Bit Manipulation', 'Math', 'Sorting', 'Heap', 'Trie'];

export default function AddProblem() {
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [form, setForm] = useState({
    title: '',
    problemLink: '',
    topic: '',
    difficulty: 'MEDIUM',
    approach: '',
    notes: '',
    code: '',
    codeLanguage: 'java',
    dateSolved: today,
  });
  const [loading, setLoading] = useState(false);
  const [customTopic, setCustomTopic] = useState(false);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.topic.trim()) return toast.error('Topic is required');
    setLoading(true);
    try {
      await createProblem(form);
      toast.success('Problem added! Revisions scheduled 🎉');
      navigate('/problems');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Add Problem</h2>
          <p className="page-subtitle">Record a newly solved DSA problem</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/problems')}>← Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Left */}
          <div>
            <div className="card">
              <div className="form-group">
                <label className="form-label">Problem Title *</label>
                <input className="input" placeholder="e.g. Two Sum" value={form.title} onChange={handleChange('title')} />
              </div>

              <div className="form-group">
                <label className="form-label">LeetCode / Problem Link</label>
                <input className="input" placeholder="https://leetcode.com/problems/..." value={form.problemLink} onChange={handleChange('problemLink')} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Topic *</label>
                  {customTopic ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input className="input" placeholder="Custom topic" value={form.topic} onChange={handleChange('topic')} />
                      <button type="button" className="btn btn-ghost" style={{ whiteSpace: 'nowrap' }} onClick={() => setCustomTopic(false)}>List</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select className="select" style={{ flex: 1 }} value={form.topic} onChange={handleChange('topic')}>
                        <option value="">Select topic</option>
                        {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button type="button" className="btn btn-ghost" style={{ whiteSpace: 'nowrap' }} onClick={() => setCustomTopic(true)}>Custom</button>
                    </div>
                  )}
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
                <label className="form-label">Date Solved *</label>
                <input type="date" className="input" value={form.dateSolved} onChange={handleChange('dateSolved')} />
              </div>

              <div className="form-group">
                <label className="form-label">Approach / Strategy</label>
                <textarea className="textarea" placeholder="Describe your approach, e.g. Used HashMap for O(n) lookup..."
                  value={form.approach} onChange={handleChange('approach')} style={{ minHeight: 100 }} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Notes / Observations</label>
                <textarea className="textarea" placeholder="Edge cases, mistakes made, key insights..."
                  value={form.notes} onChange={handleChange('notes')} style={{ minHeight: 80 }} />
              </div>
            </div>
          </div>

          {/* Right - Code Editor */}
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
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  fontFamily: 'JetBrains Mono, monospace',
                  padding: { top: 16, bottom: 16 },
                  lineNumbers: 'on',
                  automaticLayout: true,
                }}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/problems')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : '✓ Save Problem'}
          </button>
        </div>
      </form>
    </div>
  );
}
