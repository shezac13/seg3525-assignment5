import React from 'react';
import { useState, useEffect, useRef } from 'react'
import MLB from '../pages/mlb.jsx'
import NHL from '../pages/nhl.jsx'
import Stats from '../pages/stats.jsx'
import PlayerStats from './playerstats.jsx';

import './nav.css'

function NAV() {
    const [currentPage, setCurrentPage] = useState('mlb')

    const renderPage = () => {
        switch (currentPage) {
            case 'mlb':
                return <MLB />
            case 'nhl':
                return <NHL />
            case 'stats':
                return <Stats />
            case 'playerstats':
                return <PlayerStats />
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
                <button
                    onClick={() => setCurrentPage('stats')}
                    className={currentPage === 'stats' ? 'active' : ''}
                >
                    Stats
                </button>
                <button
                    onClick={() => setCurrentPage('playerstats')}
                    className={currentPage === 'playerstats' ? 'active' : ''}
                >
                    Player Stats dev
                </button>
            </nav>
            {renderPage()}
        </div>
    )
}

export default NAV