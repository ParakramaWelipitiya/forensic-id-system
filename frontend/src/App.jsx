// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadForm from './pages/UploadForm';
import MissingPersonsRegistry from './pages/MissingPersonsRegistry';
import RecycleBin from './pages/RecycleBin'; // Updated import

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadForm />} />
          <Route path="registry" element={<MissingPersonsRegistry />} />
          <Route path="recycle-bin" element={<RecycleBin />} /> {/* Updated route */}
        </Route>
      </Routes>
    </Router>
  );
}