import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import './App.css'
import Nav from './components/nav.jsx'
import MLB from './pages/mlb.jsx'
import NHL from './pages/nhl.jsx'
import TeamDetails from './pages/TeamDetails.jsx';

const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <div className="container text-center my-5">
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.message')}</p>
      <Link to="/seg3525-assignment5/mlb">{t('notFound.homePage')}</Link>
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
          <Route path="/seg3525-assignment5/mlb/team/:teamName" element={<TeamDetails />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
