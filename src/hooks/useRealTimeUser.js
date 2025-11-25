import { useState, useEffect } from 'react';

/**
 * Custom hook to get real-time user updates from sessionStorage
 * @param {Object} initialUser - Initial user data
 * @returns {Object} Current user data that updates in real-time
 */
export const useRealTimeUser = (initialUser) => {
  const [currentUser, setCurrentUser] = useState(initialUser);
  
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
      setCurrentUser(updatedUser);
    };
    
    const handleUserUpdate = () => {
      handleStorageChange(); // Immediate update when custom event fires
    };
    
    // Listen for storage changes and custom events
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleUserUpdate);
    
    // Check for updates periodically within same tab
    const interval = setInterval(() => {
      const sessionUser = JSON.parse(sessionStorage.getItem('user') || '{}');
      if (JSON.stringify(sessionUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(sessionUser);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
      clearInterval(interval);
    };
  }, [currentUser]);
  
  return currentUser;
};