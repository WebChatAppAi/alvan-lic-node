/**
 * Error types for the alvan-lic package
 */

export enum LicenseErrorType {
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE', 
  EXPIRED = 'EXPIRED',
  INVALID_DATA = 'INVALID_DATA',
  BASE64_ERROR = 'BASE64_ERROR',
  TIME_ERROR = 'TIME_ERROR'
}

/**
 * Custom error class for license-related operations
 */
export class LicenseError extends Error {
  public readonly type: LicenseErrorType;
  public readonly originalError?: Error | undefined;

  constructor(
    message: string,
    type: LicenseErrorType = LicenseErrorType.INVALID_DATA,
    originalError?: Error
  ) {
    super(message);
    this.name = 'LicenseError';
    this.type = type;
    this.originalError = originalError;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LicenseError);
    }
  }

  /**
   * Create an invalid format error
   */
  static invalidFormat(message: string = 'Invalid license key format'): LicenseError {
    return new LicenseError(message, LicenseErrorType.INVALID_FORMAT);
  }

  /**
   * Create an invalid signature error
   */
  static invalidSignature(message: string = 'Invalid license signature'): LicenseError {
    return new LicenseError(message, LicenseErrorType.INVALID_SIGNATURE);
  }

  /**
   * Create an expired license error
   */
  static expired(message: string = 'License has expired'): LicenseError {
    return new LicenseError(message, LicenseErrorType.EXPIRED);
  }

  /**
   * Create an invalid data error
   */
  static invalidData(message: string, originalError?: Error): LicenseError {
    return new LicenseError(`Invalid license data: ${message}`, LicenseErrorType.INVALID_DATA, originalError);
  }

  /**
   * Create a base64 decoding error
   */
  static base64Error(message: string, originalError?: Error): LicenseError {
    return new LicenseError(`Base64 decoding error: ${message}`, LicenseErrorType.BASE64_ERROR, originalError);
  }

  /**
   * Create a time parsing error
   */
  static timeError(message: string, originalError?: Error): LicenseError {
    return new LicenseError(`Time parsing error: ${message}`, LicenseErrorType.TIME_ERROR, originalError);
  }
}

/**
 * Result type for operations that may fail
 */
export type Result<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: LicenseError;
};

/**
 * Create a successful result
 */
export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Create a failed result
 */
export function failure<T>(error: LicenseError): Result<T> {
  return { success: false, error };
}