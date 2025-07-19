import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sportsAPI } from '../api/apiUtils.js';
import MyChart from '../components/graph.jsx';
import { setCookie, getCookie } from '../utils/cookies.js';

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
    const [exclude2020, setExclude2020] = useState(true);
    const [gameType, setGameType] = useState('all');
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
        const width = Math.max(windowSize.width * 0.7, 300);
        const height = Math.max(windowSize.height * 0.6, 300);

        return { width, height };
    };

    const { width: chartWidth, height: chartHeight } = getChartDimensions();

    // Cookie management functions for allYearStats
    const COOKIE_NAME = 'mlb_stats_2000_2024';
    const COOKIE_EXPIRY_DAYS = 30; // Cache for 30 days as the values are from previous years

    const saveStatsToCache = (stats) => {
        try {
            const dataToCache = {
                data: stats,
                timestamp: Date.now(),
                version: '1.0' // For future cache invalidation if data structure changes
            };
            setCookie(COOKIE_NAME, JSON.stringify(dataToCache), COOKIE_EXPIRY_DAYS);
        } catch (error) {
            console.warn('Failed to save stats to cache:', error);
        }
    };

    const loadStatsFromCache = () => {
        try {
            const cachedData = getCookie(COOKIE_NAME);
            if (!cachedData) return null;

            const parsed = JSON.parse(cachedData);
            const cacheAge = Date.now() - parsed.timestamp;
            const maxAge = COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // Convert days to milliseconds

            // Check if cache is still valid
            if (cacheAge > maxAge) {
                return null;
            }

            return parsed.data;
        } catch (error) {
            console.warn('Failed to load stats from cache:', error);
            return null;
        }
    };

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
                const standingsData = await sportsAPI.getMLBStandings();

                let foundTeam = null;
                foundTeam = findTeamData(standingsData, teamId);

                if (foundTeam) {
                    setTeamData(foundTeam);

                    // Try to load stats from cache first
                    let allStats = loadStatsFromCache();

                    if (allStats) {
                        console.log('Loading MLB stats from cache');
                        setAllYearStats(allStats);
                    } else {
                        console.log('Fetching MLB stats from API (cache miss)');
                        allStats = await getAllYearRangeStats(2000, 2024); //default range 2000-2024
                        setAllYearStats(allStats);

                        // Save to cache for future use
                        saveStatsToCache(allStats);
                    }
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

    // Function to handle game type switching
    const handleGameTypeChange = (type) => {
        setGameType(type);
        // Reset chart data type to first available option for the new game type
        const availableOptions = Object.keys(dataTypeChartOptions[type]);
        if (!availableOptions.includes(chartDataType)) {
            setChartDataType(availableOptions[0]);
        }
    };

    // Get current data type options based on selected game type
    const getCurrentDataTypeOptions = () => {
        return dataTypeChartOptions[gameType] || dataTypeChartOptions.all;
    };

    // Function to update chart data based on year range and game type
    const updateChartData = () => {
        if (allYearStats && teamId) {
            let filteredStats = getTeamStatsFromAllYears(teamId).filter(
                item => item.name >= startYear && item.name <= endYear
            );

            // Exclude 2020 if toggle is enabled
            if (exclude2020) {
                filteredStats = filteredStats.filter(item => item.name !== 2020);
            }

            setChartData(filteredStats);
        }
    };

    // Update chart when year range, game type, or exclude2020 changes
    useEffect(() => {
        updateChartData();
    }, [startYear, endYear, allYearStats, teamId, gameType, exclude2020]);

    const dataTypeChartOptions = {
        all: {
            wins: { key: 'value.wins', label: 'Wins', title: 'Wins' },
            losses: { key: 'value.losses', label: 'Losses', title: 'Losses' },
            winningPercentage: { key: 'value.winningPercentage', label: 'Win Percentage', title: 'Win Percentage' },
            runDifferential: { key: 'value.runDifferential', label: 'Run Differential', title: 'Run Differential' },
            divisionRank: { key: 'value.divisionRank', label: 'Division Rank', title: 'Division Rank' },
        },
        home: {
            wins: { key: 'value.records.splitRecords[0].wins', label: 'Home Wins', title: 'Wins' },
            losses: { key: 'value.records.splitRecords[0].losses', label: 'Home Losses', title: 'Losses' },
            winningPercentage: { key: 'value.records.splitRecords[0].pct', label: 'Home Win Percentage', title: 'Win Percentage' },
        },
        away: {
            wins: { key: 'value.records.splitRecords[1].wins', label: 'Away Wins', title: 'Wins' },
            losses: { key: 'value.records.splitRecords[1].losses', label: 'Away Losses', title: 'Losses' },
            winningPercentage: { key: 'value.records.splitRecords[1].pct', label: 'Away Win Percentage', title: 'Win Percentage' },
        },
        homevsaway: {
            wins: {
                key: 'value.records.splitRecords[0].wins',
                label: 'Home Wins',
                key2: 'value.records.splitRecords[1].wins',
                label2: 'Away Wins',
                title: 'Wins'
            },
            losses: {
                key: 'value.records.splitRecords[0].losses',
                label: 'Home Losses',
                key2: 'value.records.splitRecords[1].losses',
                label2: 'Away Losses',
                title: 'Losses'
            },
            winningPercentage: {
                key: 'value.records.splitRecords[0].pct',
                label: 'Home Win Percentage',
                key2: 'value.records.splitRecords[1].pct',
                label2: 'Away Win Percentage',
                title: 'Win Percentage'
            },
        },
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
        bluejays: { key: 141, label: 'Toronto Blue Jays' },
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
                        {Object.entries(getCurrentDataTypeOptions()).map(([key, option]) => (
                            <option key={key} value={key}>
                                {option.title}
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

                <h3 style={{ textAlign: 'center' }}>
                    {`${teamData?.team?.name || 'Team'} ${getCurrentDataTypeOptions()[chartDataType]?.title} ${startYear} to ${endYear}`}
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: chartWidth, paddingLeft: 130, paddingRight: 50 }}>
                    {/* Game type selection dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <select
                            id="gameTypeSelect"
                            className="form-select"
                            style={{ width: 'auto', display: 'inline-block' }}
                            value={gameType}
                            onChange={(e) => handleGameTypeChange(e.target.value)}
                        >
                            <option value="all">All Games</option>
                            <option value="home">Home</option>
                            <option value="away">Away</option>
                            <option value="homevsaway">Home vs. Away</option>
                        </select>
                    </div>

                    {/* Switch toggle for excluding 2020 */}
                    <div className="form-check form-switch" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="exclude2020"
                            checked={exclude2020}
                            onChange={(e) => setExclude2020(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="exclude2020" style={{ paddingLeft: 10 }}>
                            Exclude 2020 (COVID year)
                        </label>
                    </div>
                </div>
                <MyChart
                    className="chart"
                    data={chartData}
                    xKey="name"
                    xName="Year"
                    yKey={getCurrentDataTypeOptions()[chartDataType]?.key}
                    yName={getCurrentDataTypeOptions()[chartDataType]?.label}
                    yKey2={gameType === "homevsaway" ? getCurrentDataTypeOptions()[chartDataType]?.key2 : null}
                    yName2={gameType === "homevsaway" ? getCurrentDataTypeOptions()[chartDataType]?.label2 : null}
                    width={chartWidth}
                    height={chartHeight}
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
