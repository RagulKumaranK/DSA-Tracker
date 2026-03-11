import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import TopNavbar from './components/TopNavbar';
import Dashboard from './pages/Dashboard';
import ProblemsList from './pages/ProblemsList';
import AddProblem from './pages/AddProblem';
import ProblemDetail from './pages/ProblemDetail';
import EditProblem from './pages/EditProblem';
import Revisions from './pages/Revisions';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1c2128',
            color: '#e6edf3',
            border: '1px solid #30363d',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
          },
        }}
      />
      <div className="app-layout">
        <TopNavbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/problems" element={<ProblemsList />} />
            <Route path="/problems/add" element={<AddProblem />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
            <Route path="/problems/:id/edit" element={<EditProblem />} />
            <Route path="/revisions" element={<Revisions />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
