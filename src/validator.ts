/**
 * License key validation functionality
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { LicenseError } from './error';
import { LICENSE_PREFIX } from './constants';

/**
 * Information about a validated license
 */
export interface LicenseInfo {
  /** Whether the license is currently valid */
  isValid: boolean;
  /** When the license was issued */
  issuedAt: Date;
  /** When the license expires */
  expiresAt: Date;
  /** Hours remaining until expiration (0 if expired) */
  hoursRemaining: number;
}

/**
 * License key validator for offline validation
 */
export class LicenseValidator {
  private secretKey: string;

  /**
   * Create a new license validator with the provided secret key
   * 
   * @param secretKey - The same secret key used for generation
   * 
   * @example
   * ```typescript
   * import { LicenseValidator } from 'alvan-lic';
   * const validator = new LicenseValidator('my-secret-key');
   * ```
   */
  constructor(secretKey: string) {
    if (!secretKey || secretKey.trim().length === 0) {
      throw new Error('Secret key cannot be empty');
    }
    this.secretKey = secretKey;
  }

  /**
   * Validate a license key
   * 
   * @param licenseKey - The license key to validate
   * @returns LicenseInfo if the license is valid
   * @throws LicenseError if the license is invalid
   * 
   * @example
   * ```typescript
   * import { LicenseGenerator, LicenseValidator } from 'alvan-lic';
   * 
   * const secret = 'secret-key';
   * const generator = new LicenseGenerator(secret);
   * const validator = new LicenseValidator(secret);
   * 
   * const license = generator.generateKey(24);
   * const info = validator.validateKey(license);
   * console.log(info.isValid); // true
   * ```
   */
  validateKey(licenseKey: string): LicenseInfo {
    return this.validateKeyAtTime(licenseKey, new Date());
  }

  /**
   * Validate a license key at a specific time (useful for testing)
   * 
   * @param licenseKey - The license key to validate
   * @param currentTime - The time to validate against
   * @returns LicenseInfo if the license is valid
   * @throws LicenseError if the license is invalid
   */
  validateKeyAtTime(licenseKey: string, currentTime: Date): LicenseInfo {
    if (!licenseKey || typeof licenseKey !== 'string') {
      throw LicenseError.invalidFormat('License key must be a non-empty string');
    }

    // Check prefix
    if (!licenseKey.startsWith(LICENSE_PREFIX)) {
      throw LicenseError.invalidFormat(`License key must start with "${LICENSE_PREFIX}"`);
    }

    // Remove prefix and decode
    const encoded = licenseKey.slice(LICENSE_PREFIX.length);
    let data: Buffer;
    
    try {
      data = this.fromBase64Url(encoded);
    } catch (error) {
      throw LicenseError.base64Error('Failed to decode license key', error as Error);
    }

    // Find the separator
    const separatorIndex = data.indexOf(Buffer.from('.', 'utf8'));
    if (separatorIndex === -1) {
      throw LicenseError.invalidFormat('Missing separator in license data');
    }

    // Split payload and signature
    const payload = data.slice(0, separatorIndex);
    const providedSignature = data.slice(separatorIndex + 1);

    // Verify signature
    const expectedSignature = createHmac('sha256', this.secretKey)
      .update(payload)
      .digest();

    // Use timing-safe comparison to prevent timing attacks
    if (!timingSafeEqual(providedSignature, expectedSignature)) {
      throw LicenseError.invalidSignature('License signature verification failed');
    }

    // Parse payload
    const payloadStr = payload.toString('utf8');
    const parts = payloadStr.split(':');
    
    if (parts.length !== 2) {
      throw LicenseError.invalidFormat('Invalid payload format');
    }

    let issuedTimestamp: number;
    let expiresTimestamp: number;

    try {
      const issuedPart = parts[0];
      const expiresPart = parts[1];
      
      if (!issuedPart || !expiresPart) {
        throw LicenseError.invalidData('Missing timestamp data');
      }
      
      issuedTimestamp = parseInt(issuedPart, 10);
      expiresTimestamp = parseInt(expiresPart, 10);
      
      if (isNaN(issuedTimestamp) || isNaN(expiresTimestamp)) {
        throw LicenseError.timeError('Invalid timestamp format');
      }
    } catch (error) {
      throw LicenseError.timeError('Failed to parse timestamps', error as Error);
    }

    if (issuedTimestamp <= 0 || expiresTimestamp <= 0) {
      throw LicenseError.invalidData('Timestamps must be positive');
    }

    if (expiresTimestamp <= issuedTimestamp) {
      throw LicenseError.invalidData('Expiration time must be after issued time');
    }

    // Convert timestamps to Date objects (timestamps are in seconds)
    const issuedAt = new Date(issuedTimestamp * 1000);
    const expiresAt = new Date(expiresTimestamp * 1000);

    // Validate dates
    if (isNaN(issuedAt.getTime()) || isNaN(expiresAt.getTime())) {
      throw LicenseError.timeError('Invalid timestamp values');
    }

    // Check if expired
    const isValid = currentTime.getTime() < expiresAt.getTime();
    const hoursRemaining = isValid 
      ? Math.max(0, (expiresAt.getTime() - currentTime.getTime()) / (1000 * 60 * 60))
      : 0;

    if (!isValid) {
      throw LicenseError.expired('License has expired');
    }

    return {
      isValid,
      issuedAt,
      expiresAt,
      hoursRemaining
    };
  }

  /**
   * Convert base64url string to buffer (reverses the encoding from generator)
   */
  private fromBase64Url(str: string): Buffer {
    // Add padding if needed
    let padded = str;
    const paddingNeeded = 4 - (str.length % 4);
    if (paddingNeeded !== 4) {
      padded += '='.repeat(paddingNeeded);
    }

    // Convert URL-safe characters back to standard base64
    const base64 = padded
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    try {
      return Buffer.from(base64, 'base64');
    } catch (error) {
      throw new Error(`Invalid base64url string: ${error}`);
    }
  }

  /**
   * Get the secret key (for testing purposes)
   * @internal
   */
  getSecretKey(): string {
    return this.secretKey;
  }
}