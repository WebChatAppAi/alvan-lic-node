/**
 * Constants used throughout the alvan-lic package
 */

/**
 * The prefix for all license keys
 */
export const LICENSE_PREFIX = 'alvan-';

/**
 * Package version
 */
export const VERSION = '1.0.0';

/**
 * Default secret key for testing (same as Rust version CLI)
 */
export const DEFAULT_SECRET_KEY = 'alvan-default-secret-key-2024';

/**
 * Common license durations in hours
 */
export const LICENSE_DURATIONS = {
  ONE_HOUR: 1,
  ONE_DAY: 24,
  ONE_WEEK: 168,
  ONE_MONTH: 720,
  ONE_YEAR: 8760
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  MIN_SECRET_KEY_LENGTH: 1,
  RECOMMENDED_SECRET_KEY_LENGTH: 32,
  MAX_HOURS: 1000000 // ~114 years
} as const;