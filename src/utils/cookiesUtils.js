import { setCookie, getCookie } from './cookies';

export const saveStatsToCache = (stats, cookie_name, cookie_expiry_days) => {
  try {
    const dataToCache = {
      data: stats,
      timestamp: Date.now(),
      version: '1.0' // For future cache invalidation if data structure changes
    };
    setCookie(cookie_name, JSON.stringify(dataToCache), cookie_expiry_days);
  } catch (error) {
    console.warn('Failed to save stats to cache:', error);
  }
};

export const loadStatsFromCache = (cookie_name, cookie_expiry_days) => {
  try {
    const cachedData = getCookie(cookie_name);
    if (!cachedData) return null;

    const parsed = JSON.parse(cachedData);
    const cacheAge = Date.now() - parsed.timestamp;
    const maxAge = cookie_expiry_days * 24 * 60 * 60 * 1000; // Convert days to milliseconds

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