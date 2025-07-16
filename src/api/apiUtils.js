// API utility functions for making HTTP requests

/**
 * Generic API call function
 * @param {string} url - The API endpoint URL
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise} - Promise resolving to the response data
 */
export const apiCall = async (url, options = {}) => {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const config = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url); //, config);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};

/**
 * GET request helper
 * @param {string} url - The API endpoint URL
 * @returns {Promise} - Promise resolving to the response data
 */
export const get = (url) => apiCall(url);

/**
 * POST request helper
 * @param {string} url - The API endpoint URL
 * @param {object} data - Data to send in the request body
 * @returns {Promise} - Promise resolving to the response data
 */
export const post = (url, data) =>
    apiCall(url, {
        method: 'POST',
        body: JSON.stringify(data),
    });


// Specific API endpoints for your sports data
export const sportsAPI = {
    getMLBStandings: () => get('https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=2025&standingsTypes=regularSeason'),
    getMLBALStandings: () => get('https://statsapi.mlb.com/api/v1/standings?leagueId=103&season=2025&standingsTypes=regularSeason'),
    getMLBNLStandings: () => get('https://statsapi.mlb.com/api/v1/standings?leagueId=104&season=2025&standingsTypes=regularSeason'),
};
