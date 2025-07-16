import React, { useEffect } from 'react';
// import '../App.css';
import './mlb.css'

const MLB = () => {
    const teams = [
        { name: 'New York Yankees', division: 'AL East', championships: 27 },
        { name: 'Los Angeles Dodgers', division: 'NL West', championships: 7 },
        { name: 'Boston Red Sox', division: 'AL East', championships: 9 },
        { name: 'St. Louis Cardinals', division: 'NL Central', championships: 11 },
        { name: 'San Francisco Giants', division: 'NL West', championships: 8 },
        { name: 'Oakland Athletics', division: 'AL West', championships: 9 }
    ];

    return (
        <div className="page-wrapper">
            <div className="mlb-page">
                <header className="mlb-header">
                    <h1>Major League Baseball</h1>
                </header>

                <main className="mlb-content">
                    <section className="mlb-info">
                        <h2>About MLB</h2>
                        <p>
                            Major League Baseball (MLB) is a professional baseball organization
                            that consists of 30 teams split between the American League (AL) and
                            National League (NL). Founded in 1903, MLB is the oldest major
                            professional sports league in the United States and Canada.
                        </p>
                    </section>

                    <section className="mlb-teams">
                        <h2>Featured Teams</h2>
                        <div className="teams-grid">
                            {teams.map((team, index) => (
                                <div key={index} className="team-card">
                                    <h3>{team.name}</h3>
                                    <p><strong>Division:</strong> {team.division}</p>
                                    <p><strong>Championships:</strong> {team.championships}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mlb-stats">
                        <h2>Quick Facts</h2>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <h3>30</h3>
                                <p>Teams</p>
                            </div>
                            <div className="stat-item">
                                <h3>162</h3>
                                <p>Regular Season Games</p>
                            </div>
                            <div className="stat-item">
                                <h3>1903</h3>
                                <p>Year Established</p>
                            </div>
                            <div className="stat-item">
                                <h3>2</h3>
                                <p>Leagues</p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};


// // Inject the styles into the head
// if (typeof document !== 'undefined') {
//     const styleElement = document.createElement('style');
//     styleElement.textContent = styles;
//     document.head.appendChild(styleElement);
// }

export default MLB;