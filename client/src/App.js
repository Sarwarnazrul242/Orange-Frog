import React, { useEffect } from "react";
import "./index.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import SidebarDemo from "./components/SidebarDemo";
import Login from "./components/pages/login/Login";
import { Toaster } from "sonner";
import EventDetails from './components/pages/admin/event/EventDetails';

// Admin Pages
import Dashboard from "./components/pages/admin/adminDashboard";
import Profile from "./components/pages/admin/AdminProfile";
import ManageEvents from "./components/pages/admin/event/ManageEvents";
import ManageUsers from "./components/pages/admin/users/ManageUsers";
import CreateEvent from "./components/pages/admin/event/CreateEvent";
import EditEvent from "./components/pages/admin/event/EditEvent";

// User Pages
import UserDashboard from "./components/pages/freelancer/UserDashboard";
import UserProfile from "./components/pages/freelancer/UserProfile";
import FindJobs from "./components/pages/freelancer/jobs/FindJobs";
import CurrentJobs from "./components/pages/freelancer/jobs/CurrentJobs";
import TimeCard from "./components/pages/freelancer/timecard/TimeCard";

// Set Profile Pages
import PasswordReset from "./components/pages/setProfile/PasswordReset";
import CompleteProfile from "./components/pages/setProfile/CompleteProfile";

// Separate component for root route handling
import RootRedirect from './components/RootRedirect';

function App() {
  useEffect(() => {
    document.body.classList.add('dark-mode'); // Force dark mode
    return () => {
      document.body.classList.remove('dark-mode'); // Clean up on unmount
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          duration={3000}
          toastOptions={{
            className: "sonner-toast",
            style: {
              background: "#1f1f1f",
              color: "#fff",
              border: "1px solid #333",
            },
          }}
          richColors
        />
        <Routes>
          {/* Add this as the first route */}
          <Route path="/" element={<RootRedirect />} />

          {/* Root route with conditional redirect */}
          <Route path="/login" element={<Login/>} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <SidebarDemo role="admin" />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="manage-events" element={<ManageEvents />} />
            <Route path="events/create" element={<CreateEvent />} />
            <Route path="events/:eventId" element={<EventDetails />} />
            <Route path="events/edit/:id" element={<EditEvent />} />
          </Route>

          {/* Protected User Routes */}
          <Route
            path="/user/*"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <SidebarDemo role="user" />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="find-jobs" element={<FindJobs />} />
            <Route path="current-jobs" element={<CurrentJobs />} />
            <Route path="time-card" element={<TimeCard />} />
          </Route>

          {/* Set Profile Pages */}
          <Route
            path="/reset-password"
            element={
              <PrivateRoute>
                <PasswordReset />
              </PrivateRoute>
            }
          />
          <Route
            path="/complete-profile"
            element={
              <PrivateRoute>
                <CompleteProfile />
              </PrivateRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
