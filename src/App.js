import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import './Common.css';
import BackgroundManager from './Components/BackgroundManager';
import AppRoutes from './Route';
import { Method, API } from "./config/Init.js";

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
  useEffect(() => {
    const initApp = async () => {
      let bgimgs = [];
      const status = Method.checkLoginStatus();
      if (status && status.status === 200) {
        const res = await API.LoginData();
        if (res && res.bgimgs) {
          bgimgs = res.bgimgs;
        }
      } else {
        const res = await API.fetchBackground();
        if (res && res.status === 200 && res.data) {
          bgimgs = res.data.filter(img => img.status === 1).map(img => img.url);
          Method.setCookie("backgroundimgs", bgimgs, 30);
        }
      }
      
      if (bgimgs && Array.isArray(bgimgs)) {
        bgimgs.forEach((imgUrl) => {
          const img = new Image();
          img.src = imgUrl;
        });
      }
    };
    initApp();
  }, []);
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

