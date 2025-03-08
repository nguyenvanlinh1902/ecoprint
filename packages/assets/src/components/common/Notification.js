import React from 'react';
import { Snackbar, Alert } from '@mui/material';

/**
 * Reusable notification component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the notification is open
 * @param {string} props.message - Notification message
 * @param {string} props.severity - Notification severity (error, warning, info, success)
 * @param {Function} props.onClose - Function to call when notification is closed
 * @returns {JSX.Element} Notification component
 */
const Notification = ({ 
  open, 
  message, 
  severity = 'info', 
  onClose,
  autoHideDuration = 5000,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' }
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification; 