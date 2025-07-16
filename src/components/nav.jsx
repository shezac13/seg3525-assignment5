import React from 'react';
import { useState, useEffect, useRef } from 'react'
import MLB from '../pages/mlb.jsx'
import NHL from '../pages/nhl.jsx'

import './nav.css'

function NAV() {
    const [currentPage, setCurrentPage] = useState('mlb')

    const renderPage = () => {
        switch (currentPage) {
            case 'mlb':
                return <MLB />
            case 'nhl':
                return <NHL />
            default:
                return <MLB />
        }
    }

    return (
        <div className="app">
            <nav className="navigation">
                <button
                    onClick={() => setCurrentPage('mlb')}
                    className={currentPage === 'mlb' ? 'active' : ''}
                >
                    MLB
                </button>
                <button
                    onClick={() => setCurrentPage('nhl')}
                    className={currentPage === 'nhl' ? 'active' : ''}
                >
                    NHL
                </button>
            </nav>
            {renderPage()}
        </div>
    )
}

export default NAV