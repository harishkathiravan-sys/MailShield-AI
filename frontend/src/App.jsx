import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AnalyzerPage from './pages/AnalyzerPage';
import EmailSourceAnalyzer from './pages/EmailSourceAnalyzer';
import ResultsPage from './pages/ResultsPage';
import SandboxReportPage from './pages/SandboxReportPage';
import DashboardPage from './pages/DashboardPage';
import CyberBackground from './components/background/CyberBackground';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        {/* Interactive WebGL Background */}
        <CyberBackground />
        
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyze" element={<AnalyzerPage />} />
          <Route path="/email-source" element={<EmailSourceAnalyzer />} />
          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="/sandbox-report/:id" element={<SandboxReportPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#1f2937',
              border: '1px solid #d1d5db',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
