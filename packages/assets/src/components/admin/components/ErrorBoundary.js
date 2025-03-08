import React from 'react';
import { Box, Alert, Button } from '@mui/material';

/**
 * Component bắt lỗi trong các component con, hiển thị thông báo lỗi thân thiện
 * thay vì làm sập ứng dụng
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState(prevState => ({
      ...prevState,
      errorInfo
    }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {this.state.error?.message || 'An error occurred while loading Customer Management'}
          </Alert>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => this.setState({ hasError: false })}
          >
            Retry
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 