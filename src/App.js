import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import './Common.css';
import BackgroundManager from './Components/BackgroundManager';
import AppRoutes from './Route';
import { Method } from "./config/Init.js";

function AppLoader() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      {Method.showLoader()}
    </div>
  );
}

function App() {
  return (
    <Router>
      <BackgroundManager />
      <Suspense fallback={<AppLoader />}>
        <AppRoutes />
      </Suspense>
    </Router>
  );
}

export default App;

