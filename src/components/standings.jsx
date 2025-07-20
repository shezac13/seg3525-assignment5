import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sportsAPI } from '../api/apiUtils.js';
import { loadStatsFromCache, saveStatsToCache } from '../utils/cookiesUtils.js';
import './standings.css';

const Standings = () => {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dataType, setDataType] = useState('mlb');

    // Team ID to name mapping (same as in TeamDetails)
    const teamIdToName = {
        109: 'diamondbacks', 144: 'braves', 110: 'orioles', 111: 'redsox',
        112: 'cubs', 145: 'whiteSox', 113: 'reds', 114: 'guardians',
        115: 'rockies', 116: 'tigers', 117: 'astros', 118: 'royals',
        108: 'angels', 119: 'dodgers', 146: 'marlins', 158: 'brewers',
        142: 'twins', 121: 'mets', 147: 'yankees', 133: 'athletics',
        143: 'phillies', 134: 'pirates', 135: 'padres', 137: 'giants',
        136: 'mariners', 138: 'cardinals', 139: 'rays', 140: 'rangers',
        141: 'bluejays', 120: 'nationals'
    };

    // Function to get division name from division ID
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

    // Cookie management functions for caching
    const COOKIE_NAME = 'mlb_standings_2025';
    const COOKIE_EXPIRY_DAYS = 0.5; // Cache for 0.5 days as the values are recent

    // Function to fetch data from API or local files
    const fetchData = async (type, forceRefresh = false) => {
        setError(null);
        
        try {
            let result;
            let standings = loadStatsFromCache(COOKIE_NAME, COOKIE_EXPIRY_DAYS);
            if (standings && !forceRefresh) {
                console.log('Loading MLB stats from cache');
            } else {
                setLoading(true);
                console.log('Fetching MLB stats from API (cache miss)');
                standings = await sportsAPI.getMLBStandings();
                saveStatsToCache(standings, COOKIE_NAME, COOKIE_EXPIRY_DAYS);
            }
            if (type === 'mlb') {
                result = standings;
            } else if (type === 'al') {
                // Filter for American League divisions (200, 201, 202)
                result = {
                    records: standings.records.filter(division => [200, 201, 202].includes(division.division.id))
                };
            } else if (type === 'nl') {
                // Filter for National League divisions (203, 204, 205)
                result = {
                    records: standings.records.filter(division => [203, 204, 205].includes(division.division.id))
                };
            }
            // Not yet implemented
            // else if (type === 'wildcard') {
            //     result = await sportsAPI.getMLBWildcardStandings();
            // }

            setData(result);
        } catch (err) {
            setError(t('standings.error', { type: type.toUpperCase(), message: err.message }));
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when component mounts or dataType changes
    useEffect(() => {
        fetchData(dataType);
    }, [dataType]);

    // Function to handle data type switching
    const handleDataTypeChange = (type) => {
        setDataType(type);
    };

    // Render loading state
    if (loading) {
        return (
            <div className="container text-center my-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">{t('common.loading')}</span>
                </div>
                <p className="mt-3">{t('standings.loading', { type: dataType.toUpperCase() })}</p>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">{t('common.error')}</h4>
                    <p>{error}</p>
                    <button
                        className="btn btn-outline-danger"
                        onClick={() => fetchData(dataType, true)}
                    >
                        {t('standings.tryAgain')}
                    </button>
                </div>
            </div>
        );
    }

    // Render MLB standings
    const renderMLBStandings = () => {
        if (!data || !data.records) return null;

        return (
            <div className="standings">
                {data.records.map((division, divIndex) => (
                    <div key={divIndex} className="division">
                        {/* Division Table */}
                        <table>
                            <thead className="table-header">
                                <tr>
                                    <th>{getDivisionName(division.division.id)}</th>
                                    <th>{t('standings.wins')}</th>
                                    <th>{t('standings.losses')}</th>
                                    <th>{t('standings.winPercentage')}</th>
                                    <th>{t('standings.gamesBack')}</th>
                                    <th>{t('standings.divisionRank')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {division.teamRecords.map((team, teamIndex) => (
                                    <tr key={`${divIndex}-${teamIndex}`}>
                                        <td>
                                            <Link
                                                to={`/seg3525-assignment5/mlb/team/${teamIdToName[team.team.id] || team.team.id}`}
                                            >
                                                <strong>{team.team.name}</strong>
                                            </Link>
                                        </td>
                                        <td>{team.wins}</td>
                                        <td>{team.losses}</td>
                                        <td>{team.winningPercentage}</td>
                                        <td>{team.gamesBack}</td>
                                        <td>{team.divisionRank}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="container my-5">
            <div className="row">
                <div className="col-12">
                    <h1 className="text-center mb-4">{t('standings.title')}</h1>

                    {/* Data Type Selector */}
                    <div className="d-flex justify-content-center mb-4">
                        <div className="btn-group" role="group">
                            <button
                                type="button"
                                className={`btn ${dataType === 'mlb' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => handleDataTypeChange('mlb')}
                            >
                                {t('standings.mlb')}
                            </button>
                            <button
                                type="button"
                                className={`btn ${dataType === 'al' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => handleDataTypeChange('al')}
                            >
                                {t('standings.americanLeague')}
                            </button>
                            <button
                                type="button"
                                className={`btn ${dataType === 'nl' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => handleDataTypeChange('nl')}
                            >
                                {t('standings.nationalLeague')}
                            </button>
                        </div>
                    </div>

                    {/* Refresh Button */}
                    <div className="d-flex justify-content-end mb-3">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => fetchData(dataType, true)}
                            disabled={loading}
                        >
                            <i className="bi bi-arrow-clockwise"></i> {t('standings.refreshData')}
                        </button>
                    </div>

                    {/* Data Display */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title mb-0">
                                {dataType === 'mlb' ? t('standings.mlbTeamStandings') : dataType === 'nl' ? t('standings.nationalLeagueStandings') : t('standings.americanLeagueStandings')}
                            </h3>
                        </div>
                        <div className="card-body p-0">
                            {renderMLBStandings()}
                        </div>
                    </div>

                    {/* Data Summary */}
                    {data && data.players && (
                        <div className="mt-3 text-muted text-center">
                            {t('standings.showingPlayers', { count: data.players.length })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Standings;

