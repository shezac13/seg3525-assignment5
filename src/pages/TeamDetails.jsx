import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sportsAPI } from '../api/apiUtils.js';
import MyChart from '../components/graph.jsx';

import './TeamDetails.css';

const TeamDetails = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState();
    const [chartDataType, setChartDataType] = useState('wins');
    const [allYearStats, setAllYearStats] = useState(null);
    const [startYear, setStartYear] = useState(2000);
    const [endYear, setEndYear] = useState(2024);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Hook to handle window resize
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate chart dimensions based on window size
    const getChartDimensions = () => {
        const containerPadding = 48; // Account for container padding
        const maxWidth = Math.min(windowSize.width - containerPadding, 1200);
        const width = Math.max(windowSize.width * 0.7, 300); // 90% of available width, minimum 300px
        const height = Math.max(windowSize.height * 0.6, 300); // 40% of window height, minimum 300px

        return { width, height };
    };

    const { width: chartWidth, height: chartHeight } = getChartDimensions();

    const findTeamData = (standingsData, teamId) => {
        let foundTeam = null;
        // Find the team in the standings data
        standingsData.records.forEach(division => {
            division.teamRecords.forEach(team => {
                if (team.team.id.toString() === teamId) {
                    foundTeam = {
                        ...team,
                        divisionName: getDivisionName(division.division.id)
                    };
                }
            });
        });
        return foundTeam;
    }

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                setLoading(true);
                // For now, we'll get the team data from the standings
                // In a real application, you might have a specific API endpoint for team details
                const standingsData = await sportsAPI.getMLBStandings();

                let foundTeam = null;
                foundTeam = findTeamData(standingsData, teamId);

                if (foundTeam) {
                    setTeamData(foundTeam);

                    const allStats = await getAllYearRangeStats(2000, 2024); //default range 2000-2024
                    setAllYearStats(allStats); // Store in state
                } else {
                    setError('Team not found');
                }
            } catch (err) {
                setError('Failed to load team data');
                console.error('Error fetching team data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (teamId) {
            fetchTeamData();
        }
    }, [teamId]);

    const getDivisionName = (divisionId) => {
        const divisionMap = {
            200: "American League West",
            201: "American League East",
            202: "American League Central",
            203: "National League West",
            204: "National League East",
            205: "National League Central"
        };
        return divisionMap[divisionId] || `Division ${divisionId}`;
    };

    // Function to handle data type switching
    const handleDataTypeChange = (type) => {
        setChartDataType(type);
    };

    // Function to update chart data based on year range
    const updateChartData = () => {
        if (allYearStats && teamId) {
            const filteredStats = getTeamStatsFromAllYears(teamId).filter(
                item => item.name >= startYear && item.name <= endYear
            );
            setChartData(filteredStats);
        }
    };

    // Update chart when year range or data type changes
    useEffect(() => {
        updateChartData();
    }, [startYear, endYear, allYearStats, teamId]);

    const dataTypeChartOptions = {
        winningPercentage: { key: 'value.leagueRecord.pct', label: 'Win Percentage' },
        wins: { key: 'value.wins', label: 'Wins' },
        losses: { key: 'value.losses', label: 'Losses' },
        runDifferential: { key: 'value.runDifferential', label: 'Run Differential' },
        divisionRank: { key: 'value.divisionRank', label: 'Division Rank' }
    };

    const teamOptions = {
        diamondbacks: { key: 109, label: 'Arizona Diamondbacks' },
        braves: { key: 144, label: 'Atlanta Braves' },
        orioles: { key: 110, label: 'Baltimore Orioles' },
        redsox: { key: 111, label: 'Boston Red Sox' },
        cubs: { key: 112, label: 'Chicago Cubs' },
        whiteSox: { key: 145, label: 'Chicago White Sox' },
        reds: { key: 113, label: 'Cincinnati Reds' },
        guardians: { key: 114, label: 'Cleveland Guardians' },
        rockies: { key: 115, label: 'Colorado Rockies' },
        tigers: { key: 116, label: 'Detroit Tigers' },
        astros: { key: 117, label: 'Houston Astros' },
        royals: { key: 118, label: 'Kansas City Royals' },
        angels: { key: 108, label: 'Los Angeles Angels' },
        dodgers: { key: 119, label: 'Los Angeles Dodgers' },
        marlins: { key: 146, label: 'Miami Marlins' },
        brewers: { key: 158, label: 'Milwaukee Brewers' },
        twins: { key: 142, label: 'Minnesota Twins' },
        mets: { key: 121, label: 'New York Mets' },
        yankees: { key: 147, label: 'New York Yankees' },
        athletics: { key: 133, label: 'Oakland Athletics' },
        phillies: { key: 143, label: 'Philadelphia Phillies' },
        pirates: { key: 134, label: 'Pittsburgh Pirates' },
        padres: { key: 135, label: 'San Diego Padres' },
        giants: { key: 137, label: 'San Francisco Giants' },
        mariners: { key: 136, label: 'Seattle Mariners' },
        cardinals: { key: 138, label: 'St. Louis Cardinals' },
        rays: { key: 139, label: 'Tampa Bay Rays' },
        rangers: { key: 140, label: 'Texas Rangers' },
        jays: { key: 141, label: 'Toronto Blue Jays' },
        nationals: { key: 120, label: 'Washington Nationals' },
    };

    const getAllYearRangeStats = async (initialYear, finalYear) => {
        const stats = [];
        for (let year = initialYear; year <= finalYear; year++) {
            const standingsData = await sportsAPI.getMLBStandings(year);
            stats.push({
                name: year,
                value: standingsData,
            });
        }
        return stats;
    };

    const getTeamStatsFromAllYears = (teamId) => {
        if (!allYearStats) return [];

        return allYearStats.map(yearData => ({
            name: yearData.name,
            value: findTeamData(yearData.value, teamId)
        })).filter(item => item.value !== null);
    };


    if (loading) {
        return (
            <div className="container text-center my-5 loading-container">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading team details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error!</h4>
                    <p>{error}</p>
                    <button
                        className="btn btn-outline-danger"
                        onClick={() => navigate('/seg3525-assignment5/mlb/')}
                    >
                        Back to Standings
                    </button>
                </div>
            </div>
        );
    }

    if (!teamData) {
        return (
            <div className="container my-5">
                <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">Team Not Found</h4>
                    <p>The requested team could not be found.</p>
                    <button
                        className="btn btn-outline-warning"
                        onClick={() => navigate('/seg3525-assignment5/mlb/')}
                    >
                        Back to Standings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '20px' }}>
            <button
                className="btn btn-outline-secondary mb-3"
                onClick={() => navigate('/seg3525-assignment5/mlb/')}
            >
                ← Back to Standings
            </button>
            <div className="container my-6 team-graph">
                <div className="mb-3">
                    {/* Dropdown for team selection */}
                    <label htmlFor="teamSelect" className="form-label" style={{ padding: 10 }}>Select Team:</label>
                    <select
                        id="teamSelect"
                        className="form-select"
                        style={{ width: 'auto', display: 'inline-block' }}
                        value={teamId}
                        onChange={(e) => navigate(`/seg3525-assignment5/team/${e.target.value}`)}
                    >
                        {Object.entries(teamOptions).map(([key, option]) => (
                            <option key={option.key} value={option.key}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {/* Dropdown for data type selection */}
                    <label htmlFor="dataTypeSelect" className="form-label" style={{ padding: 10 }}>Select Statistic:</label>
                    <select
                        id="dataTypeSelect"
                        className="form-select"
                        style={{ width: 'auto', display: 'inline-block' }}
                        value={chartDataType}
                        onChange={(e) => handleDataTypeChange(e.target.value)}
                    >
                        {Object.entries(dataTypeChartOptions).map(([key, option]) => (
                            <option key={key} value={key}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Dropdowns for year range selection */}
                    <label htmlFor="startYear" className="form-label" style={{ padding: 10, marginLeft: 20 }}>Start Year:</label>
                    <select
                        id="startYear"
                        className="form-select"
                        style={{ width: 'auto', display: 'inline-block' }}
                        value={startYear}
                        onChange={(e) => setStartYear(parseInt(e.target.value))}
                    >
                        {Array.from({ length: 25 }, (_, i) => 2000 + i).map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="endYear" className="form-label" style={{ padding: 10 }}>End Year:</label>
                    <select
                        id="endYear"
                        className="form-select"
                        style={{ width: 'auto', display: 'inline-block' }}
                        value={endYear}
                        onChange={(e) => setEndYear(parseInt(e.target.value))}
                    >
                        {Array.from({ length: 25 }, (_, i) => 2000 + i).map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                <MyChart
                    className="chart"
                    data={chartData}
                    xKey="name"
                    xName="Year"
                    yKey={dataTypeChartOptions[chartDataType].key}
                    yName={dataTypeChartOptions[chartDataType].label}
                    width={chartWidth}
                    height={chartHeight}
                    title={`${teamData?.team?.name || 'Team'} ${dataTypeChartOptions[chartDataType].label} Over Time`}
                />
            </div>

            <div className="container my-5">
                <div className="row">
                    <div className="col-12">

                        <div className="card">
                            <div className="card-header">
                                <h1 className="card-title mb-0">{teamData.team.name}</h1>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <h5>Team Statistics</h5>
                                        <table className="table table-striped">
                                            <tbody>
                                                <tr>
                                                    <td><strong>Division:</strong></td>
                                                    <td>{teamData.divisionName}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Division Rank:</strong></td>
                                                    <td>{teamData.divisionRank}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Wins:</strong></td>
                                                    <td>{teamData.wins}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Losses:</strong></td>
                                                    <td>{teamData.losses}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Win Percentage:</strong></td>
                                                    <td>{teamData.winningPercentage}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Games Back:</strong></td>
                                                    <td>{teamData.gamesBack}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="col-md-6">
                                        <h5>Additional Information</h5>
                                        <div className="alert alert-info">
                                            <p><strong>League:</strong> {teamData.divisionName.includes('American') ? 'American League' : 'National League'}</p>
                                            <p><strong>Games Played:</strong> {teamData.wins + teamData.losses}</p>
                                            <p><strong>Remaining Games:</strong> {162 - (teamData.wins + teamData.losses)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamDetails;
