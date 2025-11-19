import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom'
import Signup from './components/Signup'
import Profile from './components/Profile'
import Login from "./components/Login";
import Home from "./components/Home.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import OtherProfile from "./components/OtherProfile.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import UserManagement from "./components/UserManagement.jsx";
import {useEffect} from "react";
import {initCsrf} from "./csrf.js";
const API_BASE = import.meta.env.VITE_API_BASE;

function App() {
    useEffect(() => {
        initCsrf(`${API_BASE}`);
    }, []);


  return (
    <Router>
      <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={
            <ProtectedRoute requiredRole="USER">
                <Home />
            </ProtectedRoute>
            } ></Route>
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup/>}></Route>

        <Route path="/profile" element={
            <ProtectedRoute requiredRole="USER">
            <Profile />
                </ProtectedRoute>}></Route>

          <Route path="/user/:username" element={
              <ProtectedRoute >
                  <OtherProfile />
              </ProtectedRoute>}>
          </Route>
          <Route path="/admin/requests" element={
              <ProtectedRoute requiredRole="ADMIN">
              <AdminPanel />
                </ProtectedRoute>
          }>
          </Route>
          <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="ADMIN">
                  <UserManagement />
              </ProtectedRoute>
          }>
          </Route>
      </Routes>

    </Router>
  )
}

export default App;
