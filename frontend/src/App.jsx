// frontend/src/App.jsx (Updated file contents)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UploadForm from './pages/UploadForm';
import MissingPersonsRegistry from './pages/MissingPersonsRegistry'; // Import the new registry file

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadForm />} />
          <Route path="registry" element={<MissingPersonsRegistry />} /> {/* New Route */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;