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
                <th>#</th>
                <th>Title</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Date Solved</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p, i) => (
                <tr key={p.id} onClick={() => navigate(`/problems/${p.id}`)}>
                  <td style={{ color: 'var(--text-muted)', width: 40 }}>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                    {p.problemLink && (
                      <a href={p.problemLink} target="_blank" rel="noreferrer"
                        style={{ fontSize: '0.72rem', color: 'var(--accent-blue)' }}
                        onClick={(e) => e.stopPropagation()}>
                        ↗ LeetCode
                      </a>
                    )}
                  </td>
                  <td><span className="tag">{p.topic}</span></td>
                  <td><DifficultyBadge difficulty={p.difficulty} /></td>
                  <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {p.dateSolved ? format(new Date(p.dateSolved), 'MMM d, yyyy') : '—'}
                  </td>
                  <td style={{ maxWidth: 200 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)',
                      display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.notes || '—'}
                    </span>
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
