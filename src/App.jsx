import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import Signup from './components/Signup'
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup/>}></Route>
      </Routes>
    </Router>
  )
}

export default App
