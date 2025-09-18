import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom'
import Signup from './components/Signup'
import Profile from './components/Profile'
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import OtherProfile from "./components/OtherProfile.jsx";
import {useEffect} from "react";
import {initCsrf} from "./csrf.js";

function App() {
    useEffect(() => {
        initCsrf("http://localhost:8080");
    }, []);
  return (
    <Router>
      <Routes>
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
      </Routes>

    </Router>
  )
}

export default App;
