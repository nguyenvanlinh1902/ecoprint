import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';
import { 
  Home as HomeIcon, 
  ShoppingCart as CartIcon, 
  Person as PersonIcon,
  Store as ShopIcon,
  Logout as LogoutIcon 
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    navigate('/login');
  };
  
  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center' 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ fontSize: 30, color: 'primary.main', mr: 1 }} />
              <Typography variant="h5" component="h1">
                Customer Dashboard
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Paper>
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Welcome to your Customer Dashboard
            </Typography>
            <Typography variant="body1" paragraph>
              This is a simple dashboard page for customers. In a real application, you would see your orders, profile information, and other relevant data here.
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handleCardClick('/dashboard/orders')}
                >
                  <CardHeader 
                    avatar={<CartIcon color="primary" fontSize="large" />}
                    title="My Orders" 
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      View and manage all your orders and track deliveries
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handleCardClick('/dashboard/profile')}
                >
                  <CardHeader 
                    avatar={<PersonIcon color="primary" fontSize="large" />}
                    title="My Profile" 
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Update your personal information and preferences
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handleCardClick('/products')}
                >
                  <CardHeader 
                    avatar={<CartIcon color="primary" fontSize="large" />}
                    title="Shop Now" 
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Browse our products and make new purchases
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
