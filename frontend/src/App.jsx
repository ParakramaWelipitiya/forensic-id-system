// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UploadForm from './pages/UploadForm';
import MissingPersonsRegistry from './pages/MissingPersonsRegistry';
import Login from './pages/Login';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />

        {/* Protected Application Portal Shell */}
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadForm />} />
          <Route path="registry" element={<MissingPersonsRegistry />} />
        </Route>

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;