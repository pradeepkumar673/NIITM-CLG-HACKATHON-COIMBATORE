import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewStudy } from './pages/NewStudy';
import { LiveStudyAnalysis } from './pages/LiveStudyAnalysis';
import { StudyResult } from './pages/StudyResult';
import { MyStudiesHistory } from './pages/MyStudiesHistory';
import { DoctorReviewQueue } from './pages/DoctorReviewQueue';
import { DoctorReviewSignOff } from './pages/DoctorReviewSignOff';
import { LongitudinalComparison } from './pages/LongitudinalComparison';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/studies/new" element={<NewStudy />} />
      <Route path="/studies/:id/live" element={<LiveStudyAnalysis />} />
      <Route path="/studies/:id" element={<StudyResult />} />
      <Route path="/history" element={<MyStudiesHistory />} />
      <Route path="/queue" element={<DoctorReviewQueue />} />
      <Route path="/review/:id" element={<DoctorReviewSignOff />} />
      <Route path="/compare" element={<LongitudinalComparison />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
