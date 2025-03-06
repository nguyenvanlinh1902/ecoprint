import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/components/_loader.scss';

const Loader = ({ size, color, fullPage }) => {
  const loaderClass = `loader ${size ? `loader--${size}` : ''} ${color ? `loader--${color}` : ''}`;
  
  if (fullPage) {
    return (
      <div className="loader-overlay">
        <div className={loaderClass}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={loaderClass}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOf(['sm', 'lg']),
  color: PropTypes.oneOf(['primary', 'secondary', 'white']),
  fullPage: PropTypes.bool
};

Loader.defaultProps = {
  size: null,
  color: 'primary',
  fullPage: false
};

// Centered loader in a container
export const LoaderContainer = ({ children }) => (
  <div className="loader-container">
    {children || <Loader />}
  </div>
);

LoaderContainer.propTypes = {
  children: PropTypes.node
};

export default Loader; 