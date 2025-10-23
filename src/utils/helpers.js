/**
 * Format a date string or timestamp into a localized date string
 * @param {string | number | Date} date - The date to format
 * @param {string} locale - The locale to use for formatting (default: 'en-US')
 * @param {Intl.DateTimeFormatOptions} options - Formatting options
 * @returns {string} The formatted date string
 */
export const formatDate = (
  date,
  locale = 'en-US',
  options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }
) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Format a number to a currency string
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'USD')
 * @param {string} locale - The locale to use for formatting (default: 'en-US')
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (
  amount,
  currency = 'USD',
  locale = 'en-US'
) => {
  if (typeof amount !== 'number') return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Format a number with thousand separators
 * @param {number} number - The number to format
 * @param {string} locale - The locale to use for formatting (default: 'en-US')
 * @returns {string} The formatted number string
 */
export const formatNumber = (number, locale = 'en-US') => {
  if (typeof number !== 'number') return '';
  
  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Convert bytes to human readable size
 * @param {number} bytes - The size in bytes
 * @param {boolean} binary - Use binary (1024) or decimal (1000) units
 * @returns {string} The formatted size string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes, binary = true) => {
  if (typeof bytes !== 'number' || bytes < 0) return '0 B';
  
  const units = binary
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB']
    : ['B', 'KB', 'MB', 'GB', 'TB'];
  const base = binary ? 1024 : 1000;
  
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(base)),
    units.length - 1
  );
  
  const size = bytes / Math.pow(base, exponent);
  const unit = units[exponent];
  
  return `${size.toFixed(2)} ${unit}`;
};

/**
 * Generate a random string with specified length
 * @param {number} length - The length of the string to generate
 * @returns {string} The random string
 */
export const generateRandomString = (length = 8) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

/**
 * Truncate a string to a specified length and add ellipsis
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @param {string} ellipsis - The ellipsis string to append (default: '...')
 * @returns {string} The truncated string
 */
export const truncateString = (str, maxLength, ellipsis = '...') => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
};

/**
 * Deep clone an object
 * @param {any} obj - The object to clone
 * @returns {any} A deep clone of the object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Debounce a function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce delay in milliseconds
 * @returns {Function} The debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle a function
 * @param {Function} func - The function to throttle
 * @param {number} limit - The throttle limit in milliseconds
 * @returns {Function} The throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
