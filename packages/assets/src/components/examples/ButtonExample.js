import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper
} from '@mui/material';
import { 
  ShoppingCart, 
  Favorite, 
  Delete, 
  Save 
} from '@mui/icons-material';
import CustomButton from '../common/CustomButton';

/**
 * Example component demonstrating different CustomButton variants with Material UI
 */
const ButtonExample = () => {
  // States for loading simulation
  const [primaryLoading, setPrimaryLoading] = React.useState(false);
  const [secondaryLoading, setSecondaryLoading] = React.useState(false);
  
  // Simulate loading when primary button is clicked
  const handlePrimaryClick = () => {
    setPrimaryLoading(true);
    setTimeout(() => setPrimaryLoading(false), 2000);
  };
  
  // Simulate loading when secondary button is clicked
  const handleSecondaryClick = () => {
    setSecondaryLoading(true);
    setTimeout(() => setSecondaryLoading(false), 2000);
  };
  
  return React.createElement(
    Paper, 
    { 
      elevation: 3, 
      className: 'button-example',
      sx: { padding: 3 }
    },
    [
      React.createElement(
        Typography, 
        { 
          variant: 'h4', 
          component: 'h1', 
          gutterBottom: true,
          key: 'title'
        }, 
        'Button Examples'
      ),
      React.createElement(
        Grid, 
        {
          container: true,
          spacing: 3,
          key: 'contained-buttons'
        },
        [
          React.createElement(
            Grid, 
            { item: true, xs: 12, key: 'contained-title' },
            React.createElement(Typography, { variant: 'h6' }, 'Contained Buttons')
          ),
          React.createElement(
            Grid, 
            { item: true, xs: 12, sm: 6, md: 3, key: 'contained-primary' },
            React.createElement(
              CustomButton, 
              { 
                variant: 'contained', 
                color: 'primary', 
                startIcon: React.createElement(ShoppingCart),
                loading: primaryLoading,
                onClick: handlePrimaryClick
              }, 
              'Add to Cart'
            )
          ),
          React.createElement(
            Grid, 
            { item: true, xs: 12, sm: 6, md: 3, key: 'contained-secondary' },
            React.createElement(
              CustomButton, 
              { 
                variant: 'contained', 
                color: 'secondary',
                startIcon: React.createElement(Favorite),
                loading: secondaryLoading,
                onClick: handleSecondaryClick
              }, 
              'Favorite'
            )
          ),
          React.createElement(
            Grid, 
            { item: true, xs: 12, sm: 6, md: 3, key: 'contained-success' },
            React.createElement(
              CustomButton, 
              { 
                variant: 'contained', 
                color: 'success',
                startIcon: React.createElement(Save)
              }, 
              'Save'
            )
          ),
          React.createElement(
            Grid, 
            { item: true, xs: 12, sm: 6, md: 3, key: 'contained-error' },
            React.createElement(
              CustomButton, 
              { 
                variant: 'contained', 
                color: 'error',
                startIcon: React.createElement(Delete)
              }, 
              'Delete'
            )
          )
        ]
      ),
      React.createElement(
        Grid, 
        {
          container: true,
          spacing: 3,
          sx: { mt: 2 },
          key: 'outlined-buttons'
        },
        [
          React.createElement(
            Grid, 
            { item: true, xs: 12, key: 'outlined-title' },
            React.createElement(Typography, { variant: 'h6' }, 'Outlined Buttons')
          ),
          React.createElement(
            Grid, 
            { item: true, xs: 12, sm: 6, md: 3, key: 'outlined-primary' },
            React.createElement(
              CustomButton, 
              { 
                variant: 'outlined', 
                color: 'primary', 
                startIcon: React.createElement(ShoppingCart)
              }, 
              'Add to Cart'
            )
          ),
          React.createElement(
            Grid, 
            { item: true, xs: 12, sm: 6, md: 3, key: 'outlined-secondary' },
            React.createElement(
              CustomButton, 
              { 
                variant: 'outlined', 
                color: 'secondary',
                startIcon: React.createElement(Favorite)
              }, 
              'Favorite'
            )
          ),
          React.createElement(
            Grid, 
            { item: true, xs: 12, sm: 6, md: 3, key: 'outlined-success' },
            React.createElement(
              CustomButton, 
              { 
                variant: 'outlined', 
                color: 'success',
                startIcon: React.createElement(Save)
              }, 
              'Save'
            )
          ),
          React.createElement(
            Grid, 
            { item: true, xs: 12, sm: 6, md: 3, key: 'outlined-error' },
            React.createElement(
              CustomButton, 
              { 
                variant: 'outlined', 
                color: 'error',
                startIcon: React.createElement(Delete)
              }, 
              'Delete'
            )
          )
        ]
      ),
      React.createElement(
        Grid, 
        {
          container: true,
          spacing: 3,
          sx: { mt: 2 },
          key: 'text-buttons'
        },
        [
          React.createElement(
            Grid, 
            { item: true, xs: 12, key: 'text-title' },
            React.createElement(Typography, { variant: 'h6' }, 'Text Buttons')
          ),
          React.createElement(
            Grid, 
            { item: true, xs: 12, sm: 6, md: 3, key: 'text-primary' },
            React.createElement(
              CustomButton, 
              { 
                variant: 'text', 
                color: 'primary'
              }, 
              'Primary'
            )
          ),
          React.createElement(
            Grid, 
            { item: true, xs: 12, sm: 6, md: 3, key: 'text-secondary' },
            React.createElement(
              CustomButton, 
              { 
                variant: 'text', 
                color: 'secondary'
              }, 
              'Secondary'
            )
          ),
          React.createElement(
            Grid, 
            { item: true, xs: 12, sm: 6, md: 3, key: 'text-success' },
            React.createElement(
              CustomButton, 
              { 
                variant: 'text', 
                color: 'success'
              }, 
              'Success'
            )
          ),
          React.createElement(
            Grid, 
            { item: true, xs: 12, sm: 6, md: 3, key: 'text-error' },
            React.createElement(
              CustomButton, 
              { 
                variant: 'text', 
                color: 'error'
              }, 
              'Error'
            )
          )
        ]
      ),
      React.createElement(
        Grid, 
        {
          container: true,
          spacing: 3,
          sx: { mt: 2 },
          key: 'size-variations'
        },
        [
          React.createElement(
            Grid, 
            { item: true, xs: 12, key: 'size-title' },
            React.createElement(Typography, { variant: 'h6' }, 'Size Variations')
          ),
          React.createElement(
            Grid, 
            { item: true, xs: 12, sm: 4, key: 'size-small' },
            React.createElement(
              CustomButton, 
              { 
                variant: 'contained', 
                color: 'primary',
                size: 'small'
              }, 
              'Small Button'
            )
          ),
          React.createElement(
            Grid, 
            { item: true, xs: 12, sm: 4, key: 'size-medium' },
            React.createElement(
              CustomButton, 
              { 
                variant: 'contained', 
                color: 'primary',
                size: 'medium'
              }, 
              'Medium Button'
            )
          ),
          React.createElement(
            Grid, 
            { item: true, xs: 12, sm: 4, key: 'size-large' },
            React.createElement(
              CustomButton, 
              { 
                variant: 'contained', 
                color: 'primary',
                size: 'large'
              }, 
              'Large Button'
            )
          )
        ]
      ),
      React.createElement(
        Grid,
        {
          container: true,
          spacing: 3,
          sx: { mt: 2 },
          key: 'state-variations'
        },
        [
          React.createElement(
            Grid,
            { item: true, xs: 12, key: 'state-title' },
            React.createElement(Typography, { variant: 'h6' }, 'State Variations')
          ),
          React.createElement(
            Grid,
            { item: true, xs: 12, sm: 4, key: 'state-disabled' },
            React.createElement(
              CustomButton,
              {
                variant: 'contained',
                color: 'primary',
                disabled: true
              },
              'Disabled Button'
            )
          ),
          React.createElement(
            Grid,
            { item: true, xs: 12, sm: 4, key: 'state-loading' },
            React.createElement(
              CustomButton,
              {
                variant: 'contained',
                color: 'primary',
                loading: true
              },
              'Loading Button'
            )
          ),
          React.createElement(
            Grid,
            { item: true, xs: 12, sm: 4, key: 'state-fullwidth' },
            React.createElement(
              CustomButton,
              {
                variant: 'contained',
                color: 'primary',
                fullWidth: true
              },
              'Full Width Button'
            )
          )
        ]
      )
    ]
  );
};

export default ButtonExample; 