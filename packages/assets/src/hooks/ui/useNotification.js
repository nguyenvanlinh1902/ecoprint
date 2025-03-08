import { useState } from 'react';

/**
 * Custom hook for managing notification state
 * 
 * @returns {Object} Notification state and methods
 */
export const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' // 'error', 'warning', 'info', 'success'
  });

  /**
   * Show a notification with the given message and severity
   * 
   * @param {string} message - The notification message
   * @param {string} severity - The notification severity (error, warning, info, success)
   */
  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  /**
   * Hide the current notification
   */
  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  return {
    notification,
    showNotification,
    hideNotification
  };
};

export default useNotification; 