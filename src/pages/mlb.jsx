import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// import '../App.css';
import './mlb.css'
import Standings from '../components/standings';

const MLB = () => {
    const { t } = useTranslation();

    return (
        <div className="page-wrapper">
            <div className="mlb-page">
                <header className="mlb-header">
                    <h1>{t('mlb.title')}</h1>
                </header>
                <div>
                    <Standings />
                </div>
                <main className="mlb-content">
                    <section className="mlb-info">
                        <h2>{t('mlb.aboutMLB')}</h2>
                        <p>
                            {t('mlb.aboutMLBDescription')}
                        </p>
                    </section>

                    <section className="mlb-stats">
                        <h2>{t('mlb.quickFacts')}</h2>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <h3>30</h3>
                                <p>{t('mlb.teams')}</p>
                            </div>
                            <div className="stat-item">
                                <h3>162</h3>
                                <p>{t('mlb.regularSeasonGames')}</p>
                            </div>
                            <div className="stat-item">
                                <h3>1903</h3>
                                <p>{t('mlb.yearEstablished')}</p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};


export default MLB;