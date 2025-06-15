/**
 * Utility functions for the alvan-lic package
 */

import { LicenseGenerator } from './generator';
import { LicenseValidator } from './validator';
import { LICENSE_DURATIONS, DEFAULT_SECRET_KEY } from './constants';

/**
 * Create a license generator with optional default secret key
 * 
 * @param secretKey - Secret key for signing (uses default if not provided)
 * @returns LicenseGenerator instance
 */
export function createLicenseGenerator(secretKey?: string): LicenseGenerator {
  return new LicenseGenerator(secretKey || DEFAULT_SECRET_KEY);
}

/**
 * Create a license validator with optional default secret key
 * 
 * @param secretKey - Secret key for validation (uses default if not provided)
 * @returns LicenseValidator instance
 */
export function createLicenseValidator(secretKey?: string): LicenseValidator {
  return new LicenseValidator(secretKey || DEFAULT_SECRET_KEY);
}

/**
 * Generate a license with preset duration
 */
export class QuickLicense {
  private generator: LicenseGenerator;

  constructor(secretKey: string) {
    this.generator = new LicenseGenerator(secretKey);
  }

  /**
   * Generate a 1-hour license
   */
  oneHour(): string {
    return this.generator.generateKey(LICENSE_DURATIONS.ONE_HOUR);
  }

  /**
   * Generate a 1-day license
   */
  oneDay(): string {
    return this.generator.generateKey(LICENSE_DURATIONS.ONE_DAY);
  }

  /**
   * Generate a 1-week license
   */
  oneWeek(): string {
    return this.generator.generateKey(LICENSE_DURATIONS.ONE_WEEK);
  }

  /**
   * Generate a 1-month license
   */
  oneMonth(): string {
    return this.generator.generateKey(LICENSE_DURATIONS.ONE_MONTH);
  }

  /**
   * Generate a 1-year license
   */
  oneYear(): string {
    return this.generator.generateKey(LICENSE_DURATIONS.ONE_YEAR);
  }
}

/**
 * Create a QuickLicense instance
 * 
 * @param secretKey - Secret key for license generation
 * @returns QuickLicense instance
 */
export function createQuickLicense(secretKey: string): QuickLicense {
  return new QuickLicense(secretKey);
}

/**
 * Validate license key with enhanced error information
 * 
 * @param licenseKey - License key to validate
 * @param secretKey - Secret key for validation
 * @returns Validation result with detailed information
 */
export function validateLicenseWithDetails(licenseKey: string, secretKey: string) {
  const validator = new LicenseValidator(secretKey);
  
  try {
    const info = validator.validateKey(licenseKey);
    return {
      valid: true,
      info,
      error: null,
      details: {
        remainingDays: Math.floor(info.hoursRemaining / 24),
        remainingHours: Math.floor(info.hoursRemaining % 24),
        remainingMinutes: Math.floor((info.hoursRemaining % 1) * 60),
        totalDuration: Math.floor((info.expiresAt.getTime() - info.issuedAt.getTime()) / (1000 * 60 * 60)),
        percentageRemaining: Math.round((info.hoursRemaining / ((info.expiresAt.getTime() - info.issuedAt.getTime()) / (1000 * 60 * 60))) * 100)
      }
    };
  } catch (error) {
    return {
      valid: false,
      info: null,
      error: error as Error,
      details: null
    };
  }
}

/**
 * Check if a license key has the correct format (without validation)
 * 
 * @param licenseKey - License key to check
 * @returns True if format is correct
 */
export function hasValidLicenseFormat(licenseKey: string): boolean {
  if (!licenseKey || typeof licenseKey !== 'string') {
    return false;
  }
  
  if (!licenseKey.startsWith('alvan-')) {
    return false;
  }
  
  const encoded = licenseKey.slice(6);
  if (encoded.length < 10) {
    return false;
  }
  
  // Check if it's valid base64url
  const base64urlPattern = /^[A-Za-z0-9_-]+$/;
  return base64urlPattern.test(encoded);
}

/**
 * Generate multiple licenses at once
 * 
 * @param secretKey - Secret key for generation
 * @param durations - Array of durations in hours
 * @returns Array of license keys
 */
export function generateMultipleLicenses(secretKey: string, durations: number[]): string[] {
  const generator = new LicenseGenerator(secretKey);
  return durations.map(duration => generator.generateKey(duration));
}

/**
 * Convert hours to human-readable duration string
 * 
 * @param hours - Number of hours
 * @returns Human-readable string
 */
export function formatDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  if (hours < 24) {
    return `${Math.round(hours)} hour${Math.round(hours) !== 1 ? 's' : ''}`;
  }
  
  if (hours < 168) {
    const days = Math.round(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  
  if (hours < 720) {
    const weeks = Math.round(hours / 168);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }
  
  if (hours < 8760) {
    const months = Math.round(hours / 720);
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  
  const years = Math.round(hours / 8760);
  return `${years} year${years !== 1 ? 's' : ''}`;
}