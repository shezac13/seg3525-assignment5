import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { setCookie, getCookie } from './utils/cookies'

function App() {
  const [count, setCount] = useState(0)

  // Load count from cookie when component mounts
  useEffect(() => {
    const savedCount = getCookie('count');
    if (savedCount) {
      setCount(parseInt(savedCount, 10));
    }
  }, [])

  // Save count to cookie whenever it changes
  const handleCountChange = () => {
    const newCount = count + 1;
    setCount(newCount);
    setCookie('count', newCount.toString());
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={handleCountChange}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
