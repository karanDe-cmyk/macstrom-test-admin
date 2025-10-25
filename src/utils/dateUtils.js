// Parse date string in various formats
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Try parsing the Indian format (DD/MM/YYYY, hh:mm:ss aa)
  const indianFormat = /^(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}):(\d{2}):(\d{2})\s*(am|pm)$/i;
  const match = dateString.match(indianFormat);
  
  if (match) {
    const [, day, month, year, hours, minutes, seconds, ampm] = match;
    let hour = parseInt(hours);
    
    // Convert 12-hour format to 24-hour
    if (ampm.toLowerCase() === 'pm' && hour < 12) hour += 12;
    if (ampm.toLowerCase() === 'am' && hour === 12) hour = 0;
    
    return new Date(
      parseInt(year),
      parseInt(month) - 1, // months are 0-based
      parseInt(day),
      hour,
      parseInt(minutes),
      parseInt(seconds)
    );
  }
  
  // If not in Indian format, try standard date parsing
  return new Date(dateString);
};

// Format a date for display in the UI
export const formatDisplayDate = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = parseDate(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    return date.toLocaleString('en-IN', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original string if parsing fails
  }
};

// Format a date for sending to the API
export const formatAPIDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    // Parse the date using our custom parser
    const date = parseDate(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    // Format in Indian format (DD/MM/YYYY, hh:mm:ss aa)
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // convert 0 to 12
    hours = hours.toString().padStart(2, '0');
    
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  } catch (error) {
    console.error('Error formatting date for API:', error);
    return null;
  }
};
