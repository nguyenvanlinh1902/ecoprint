import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Button, Container, Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * NotFound page component
 * Displayed when a user navigates to a non-existent route
 */
const NotFound = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Trang không tồn tại
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Đường dẫn bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/"
          sx={{ mt: 3 }}
        >
          Quay về trang chủ
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound; 