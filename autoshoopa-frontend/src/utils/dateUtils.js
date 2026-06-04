/**
 * Utility function to format dates safely across the application
 * Handles different date formats including Firebase Timestamps
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    let dateObj;
    
    // Handle different date formats
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date && typeof date.toDate === 'function') {
      // Firebase Timestamp
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      // Try to create a Date object
      dateObj = new Date(date);
    }
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.log('Invalid date created from:', date);
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error, 'Date value:', date);
    return 'Invalid Date';
  }
};

/**
 * Simple date formatter for basic date display
 */
export const formatSimpleDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    let dateObj;
    
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
}; 