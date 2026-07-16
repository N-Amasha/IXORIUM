import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth'; // Import Auth page
import Dashboard from './pages/Dashboard'; // Import Dashboard page
import CourseView from './pages/CourseView'; // Import CourseView page

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <Routes>

          {/* Connect Auth page */}
          <Route path="/login" element={<Auth />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/course/:courseId" element={<CourseView />} />

          {/* Redirect all unknown routes to Login */}
          <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;