/**
 * License key generation functionality
 */

import { createHmac } from 'crypto';
import { LicenseError } from './error';
import { LICENSE_PREFIX } from './constants';

/**
 * License key generator that creates time-based license keys
 */
export class LicenseGenerator {
  private secretKey: string;

  /**
   * Create a new license generator with the provided secret key
   * 
   * @param secretKey - A secret key used for HMAC signing
   * 
   * @example
   * ```typescript
   * import { LicenseGenerator } from 'alvan-lic';
   * const generator = new LicenseGenerator('my-secret-key');
   * ```
   */
  constructor(secretKey: string) {
    if (!secretKey || secretKey.trim().length === 0) {
      throw new Error('Secret key cannot be empty');
    }
    this.secretKey = secretKey;
  }

  /**
   * Generate a license key valid for the specified number of hours
   * 
   * @param hours - Number of hours the license should be valid
   * @returns A license key string starting with "alvan-"
   * 
   * @example
   * ```typescript
   * const generator = new LicenseGenerator('secret');
   * const license = generator.generateKey(24); // Valid for 24 hours
   * console.log(license); // alvan-...
   * ```
   */
  generateKey(hours: number): string {
    return this.generateKeyWithTimestamp(hours, new Date());
  }

  /**
   * Generate a license key with a custom timestamp (useful for testing)
   * 
   * @param hours - Number of hours the license should be valid
   * @param issuedAt - Custom issued timestamp
   * @returns A license key string starting with "alvan-"
   */
  generateKeyWithTimestamp(hours: number, issuedAt: Date): string {
    if (hours <= 0) {
      throw new Error('Hours must be greater than 0');
    }

    if (!issuedAt || isNaN(issuedAt.getTime())) {
      throw new Error('Invalid issued timestamp');
    }

    // Calculate expiration time
    const expiresAt = new Date(issuedAt.getTime() + (hours * 60 * 60 * 1000));

    // Create the payload (timestamps in seconds, like Rust version)
    const issuedTimestamp = Math.floor(issuedAt.getTime() / 1000);
    const expiresTimestamp = Math.floor(expiresAt.getTime() / 1000);
    const payload = `${issuedTimestamp}:${expiresTimestamp}`;

    // Create HMAC signature
    const hmac = createHmac('sha256', this.secretKey);
    hmac.update(payload, 'utf8');
    const signature = hmac.digest();

    // Combine payload and signature
    const payloadBuffer = Buffer.from(payload, 'utf8');
    const separatorBuffer = Buffer.from('.', 'utf8');
    const data = Buffer.concat([payloadBuffer, separatorBuffer, signature]);

    // Encode to base64url (no padding, URL-safe)
    const encoded = this.toBase64Url(data);

    // Add prefix
    return `${LICENSE_PREFIX}${encoded}`;
  }

  /**
   * Convert buffer to base64url encoding (no padding, URL-safe)
   * This matches the Rust implementation using URL_SAFE_NO_PAD
   */
  private toBase64Url(buffer: Buffer): string {
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Get the secret key (for testing purposes)
   * @internal
   */
  getSecretKey(): string {
    return this.secretKey;
  }
}