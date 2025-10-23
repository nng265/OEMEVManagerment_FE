import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../atoms/Button/Button';
import './ErrorBoundary.css';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });
  };

  handleToggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  render() {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { 
      fallback,
      title = 'Something went wrong',
      message = 'We apologize for the inconvenience. Please try again later.',
      showReset = true
    } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h2 className="error-title">{title}</h2>
            <p className="error-message">{message}</p>
            
            <div className="error-actions">
              {showReset && (
                <Button 
                  variant="primary"
                  onClick={this.handleReset}
                  className="error-reset-btn"
                >
                  Try Again
                </Button>
              )}
              {error && (
                <Button
                  variant="secondary"
                  onClick={this.handleToggleDetails}
                  className="error-details-btn"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              )}
            </div>

            {showDetails && (
              <div className="error-details">
                <h3>Error Details</h3>
                <p className="error-name">{error && error.toString()}</p>
                {errorInfo && (
                  <div className="error-stack">
                    <h4>Component Stack:</h4>
                    <pre>{errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  title: PropTypes.string,
  message: PropTypes.string,
  showReset: PropTypes.bool,
  onError: PropTypes.func
};
