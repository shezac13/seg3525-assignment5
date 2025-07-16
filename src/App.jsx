import { useState } from 'react'
import './App.css'
import Nav from './components/nav.jsx'
import Standings from './components/standings.jsx';

const NotFoundPage = () => {
    return (
    <div className="container text-center my-5">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link to="/">Home Page</Link>
    </div>);
}

function App() {
  return (
    <div>
      {/* <MLB /> */}
      <Nav />
      <Standings />
    </div>
  )
}

export default App
