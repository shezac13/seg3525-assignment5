import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Nav from './components/nav.jsx'
import MLB from './pages/mlb.jsx'
import NHL from './pages/nhl.jsx'
import TeamDetails from './pages/TeamDetails.jsx';

const NotFoundPage = () => {
  return (
    <div className="container text-center my-5">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/seg3525-assignment5/mlb">Home Page</Link>
    </div>);
}

function App() {
  return (
    <Router>
      <div>
        <Nav />
        <Routes>
          <Route path="/seg3525-assignment5/mlb" element={<MLB />} />
          <Route path="/seg3525-assignment5/nhl" element={<NHL />} />
          <Route path="/seg3525-assignment5/team/:teamId" element={<TeamDetails />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
