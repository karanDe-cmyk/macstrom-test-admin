import { jwtDecode } from 'jwt-decode';

export const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      console.warn('No auth token found in localStorage');
      return null;
    }

    const decoded = jwtDecode(token);
    
    // Token structure ke hisaab se userId nikalna
    return decoded.userId || decoded.id || decoded.sub || decoded.user_id;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getUserRoleFromToken = () => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      return null;
    }

    const decoded = jwtDecode(token);
    return decoded.role || decoded.userRole || null;
  } catch (error) {
    console.error('Error decoding token for role:', error);
    return null;
  }
};

export const getUserNameFromToken = () => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      return null;
    }

    const decoded = jwtDecode(token);
    return decoded.name || decoded.username || decoded.userName || null;
  } catch (error) {
    console.error('Error decoding token for name:', error);
    return null;
  }
};