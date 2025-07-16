import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sportsAPI } from '../api/apiUtils.js';
import './standings.css';

const Standings = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dataType, setDataType] = useState('mlb');

    // Function to get division name from division ID
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

    // Function to fetch data from API or local files
    const fetchData = async (type) => {
        setLoading(true);
        setError(null);

        try {
            let result;

            if (type === 'mlb') {
                result = await sportsAPI.getMLBStandings();
            } else if (type === 'al') {
                result = await sportsAPI.getMLBALStandings();
            } else if (type === 'nl') {
                result = await sportsAPI.getMLBNLStandings();
            }
            // Not yet implemented
            // else if (type === 'wildcard') {
            //     result = await sportsAPI.getMLBWildcardStandings();
            // }

            setData(result);
        } catch (err) {
            setError(`Failed to fetch ${type} data: ${err.message}`);
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
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading {dataType.toUpperCase()} data...</p>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error!</h4>
                    <p>{error}</p>
                    <button
                        className="btn btn-outline-danger"
                        onClick={() => fetchData(dataType)}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Render NBA standings
    const renderNBAStandings = () => {
        if (!data || !data.players) return null;

        return (
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>Player</th>
                            <th>Team</th>
                            <th>Position</th>
                            <th>Games</th>
                            <th>Points</th>
                            <th>Rebounds</th>
                            <th>Assists</th>
                            <th>FG%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.players.map((player, index) => (
                            <tr key={index}>
                                <td><strong>{player.name}</strong></td>
                                <td>{player.team}</td>
                                <td>{player.position}</td>
                                <td>{player.gamesPlayed}</td>
                                <td>{player.points}</td>
                                <td>{player.rebounds}</td>
                                <td>{player.assists}</td>
                                <td>{player.fieldGoalPercentage}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

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
                                    <th>Wins</th>
                                    <th>Losses</th>
                                    <th>Win %</th>
                                    <th>Games Back</th>
                                    <th>Division Rank</th>
                                </tr>
                            </thead>
                            <tbody>
                                {division.teamRecords.map((team, teamIndex) => (
                                    <tr key={`${divIndex}-${teamIndex}`}>
                                        <td>
                                            <Link
                                                to={`/seg3525-assignment5/team/${team.team.id}`}
                                                // className="text-decoration-none"
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
                    <h1 className="text-center mb-4">Sports Standings</h1>

                    {/* Data Type Selector */}
                    <div className="d-flex justify-content-center mb-4">
                        <div className="btn-group" role="group">
                            <button
                                type="button"
                                className={`btn ${dataType === 'mlb' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => handleDataTypeChange('mlb')}
                            >
                                MLB Standings
                            </button>
                            <button
                                type="button"
                                className={`btn ${dataType === 'al' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => handleDataTypeChange('al')}
                            >
                                American League
                            </button>
                            <button
                                type="button"
                                className={`btn ${dataType === 'nl' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => handleDataTypeChange('nl')}
                            >
                                National League
                            </button>
                        </div>
                    </div>

                    {/* Refresh Button */}
                    <div className="d-flex justify-content-end mb-3">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => fetchData(dataType)}
                            disabled={loading}
                        >
                            <i className="bi bi-arrow-clockwise"></i> Refresh Data
                        </button>
                    </div>

                    {/* Data Display */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title mb-0">
                                {dataType === 'mlb' ? 'MLB Team Standings' : dataType === 'nl' ? 'National League Standings' : 'American League Standings'}
                            </h3>
                        </div>
                        <div className="card-body p-0">
                            {renderMLBStandings()}
                        </div>
                    </div>

                    {/* Data Summary */}
                    {data && data.players && (
                        <div className="mt-3 text-muted text-center">
                            Showing {data.players.length} players
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Standings;

