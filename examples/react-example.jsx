/**
 * React integration example for alvan-lic
 * This demonstrates how to use alvan-lic in React applications
 */

import React, { useState, useCallback, useMemo } from 'react';
import { LicenseValidator, LicenseError, formatDuration } from 'alvan-lic';

// Custom hook for license validation
function useLicenseValidator(secretKey) {
  const validator = useMemo(() => new LicenseValidator(secretKey), [secretKey]);
  
  const validateLicense = useCallback((licenseKey) => {
    try {
      const info = validator.validateKey(licenseKey);
      return {
        valid: true,
        info,
        error: null
      };
    } catch (error) {
      return {
        valid: false,
        info: null,
        error: error instanceof LicenseError ? error : new Error(error.message)
      };
    }
  }, [validator]);
  
  return validateLicense;
}

// License status component
function LicenseStatus({ info }) {
  const remainingDays = Math.floor(info.hoursRemaining / 24);
  const remainingHours = Math.floor(info.hoursRemaining % 24);
  const totalDuration = Math.floor(
    (info.expiresAt.getTime() - info.issuedAt.getTime()) / (1000 * 60 * 60)
  );
  const percentageRemaining = Math.round((info.hoursRemaining / totalDuration) * 100);
  
  return (
    <div className="license-status valid">
      <div className="status-header">
        <span className="status-icon">✅</span>
        <h3>License Valid</h3>
      </div>
      
      <div className="license-details">
        <div className="detail-row">
          <span className="label">Issued:</span>
          <span className="value">{info.issuedAt.toLocaleDateString()}</span>
        </div>
        <div className="detail-row">
          <span className="label">Expires:</span>
          <span className="value">{info.expiresAt.toLocaleDateString()}</span>
        </div>
        <div className="detail-row">
          <span className="label">Time Remaining:</span>
          <span className="value">
            {remainingDays > 0 && `${remainingDays} days `}
            {remainingHours} hours
          </span>
        </div>
        <div className="detail-row">
          <span className="label">License Usage:</span>
          <span className="value">{100 - percentageRemaining}% used</span>
        </div>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentageRemaining}%` }}
        />
      </div>
    </div>
  );
}

// Error display component
function LicenseError({ error }) {
  const getErrorMessage = (error) => {
    if (error instanceof LicenseError) {
      switch (error.type) {
        case 'EXPIRED':
          return 'Your license has expired. Please renew your license.';
        case 'INVALID_SIGNATURE':
          return 'Invalid license key. Please check your license key.';
        case 'INVALID_FORMAT':
          return 'License key format is invalid.';
        default:
          return error.message;
      }
    }
    return error.message;
  };
  
  return (
    <div className="license-status invalid">
      <div className="status-header">
        <span className="status-icon">❌</span>
        <h3>License Invalid</h3>
      </div>
      <p className="error-message">{getErrorMessage(error)}</p>
    </div>
  );
}

// Main license checker component
function LicenseChecker() {
  const [licenseKey, setLicenseKey] = useState('');
  const [secretKey, setSecretKey] = useState('alvan-default-secret-key-2024');
  const [result, setResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const validateLicense = useLicenseValidator(secretKey);
  
  const handleValidation = useCallback(async () => {
    if (!licenseKey.trim()) {
      alert('Please enter a license key');
      return;
    }
    
    setIsChecking(true);
    
    // Simulate async validation (in case you want to add server-side verification)
    setTimeout(() => {
      const validation = validateLicense(licenseKey.trim());
      setResult(validation);
      setIsChecking(false);
    }, 500);
  }, [licenseKey, validateLicense]);
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleValidation();
    }
  };
  
  return (
    <div className="license-checker">
      <div className="header">
        <h1>🔐 License Validator</h1>
        <p>Enter your license key to validate access</p>
      </div>
      
      <div className="input-section">
        <div className="input-group">
          <label htmlFor="licenseKey">License Key:</label>
          <input
            id="licenseKey"
            type="text"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="alvan-..."
            className="license-input"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="secretKey">Secret Key:</label>
          <input
            id="secretKey"
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Enter secret key"
            className="secret-input"
          />
        </div>
        
        <button 
          onClick={handleValidation}
          disabled={isChecking || !licenseKey.trim()}
          className="validate-button"
        >
          {isChecking ? 'Validating...' : 'Validate License'}
        </button>
      </div>
      
      {result && (
        <div className="result-section">
          {result.valid ? (
            <LicenseStatus info={result.info} />
          ) : (
            <LicenseError error={result.error} />
          )}
        </div>
      )}
      
      <style jsx>{`
        .license-checker {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .header h1 {
          margin: 0 0 10px 0;
          color: #333;
        }
        
        .header p {
          color: #666;
          margin: 0;
        }
        
        .input-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .input-group {
          margin-bottom: 15px;
        }
        
        .input-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #333;
        }
        
        .license-input, .secret-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }
        
        .license-input {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        .validate-button {
          width: 100%;
          padding: 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 10px;
        }
        
        .validate-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .validate-button:hover:not(:disabled) {
          background: #0056b3;
        }
        
        .license-status {
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
        
        .license-status.valid {
          background: #d4edda;
          border: 1px solid #c3e6cb;
        }
        
        .license-status.invalid {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
        }
        
        .status-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .status-header h3 {
          margin: 0 0 0 10px;
          color: #333;
        }
        
        .status-icon {
          font-size: 24px;
        }
        
        .license-details {
          margin-bottom: 15px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .detail-row .label {
          font-weight: 500;
          color: #666;
        }
        
        .detail-row .value {
          color: #333;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: #28a745;
          transition: width 0.3s ease;
        }
        
        .error-message {
          color: #721c24;
          margin: 10px 0 0 0;
        }
      `}</style>
    </div>
  );
}

export default LicenseChecker;

// Example usage in a React app:
/*
import React from 'react';
import ReactDOM from 'react-dom';
import LicenseChecker from './LicenseChecker';

function App() {
  return (
    <div>
      <LicenseChecker />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
*/