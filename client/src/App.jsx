
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Formulario from './pages/Formulario';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/formulario" element={<Formulario />} /> {/* ✅ Nueva ruta */}
      </Routes>
    </Router>
  );
}

export default App;
