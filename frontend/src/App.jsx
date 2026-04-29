import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboards
import StudentDashboard from './pages/student/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import CourseManager from './pages/teacher/CourseManager';
import CourseResources from './pages/teacher/CourseResources';
import TestBuilder from './pages/teacher/TestBuilder';
import Analytics from './pages/teacher/Analytics';

import CourseCatalog from './pages/student/CourseCatalog';
import CourseDetail from './pages/student/CourseDetail';
import TakeTest from './pages/student/TakeTest';
import TestResult from './pages/student/TestResult';
import MyResults from './pages/student/MyResults';

// Layout Component with Sidebar & Navbar
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/courses" element={<CourseCatalog />} />
            <Route path="/student/course/:id" element={<CourseDetail />} />
            <Route path="/student/test/:id" element={<TakeTest />} />
            <Route path="/student/result/:id" element={<TestResult />} />
            <Route path="/student/results" element={<MyResults />} />
            {/* Additional student routes will go here */}
          </Route>

          {/* Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/courses" element={<CourseManager />} />
            <Route path="/teacher/course/:id/resources" element={<CourseResources />} />
            <Route path="/teacher/tests/create" element={<TestBuilder />} />
            <Route path="/teacher/analytics" element={<Analytics />} />
            {/* Additional teacher routes will go here */}
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Chatbot />
      </Router>
    </AuthProvider>
  );
}

export default App;
