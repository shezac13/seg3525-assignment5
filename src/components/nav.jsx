import React from 'react';
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './nav.css'

function NAV() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState('mlb');

    // Update current page based on the current route
    useEffect(() => {
        if (location.pathname === '/seg3525-assignment5/' || location.pathname.startsWith('/seg3525-assignment5/mlb')) {
            setCurrentPage('mlb');
        } else if (location.pathname === '/nhl') {
            setCurrentPage('nhl');
        }
    }, [location]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        if (page === 'mlb') {
            navigate('/seg3525-assignment5/mlb');
        } else if (page === 'nhl') {
            navigate('/seg3525-assignment5/nhl');
        }
    };

    return (
        <div className="app">
            <nav className="navigation">
                <button
                    onClick={() => handlePageChange('mlb')}
                    className={currentPage === 'mlb' ? 'active' : ''}
                >
                    MLB
                </button>
                <button
                    onClick={() => handlePageChange('nhl')}
                    className={currentPage === 'nhl' ? 'active' : ''}
                >
                    NHL
                </button>
            </nav>
        </div>
    )
}

export default NAV