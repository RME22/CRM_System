import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import ProjectLifecycle from './pages/Projects';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import Stakeholders from './pages/Clients';
import CreateStakeholder from './pages/CreateClient';
import StakeholderDetails from './pages/StakeholderDetails';
import PursuitTracker from './pages/Activities';
import CreatePursuit from './pages/CreateActivity';
import PursuitDetails from './pages/ActivityDetails';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import G0Assessment from './pages/G0Assessment';
import TeamWorkload from './pages/TeamWorkload';
import EditProject from './pages/EditProject';
import EditStakeholder from './pages/EditClient';
import EditPursuit from './pages/EditActivity';
import AuditLogs from './pages/AuditLogs';
import PendingRequests from './pages/PendingRequests';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Home />} />
            <Route path="projects" element={<ProjectLifecycle />} />
            <Route path="projects/create" element={<CreateProject />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="projects/:id/edit" element={<EditProject />} />
            <Route path="projects/:projectId/g0" element={<G0Assessment />} />
            <Route path="clients" element={<Stakeholders />} />
            <Route path="clients/create" element={<CreateStakeholder />} />
            <Route path="clients/:id" element={<StakeholderDetails />} />
            <Route path="clients/:id/edit" element={<EditStakeholder />} />
            <Route path="activities" element={<PursuitTracker />} />
            <Route path="activities/create" element={<CreatePursuit />} />
            <Route path="activities/:id" element={<PursuitDetails />} />
            <Route path="activities/:id/edit" element={<EditPursuit />} />
            <Route path="reports" element={<Reports />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="pending-requests" element={<PendingRequests />} />
            <Route path="team" element={<TeamWorkload />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
