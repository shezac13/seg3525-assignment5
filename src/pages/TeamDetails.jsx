import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sportsAPI } from '../api/apiUtils.js';
import MyChart from '../components/graph.jsx';
import { loadStatsFromCache, saveStatsToCache } from '../utils/cookiesUtils.js';
import './TeamDetails.css';

const TeamDetails = () => {
    const { t } = useTranslation();
    const { teamName } = useParams();
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
                const teamId = getTeamIdByName(teamName);

                if (!teamId) {
                    setError(t('common.invalidTeamName'));
                    return;
                }

                let standingsData2025 = loadStatsFromCache('mlb_standings_2025', 0.5);
                if (!standingsData2025) {
                    console.log('Fetching MLB 2025 stats from API (cache miss)');
                    standingsData2025 = await sportsAPI.getMLBStandings();
                    saveStatsToCache(standingsData2025, 'mlb_standings_2025', 0.5);
                }
                else {
                    console.log('Loading MLB 2025 stats from cache');
                }

                let foundTeam = null;
                foundTeam = findTeamData(standingsData2025, teamId.toString());

                if (foundTeam) {
                    setTeamData(foundTeam);

                    // Try to load stats from cache first
                    let allStats = loadStatsFromCache(COOKIE_NAME, COOKIE_EXPIRY_DAYS);

                    if (allStats) {
                        console.log('Loading MLB stats from cache');
                        setAllYearStats(allStats);
                    } else {
                        console.log('Fetching MLB stats from API (cache miss)');
                        allStats = await getAllYearRangeStats(2000, 2024); //default range 2000-2024
                        setAllYearStats(allStats);

                        // Save to cache for future use
                        saveStatsToCache(allStats, COOKIE_NAME, COOKIE_EXPIRY_DAYS);
                    }
                } else {
                    setError(t('common.teamNotFound'));
                }
            } catch (err) {
                setError(t('common.failedToLoadTeamData'));
                console.error('Error fetching team data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamData();
    }, [teamName]);

    const getDivisionName = (divisionId) => {
        const divisionMap = {
            200: t('divisions.americanLeagueWest'),
            201: t('divisions.americanLeagueEast'),
            202: t('divisions.americanLeagueCentral'),
            203: t('divisions.nationalLeagueWest'),
            204: t('divisions.nationalLeagueEast'),
            205: t('divisions.nationalLeagueCentral')
        };
        return divisionMap[divisionId] || t('divisions.division', { id: divisionId });
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
        if (allYearStats && teamName) {
            const teamId = getTeamIdByName(teamName);
            if (teamId) {
                let filteredStats = getTeamStatsFromAllYears(teamId.toString()).filter(
                    item => item.name >= startYear && item.name <= endYear
                );

                // Exclude 2020 if toggle is enabled
                if (exclude2020) {
                    filteredStats = filteredStats.filter(item => item.name !== 2020);
                }

                setChartData(filteredStats);
            }
        }
    };

    // Update chart when year range, game type, or exclude2020 changes
    useEffect(() => {
        updateChartData();
    }, [startYear, endYear, allYearStats, teamName, gameType, exclude2020]);

    const dataTypeChartOptions = {
        all: {
            wins: {
                key: 'value.wins',
                label: t('teamDetails.wins'),
                title: t('teamDetails.wins'),
                graphTitle: t('teamDetails.wins'),
                graphType: 'line'
            },
            losses: {
                key: 'value.losses',
                label: t('teamDetails.losses'),
                title: t('teamDetails.losses'),
                graphTitle: t('teamDetails.losses'),
                graphType: 'line'
            },
            winningPercentage: {
                key: 'value.winningPercentage',
                label: t('teamDetails.winPercentage'),
                title: t('teamDetails.winPercentage'),
                graphTitle: t('teamDetails.winPercentage'),
                graphType: 'line'
            },
            runDifferential: {
                key: 'value.runDifferential',
                label: t('teamDetails.runDifference'),
                title: t('teamDetails.runDifference'),
                graphTitle: t('teamDetails.runDifference'),
                graphType: 'line'
            },
            divisionRank: {
                key: 'value.divisionRank',
                label: t('teamDetails.divisionRank'),
                title: t('teamDetails.divisionRank'),
                graphTitle: t('teamDetails.divisionRank'),
                graphType: 'line'
            },
        },

        home: {
            wins: {
                key: 'value.records.splitRecords[0].wins',
                label: t('teamDetails.homeWins'),
                title: t('teamDetails.wins'),
                graphTitle: t('teamDetails.wins'),
                graphType: 'line'
            },
            losses: {
                key: 'value.records.splitRecords[0].losses',
                label: t('teamDetails.homeLosses'),
                title: t('teamDetails.losses'),
                graphTitle: t('teamDetails.losses'),
                graphType: 'line'
            },
            winningPercentage: {
                key: 'value.records.splitRecords[0].pct',
                label: t('teamDetails.homeWinPercentage'),
                title: t('teamDetails.winPercentage'),
                graphTitle: t('teamDetails.winPercentage'),
                graphType: 'line'
            },
        },

        away: {
            wins: {
                key: 'value.records.splitRecords[1].wins',
                label: t('teamDetails.awayWins'),
                title: t('teamDetails.wins'),
                graphTitle: t('teamDetails.wins'),
                graphType: 'line'
            },
            losses: {
                key: 'value.records.splitRecords[1].losses',
                label: t('teamDetails.awayLosses'),
                title: t('teamDetails.losses'),
                graphTitle: t('teamDetails.losses'),
                graphType: 'line'
            },
            winningPercentage: {
                key: 'value.records.splitRecords[1].pct',
                label: t('teamDetails.awayWinPercentage'),
                title: t('teamDetails.winPercentage'),
                graphTitle: t('teamDetails.winPercentage'),
                graphType: 'line'
            },
        },

        homevsaway: {
            wins: {
                key: 'value.records.splitRecords[0].wins',
                label: t('teamDetails.homeWins'),
                key2: 'value.records.splitRecords[1].wins',
                label2: t('teamDetails.awayWins'),
                title: t('teamDetails.wins'),
                graphTitle: t('teamDetails.wins') + ' (' + t('teamDetails.homeVsAway') + ')',
                graphType: 'bar',
            },
            losses: {
                key: 'value.records.splitRecords[0].losses',
                label: t('teamDetails.homeLosses'),
                key2: 'value.records.splitRecords[1].losses',
                label2: t('teamDetails.awayLosses'),
                title: t('teamDetails.losses'),
                graphTitle: t('teamDetails.losses') + ' (' + t('teamDetails.homeVsAway') + ')',
                graphType: 'bar',
            },
            winningPercentage: {
                key: 'value.records.splitRecords[0].pct',
                label: t('teamDetails.homeWinPercentage'),
                key2: 'value.records.splitRecords[1].pct',
                label2: t('teamDetails.awayWinPercentage'),
                title: t('teamDetails.winPercentage'),
                graphTitle: t('teamDetails.winPercentage') + ' (' + t('teamDetails.homeVsAway') + ')',
                graphType: 'bar',
            },
        },
    };

    const teamOptions = {
        diamondbacks: { key: 109, label: 'Arizona Diamondbacks' },
        athletics: { key: 133, label: 'Athletics' },
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

    // Create reverse lookup: teamId -> teamName and teamId -> teamInfo
    const teamIdToName = Object.fromEntries(
        Object.entries(teamOptions).map(([name, info]) => [info.key, name])
    );

    const teamIdToInfo = Object.fromEntries(
        Object.entries(teamOptions).map(([name, info]) => [info.key, { name, ...info }])
    );

    // Helper functions to get team information by ID or name
    const getTeamNameById = (teamId) => teamIdToName[parseInt(teamId)];
    const getTeamInfoById = (teamId) => teamIdToInfo[parseInt(teamId)];
    const getTeamLabelById = (teamId) => teamIdToInfo[parseInt(teamId)]?.label;
    const getTeamIdByName = (teamName) => teamOptions[teamName]?.key;
    const getTeamLabelByName = (teamName) => teamOptions[teamName]?.label;

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
                    <span className="visually-hidden">{t('common.loading')}</span>
                </div>
                <p className="mt-3">{t('teamDetails.loadingTeamDetails')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">{t('common.error')}</h4>
                    <p>{error}</p>
                    <button
                        className="btn btn-outline-danger"
                        onClick={() => navigate('/seg3525-assignment5/mlb/')}
                    >
                        {t('common.backToStandings')}
                    </button>
                </div>
            </div>
        );
    }

    if (!teamData) {
        return (
            <div className="container my-5">
                <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">{t('common.teamNotFoundTitle')}</h4>
                    <p>{t('common.teamNotFoundMessage')}</p>
                    <button
                        className="btn btn-outline-warning"
                        onClick={() => navigate('/seg3525-assignment5/mlb/')}
                    >
                        {t('common.backToStandings')}
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
                ← {t('common.backToStandings')}
            </button>
            <div className="container my-6 team-graph">
                <div className="mb-3">
                    {/* Dropdown for team selection */}
                    <label htmlFor="teamSelect" className="form-label" style={{ padding: 10 }}>{t('teamDetails.selectTeam')}</label>
                    <select
                        id="teamSelect"
                        className="form-select"
                        style={{ width: 'auto', display: 'inline-block' }}
                        value={teamName}
                        onChange={(e) => navigate(`/seg3525-assignment5/mlb/team/${e.target.value}`)}
                    >
                        {Object.entries(teamOptions).map(([name, option]) => (
                            <option key={name} value={name}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Dropdown for data type selection */}
                    <label htmlFor="dataTypeSelect" className="form-label" style={{ padding: 10 }}>{t('teamDetails.selectStatistic')}</label>
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
                    <label htmlFor="startYear" className="form-label" style={{ padding: 10, marginLeft: 20 }}>{t('teamDetails.startYear')}</label>
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

                    <label htmlFor="endYear" className="form-label" style={{ padding: 10 }}>{t('teamDetails.endYear')}</label>
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
                    {`${getTeamLabelByName(teamName) || teamData?.team?.name || 'Team'} ${getCurrentDataTypeOptions()[chartDataType]?.graphTitle} - ${startYear} ${t('common.rangeTo')} ${endYear}`}
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
                            <option value="all">{t('teamDetails.allGames')}</option>
                            <option value="home">{t('teamDetails.home')}</option>
                            <option value="away">{t('teamDetails.away')}</option>
                            <option value="homevsaway">{t('teamDetails.homeVsAway')}</option>
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
                            {t('teamDetails.excludeCovid')}
                        </label>
                    </div>
                </div>
                <MyChart
                    className="chart"
                    data={chartData}
                    xKey="name"
                    xName={t('common.year')}
                    yKey={getCurrentDataTypeOptions()[chartDataType]?.key}
                    yName={getCurrentDataTypeOptions()[chartDataType]?.label}
                    yKey2={gameType === "homevsaway" ? getCurrentDataTypeOptions()[chartDataType]?.key2 : null}
                    yName2={gameType === "homevsaway" ? getCurrentDataTypeOptions()[chartDataType]?.label2 : null}
                    width={chartWidth}
                    height={chartHeight}
                    chartType={getCurrentDataTypeOptions()[chartDataType]?.graphType}
                    showZeroLine={chartDataType === 'runDifferential'}
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
                                        <h5>{t('teamDetails.teamStatistics')}</h5>
                                        <table className="table table-striped">
                                            <tbody>
                                                <tr>
                                                    <td><strong>{t('teamDetails.division')}:</strong></td>
                                                    <td>{teamData.divisionName}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>{t('teamDetails.divisionRank')}:</strong></td>
                                                    <td>{teamData.divisionRank}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>{t('teamDetails.wins')}:</strong></td>
                                                    <td>{teamData.wins}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>{t('teamDetails.losses')}:</strong></td>
                                                    <td>{teamData.losses}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>{t('teamDetails.winPercentage')}:</strong></td>
                                                    <td>{teamData.winningPercentage}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>{t('teamDetails.gamesBack')}:</strong></td>
                                                    <td>{teamData.gamesBack}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="col-md-6">
                                        <h5>{t('teamDetails.additionalInformation')}</h5>
                                        <div className="alert alert-info">
                                            <p><strong>{t('teamDetails.league')}:</strong> {teamData.divisionName.includes('American') ? t('teamDetails.americanLeague') : t('teamDetails.nationalLeague')}</p>
                                            <p><strong>{t('teamDetails.gamesPlayed')}:</strong> {teamData.wins + teamData.losses}</p>
                                            <p><strong>{t('teamDetails.remainingGames')}:</strong> {162 - (teamData.wins + teamData.losses)}</p>
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
