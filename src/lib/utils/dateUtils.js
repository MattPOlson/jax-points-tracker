// $lib/utils/dateUtils.js

/**
 * Formats a date string for display, handling both dates and timestamps
 * @param {string} dateString - Date string from database (YYYY-MM-DD, ISO format, or timestamp)
 * @param {Object} options - Formatting options (optional)
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return 'Invalid Date';
  
  try {
    // Default formatting options
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };

    // Check if this is a timestamp with time component (contains space or 'T' and time)
    const hasTimeComponent = dateString.includes(' ') || 
                           (dateString.includes('T') && dateString.split('T')[1] !== '00:00:00');
    
    if (hasTimeComponent) {
      // For timestamps with space format (e.g., "2025-08-29 03:43:21.894974"), 
      // convert to ISO format for better browser compatibility
      let isoString = dateString;
      if (dateString.includes(' ') && !dateString.includes('T')) {
        // Replace space with 'T'
        isoString = dateString.replace(' ', 'T');
        
        // Truncate microseconds to milliseconds if present (6 digits to 3)
        if (isoString.includes('.')) {
          const [datePart, fractionalPart] = isoString.split('.');
          const milliseconds = fractionalPart.substring(0, 3);
          isoString = `${datePart}.${milliseconds}`;
        }
        
        // Add timezone if missing
        if (!isoString.includes('+') && !isoString.includes('Z')) {
          // Assume local timezone if no timezone specified
          isoString += 'Z';
        }
      }
      
      const date = new Date(isoString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date after parsing:', dateString, '->', isoString);
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', defaultOptions);
    } else {
      // For date-only strings, parse manually to avoid timezone conversion
      const parts = dateString.split('T')[0].split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Month is 0-indexed
      const day = parseInt(parts[2]);
      
      const localDate = new Date(year, month, day);
      return localDate.toLocaleDateString('en-US', defaultOptions);
    }
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return 'Invalid Date';
  }
}

/**
 * Formats a datetime string for display, preserving timezone
 * @param {string} datetimeString - DateTime string from database (ISO format or timestamp)
 * @param {Object} options - Formatting options (optional)
 * @returns {string} Formatted datetime string
 */
export function formatDateTime(datetimeString, options = {}) {
  if (!datetimeString) return 'Invalid Date';
  
  try {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      ...options
    };

    // Handle space-separated datetime format (e.g., "2025-08-29 03:43:21.894974")
    let isoString = datetimeString;
    if (datetimeString.includes(' ') && !datetimeString.includes('T')) {
      // Replace space with 'T'
      isoString = datetimeString.replace(' ', 'T');
      
      // Truncate microseconds to milliseconds if present (6 digits to 3)
      if (isoString.includes('.')) {
        const [datePart, fractionalPart] = isoString.split('.');
        const milliseconds = fractionalPart.substring(0, 3);
        isoString = `${datePart}.${milliseconds}`;
      }
      
      // Add timezone if missing
      if (!isoString.includes('+') && !isoString.includes('Z')) {
        // Assume local timezone if no timezone specified
        isoString += 'Z';
      }
    }

    const date = new Date(isoString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid datetime after parsing:', datetimeString, '->', isoString);
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    console.warn('Error formatting datetime:', datetimeString, error);
    return 'Invalid Date';
  }
}

/**
 * Formats a timestamp for submission times (more compact format)
 * @param {string} timestampString - Timestamp string (e.g., "2025-07-12 16:34:36.733+00")
 * @param {boolean} showSeconds - Whether to include seconds (default: false)
 * @returns {string} Formatted timestamp string
 */
export function formatSubmissionTime(timestampString, showSeconds = false) {
  if (!timestampString) return 'Invalid Date';
  
  try {
    // Handle space-separated datetime format (e.g., "2025-08-29 03:43:21.894974")
    let isoString = timestampString;
    if (timestampString.includes(' ') && !timestampString.includes('T')) {
      // Replace space with 'T'
      isoString = timestampString.replace(' ', 'T');
      
      // Truncate microseconds to milliseconds if present (6 digits to 3)
      if (isoString.includes('.')) {
        const [datePart, fractionalPart] = isoString.split('.');
        const milliseconds = fractionalPart.substring(0, 3);
        isoString = `${datePart}.${milliseconds}`;
      }
      
      // Add timezone if missing
      if (!isoString.includes('+') && !isoString.includes('Z')) {
        // Assume local timezone if no timezone specified
        isoString += 'Z';
      }
    }

    const date = new Date(isoString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid submission time after parsing:', timestampString, '->', isoString);
      return 'Invalid Date';
    }

    const options = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    };
    
    if (showSeconds) {
      options.second = '2-digit';
    }
    
    // Check if it's from this year
    const isCurrentYear = date.getFullYear() === new Date().getFullYear();
    if (!isCurrentYear) {
      options.year = 'numeric';
    }
    
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.warn('Error formatting submission time:', timestampString, error);
    return 'Invalid Date';
  }
}

/**
 * Formats a date for form inputs (YYYY-MM-DD)
 * @param {Date|string} date - Date object or date string
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function formatDateForInput(date) {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn('Error formatting date for input:', date, error);
    return '';
  }
}

/**
 * Gets the current date in YYYY-MM-DD format for default form values
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export function getTodayForInput() {
  return formatDateForInput(new Date());
}

/**
 * Checks if a date string represents today
 * @param {string} dateString - Date string to check
 * @returns {boolean} True if the date is today
 */
export function isToday(dateString) {
  try {
    const today = new Date();
    const checkDate = new Date(dateString);
    
    return today.getFullYear() === checkDate.getFullYear() &&
           today.getMonth() === checkDate.getMonth() &&
           today.getDate() === checkDate.getDate();
  } catch {
    return false;
  }
}

/**
 * Gets a relative time string (e.g., "2 days ago", "in 3 hours")
 * @param {string} dateString - Date string to compare
 * @returns {string} Relative time string
 */
export function getRelativeTime(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    // For older dates, just return formatted date
    return formatDate(dateString);
  } catch {
    return formatDate(dateString);
  }
}