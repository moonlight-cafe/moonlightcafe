import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import './App.css';
import './Common.css';

import BackgroundManager from './Components/BackgroundManager';
import AppRoutes from './Route';

function App() {
  return (
    <Router>
      <BackgroundManager />
      <AppRoutes />
    </Router>
  );
}

export default App;
