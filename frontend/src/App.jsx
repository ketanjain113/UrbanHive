import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GreenCorridorPage from './pages/GreenCorridorPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/emergency-corridor" element={<GreenCorridorPage />} />
    </Routes>
  );
}

export default App;
