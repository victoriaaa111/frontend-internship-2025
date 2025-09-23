import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Signup from './components/Signup'
import Profile from './components/Profile'
import Login from "./components/Login";
import Home from "./components/Home.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import OtherProfile from "./components/OtherProfile.jsx";
import NotFound from "./components/NotFound.jsx";
import {useEffect} from "react";
import {initCsrf} from "./csrf.js";

function App() {
    useEffect(() => {
        initCsrf("http://localhost:8080");
    }, []);

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
            } ></Route>
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup/>}></Route>

        <Route path="/profile" element={
            <ProtectedRoute>
            <Profile />
                </ProtectedRoute>}></Route>

          <Route path="/user/:username" element={
              <ProtectedRoute>
                  <OtherProfile />
              </ProtectedRoute>}>
          </Route>

          {/* Catch-all route for unknown paths inside the SPA */}
          <Route path="*" element={<NotFound />} />
      </Routes>

    </Router>
  )
}

export default App;
