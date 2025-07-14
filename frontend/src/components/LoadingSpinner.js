import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const spinnerSize = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  return (
    <div className="loading-spinner">
      <div className={`spinner-border text-primary ${spinnerSize[size]}`} role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      {text && size !== 'sm' && (
        <div className="mt-2 text-muted">{text}</div>
      )}
    </div>
  );
};

export default LoadingSpinner;
