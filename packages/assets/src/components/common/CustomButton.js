import React from 'react';
import PropTypes from 'prop-types';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import classNames from 'classnames';

/**
 * CustomButton component that combines Material UI with custom BEM styles
 */
const CustomButton = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  startIcon,
  endIcon,
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  className,
  ...props
}) => {
  // Map MUI props to BEM classes
  const bemClasses = classNames(
    'button',
    {
      [`button--${color}`]: color,
      'button--small': size === 'small',
      'button--large': size === 'large',
      'button--outlined': variant === 'outlined',
      'button--text': variant === 'text',
      'button--full-width': fullWidth,
      'button--disabled': disabled,
      'button--loading': loading
    },
    className
  );

  return React.createElement(
    MuiButton,
    {
      variant,
      color,
      size,
      startIcon: startIcon && !loading ? 
        React.createElement('span', { className: 'button__icon' }, startIcon) : 
        null,
      endIcon: endIcon && !loading ? 
        React.createElement('span', { className: 'button__icon button__icon--end' }, endIcon) : 
        null,
      fullWidth,
      disabled: disabled || loading,
      onClick,
      className: bemClasses,
      ...props
    },
    [
      React.createElement('span', { className: 'button__text', key: 'text' }, children),
      loading ? 
        React.createElement(CircularProgress, { 
          size: 24, 
          className: 'button__loader', 
          color: 'inherit',
          key: 'loader' 
        }) : 
        null
    ]
  );
};

CustomButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'info', 'warning']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
};

export default CustomButton; 