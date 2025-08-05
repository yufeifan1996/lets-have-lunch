import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import PublicPageWrapper from './components/PublicPageWrapper';
import PageWrapper from './components/PageWrapper';
import RequireAuth from './components/RequireAuth';

import Login from './components/Login';
import Register from './components/Register';

function App() {
  // Track if the user is logged in
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Public Routes (no auth needed) */}
        <Route element={<PublicPageWrapper />}>
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes (RequireAuth) */}
        <Route
          path="/*"
          element={
            <RequireAuth isAuthenticated={isAuthenticated}>
              <PageWrapper />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;