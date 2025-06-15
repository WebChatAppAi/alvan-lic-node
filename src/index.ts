/**
 * # alvan-lic
 * 
 * A Node.js package for generating and validating time-based license keys with offline validation.
 * 
 * ## Features
 * - Generate license keys with custom expiration times
 * - Validate license keys offline using HMAC
 * - Keys always start with "alvan-"
 * - Secure against tampering using cryptographic signatures
 * 
 * ## Example
 * ```typescript
 * import { LicenseGenerator, LicenseValidator } from 'alvan-lic';
 * 
 * // Create a generator with your secret key
 * const secretKey = 'your-super-secret-key';
 * const generator = new LicenseGenerator(secretKey);
 * 
 * // Generate a license valid for 24 hours
 * const licenseKey = generator.generateKey(24);
 * console.log('Generated license:', licenseKey);
 * 
 * // Validate the license
 * const validator = new LicenseValidator(secretKey);
 * try {
 *   const info = validator.validateKey(licenseKey);
 *   console.log('License is valid until:', info.expiresAt);
 * } catch (error) {
 *   console.log('License validation failed:', error.message);
 * }
 * ```
 */

// Core functionality
export { LicenseGenerator } from './generator';
export { LicenseValidator } from './validator';
export type { LicenseInfo } from './validator';

// Error handling
export { LicenseError, LicenseErrorType } from './error';
export type { Result } from './error';
export { success, failure } from './error';

// Constants
export { 
  LICENSE_PREFIX, 
  VERSION, 
  DEFAULT_SECRET_KEY, 
  LICENSE_DURATIONS, 
  VALIDATION 
} from './constants';

// Utility functions
export { createLicenseGenerator, createLicenseValidator } from './utils';

// Default export for CommonJS compatibility
import { LicenseGenerator } from './generator';
import { LicenseValidator } from './validator';
import { LicenseError } from './error';

export default {
  LicenseGenerator,
  LicenseValidator,
  LicenseError,
  LICENSE_PREFIX: 'alvan-',
  VERSION: '1.0.0'
};