import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScannerView from './components/Scanner/ScannerView';
import DashboardView from './components/Dashboard/DashboardView';
import GeneratorView from './components/Generator/GeneratorView';
import Navigation from './components/Navigation/Navigation';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<ScannerView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/generator" element={<GeneratorView />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;
