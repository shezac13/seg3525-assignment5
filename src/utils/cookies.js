// Simple cookie utilities

export const setCookie = (name, value, days = 30) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;

  // Handle large data by using localStorage as fallback if cookie size exceeds limit
  try {
    document.cookie = `${name}=${value}; ${expires}; path=/`;

    // Check if cookie was set successfully (cookies have ~4KB limit)
    if (!getCookie(name)) {
      // Cookie too large, use localStorage as fallback
      localStorage.setItem(name, value);
      localStorage.setItem(`${name}_expires`, date.getTime().toString());
    }
  } catch (error) {
    console.warn('Cookie storage failed, falling back to localStorage:', error);
    localStorage.setItem(name, value);
    localStorage.setItem(`${name}_expires`, date.getTime().toString());
  }
};

export const getCookie = (name) => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }

  // Check localStorage as fallback
  const localValue = localStorage.getItem(name);
  if (localValue) {
    const expires = localStorage.getItem(`${name}_expires`);
    if (expires && Date.now() > parseInt(expires)) {
      // Expired, remove from localStorage
      localStorage.removeItem(name);
      localStorage.removeItem(`${name}_expires`);
      return null;
    }
    return localValue;
  }

  return null;
};
