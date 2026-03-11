import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProblems, deleteProblem, getTopics } from '../api/api';
import DifficultyBadge from '../components/DifficultyBadge';
import { format } from 'date-fns';

export default function ProblemsList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [filters, setFilters] = useState({ search: '', topic: '', difficulty: '' });
  const navigate = useNavigate();
  const searchRef = useRef();

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await getProblems({
        search: filters.search || undefined,
        topic: filters.topic || undefined,
        difficulty: filters.difficulty || undefined,
      });
      setProblems(res.data);
    } catch {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTopics().then((r) => setTopics(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchProblems, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this problem?')) return;
    try {
      await deleteProblem(id);
      setProblems((prev) => prev.filter((p) => p.id !== id));
      toast.success('Problem deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Problems</h2>
          <p className="page-subtitle">{problems.length} problems solved</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/problems/add')}>+ Add Problem</button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          ref={searchRef}
          className="input"
          style={{ maxWidth: 260 }}
          placeholder="🔍  Search by title..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select
          className="select"
          value={filters.topic}
          onChange={(e) => setFilters((f) => ({ ...f, topic: e.target.value }))}
        >
          <option value="">All Topics</option>
          {topics.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="select"
          value={filters.difficulty}
          onChange={(e) => setFilters((f) => ({ ...f, difficulty: e.target.value }))}
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        {(filters.search || filters.topic || filters.difficulty) && (
          <button className="btn btn-ghost"
            onClick={() => setFilters({ search: '', topic: '', difficulty: '' })}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : problems.length === 0 ? (
        <div className="empty-state">
          <h3>No problems found</h3>
          <p>Try adjusting your filters or add a new problem.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem 0.5rem', width: '3%' }}></th>
                <th style={{ padding: '0.75rem 1rem' }}>Title</th>
                <th style={{ padding: '0.75rem 1rem', width: '20%' }}>Review Topics</th>
                <th style={{ padding: '0.75rem 1rem', width: '15%' }}>Difficulty</th>
                <th style={{ padding: '0.75rem 1rem', width: '15%' }}>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p, i) => (
                <tr key={p.id} onClick={() => navigate(`/problems/${p.id}`)} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.875rem 0.5rem', textAlign: 'center' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--accent-teal)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
                        {i + 1}. {p.title}
                      </span>
                      {p.problemLink && (
                        <a href={p.problemLink} target="_blank" rel="noreferrer"
                          style={{ color: 'var(--text-muted)' }}
                          title="View on LeetCode"
                          onClick={(e) => e.stopPropagation()}>
                          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </a>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}><span className="tag" style={{ fontSize: '0.7rem' }}>{p.topic}</span></td>
                  <td style={{ padding: '0.875rem 1rem', color: `var(--${p.difficulty.toLowerCase()})`, fontSize: '0.85rem' }}>
                    {p.difficulty === 'MEDIUM' ? 'Med.' : p.difficulty === 'EASY' ? 'Easy' : 'Hard'}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {p.dateSolved ? format(new Date(p.dateSolved), 'MMM d, yyyy') : '—'}
                  </td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={(e) => handleDelete(e, p.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
