import React from 'react';
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import './nav.css'

function NAV() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState('mlb');

    // Update current page based on the current route
    useEffect(() => {
        if (location.pathname === '/seg3525-assignment5/' || location.pathname.startsWith('/seg3525-assignment5/mlb')) {
            setCurrentPage('mlb');
        }
    }, [location]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        if (page === 'mlb') {
            navigate('/seg3525-assignment5/mlb');
        }
    };

    // Function to change language
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="app">
            <nav className="navigation">
                <div className="nav-left">
                    <button
                        onClick={() => handlePageChange('mlb')}
                        className={currentPage === 'mlb' ? 'active' : ''}
                    >
                        MLB
                    </button>
                </div>
                <div className="nav-right">
                    <div className="language-selector">
                        <button
                            type="button"
                            className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                            onClick={() => changeLanguage('en')}
                        >
                            EN
                        </button>
                        <button
                            type="button"
                            className={`lang-btn ${i18n.language === 'fr' ? 'active' : ''}`}
                            onClick={() => changeLanguage('fr')}
                        >
                            FR
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default NAV