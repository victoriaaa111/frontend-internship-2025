import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom'
import Signup from './components/Signup'
import Welcome from './components/Welcome'
import Profile from './components/Profile'
import Login from "./components/Login";
import Home from "./components/Home.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import OtherProfile from "./components/OtherProfile.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
            } />
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup/>}></Route>

        <Route path="/welcome" element={<Welcome/>}></Route>

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
