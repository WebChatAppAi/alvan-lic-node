/**
 * Integration tests for alvan-lic Node.js package
 * These tests match the functionality tested in the Rust version
 */

import { LicenseGenerator, LicenseValidator, LicenseError, LicenseErrorType } from '../src/index';

describe('alvan-lic Integration Tests', () => {
  const testSecret = 'integration-test-secret';

  describe('Full Workflow', () => {
    test('should generate and validate multiple licenses', () => {
      const generator = new LicenseGenerator(testSecret);
      const validator = new LicenseValidator(testSecret);

      const durations = [1, 24, 168, 8760]; // 1h, 1d, 1w, 1y
      const licenses = durations.map(hours => generator.generateKey(hours));

      // All should be valid
      licenses.forEach((license, index) => {
        const info = validator.validateKey(license);
        expect(info.isValid).toBe(true);
        expect(info.hoursRemaining).toBeGreaterThan(0);
        expect(info.hoursRemaining).toBeLessThanOrEqual(durations[index]);
      });
    });
  });

  describe('License Format', () => {
    test('should generate licenses with correct format', () => {
      const generator = new LicenseGenerator(testSecret);
      
      const testDurations = [1, 10, 100, 1000, 10000];
      testDurations.forEach(hours => {
        const license = generator.generateKey(hours);
        expect(license).toMatch(/^alvan-/);
        expect(license.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Security', () => {
    test('should not validate licenses with different secret keys', () => {
      const secret1 = 'secret-key-1';
      const secret2 = 'secret-key-2';
      
      const gen1 = new LicenseGenerator(secret1);
      const gen2 = new LicenseGenerator(secret2);
      
      const val1 = new LicenseValidator(secret1);
      const val2 = new LicenseValidator(secret2);
      
      // Generate with secret1
      const license1 = gen1.generateKey(24);
      
      // Should validate with secret1
      expect(() => val1.validateKey(license1)).not.toThrow();
      
      // Should NOT validate with secret2
      expect(() => val2.validateKey(license1)).toThrow(LicenseError);
      
      // Generate with secret2
      const license2 = gen2.generateKey(24);
      
      // Should validate with secret2
      expect(() => val2.validateKey(license2)).not.toThrow();
      
      // Should NOT validate with secret1
      expect(() => val1.validateKey(license2)).toThrow(LicenseError);
    });
  });

  describe('Expiration', () => {
    test('should fail validation for expired licenses', () => {
      const generator = new LicenseGenerator(testSecret);
      const validator = new LicenseValidator(testSecret);
      
      // Generate a key that's already expired (2 hours ago, 1 hour duration)
      const pastTime = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const expiredKey = generator.generateKeyWithTimestamp(1, pastTime);
      
      // Should fail validation
      expect(() => validator.validateKey(expiredKey)).toThrow(LicenseError);
      
      try {
        validator.validateKey(expiredKey);
      } catch (error) {
        expect(error).toBeInstanceOf(LicenseError);
        expect((error as LicenseError).type).toBe(LicenseErrorType.EXPIRED);
      }
    });

    test('should validate licenses that are not yet expired', () => {
      const generator = new LicenseGenerator(testSecret);
      const validator = new LicenseValidator(testSecret);
      
      // Generate a fresh license
      const license = generator.generateKey(24);
      const info = validator.validateKey(license);
      
      expect(info.isValid).toBe(true);
      expect(info.hoursRemaining).toBeGreaterThan(23.9);
      expect(info.hoursRemaining).toBeLessThanOrEqual(24);
    });
  });

  describe('Tampering Detection', () => {
    it('should detect various tampering attempts', () => {
      const generator = new LicenseGenerator(testSecret);
      const validator = new LicenseValidator(testSecret);
      const validLicense = generator.generateKey(24);

      // Various tampering attempts that should all fail validation
      const tamperedLicenses = [
        validLicense.slice(0, -5) + 'XXXXX', // Change last 5 characters
        validLicense.replace('alvan-', 'hacked-'), // Change prefix
        validLicense.substring(0, validLicense.length - 10) + '0123456789', // Change suffix
        'alvan-' + Buffer.from('fake:data:here').toString('base64url'), // Completely fake but valid base64url
        validLicense.slice(0, -1), // Truncate one character
        validLicense + 'X', // Add extra character
      ];

      tamperedLicenses.forEach((tampered, index) => {
        try {
          validator.validateKey(tampered);
          fail(`Tampered license ${index + 1} should have thrown an error: ${tampered}`);
        } catch (error) {
          expect(error).toBeInstanceOf(LicenseError);
        }
      });
    });
  });

  describe('Error Handling', () => {
    test('should throw appropriate errors for invalid inputs', () => {
      const validator = new LicenseValidator(testSecret);
      
      // Invalid format
      expect(() => validator.validateKey('invalid-license')).toThrow(LicenseError);
      expect(() => validator.validateKey('not-alvan-prefixed')).toThrow(LicenseError);
      expect(() => validator.validateKey('')).toThrow(LicenseError);
      
      // Test specific error types
      try {
        validator.validateKey('invalid-license');
      } catch (error) {
        expect(error).toBeInstanceOf(LicenseError);
        expect((error as LicenseError).type).toBe(LicenseErrorType.INVALID_FORMAT);
      }
    });

    test('should handle edge cases gracefully', () => {
      const generator = new LicenseGenerator(testSecret);
      
      // Invalid hours
      expect(() => generator.generateKey(0)).toThrow();
      expect(() => generator.generateKey(-1)).toThrow();
      
      // Invalid secret key
      expect(() => new LicenseGenerator('')).toThrow();
      expect(() => new LicenseValidator('')).toThrow();
    });
  });

  describe('Time Precision', () => {
    test('should handle timestamps correctly', () => {
      const generator = new LicenseGenerator(testSecret);
      const validator = new LicenseValidator(testSecret);
      
      const issuedAt = new Date('2024-01-01T12:00:00Z');
      const license = generator.generateKeyWithTimestamp(24, issuedAt);
      
      // Validate at a specific time (within the valid period)
      const validationTime = new Date('2024-01-01T18:00:00Z'); // 6 hours later
      const info = validator.validateKeyAtTime(license, validationTime);
      
      expect(info.isValid).toBe(true);
      expect(info.issuedAt).toEqual(issuedAt);
      expect(info.hoursRemaining).toBeCloseTo(18, 1); // ~18 hours remaining
    });
  });

  describe('Constructor Validation', () => {
    test('should validate constructor parameters', () => {
      // Valid constructors
      expect(() => new LicenseGenerator('valid-secret')).not.toThrow();
      expect(() => new LicenseValidator('valid-secret')).not.toThrow();
      
      // Invalid constructors
      expect(() => new LicenseGenerator('')).toThrow();
      expect(() => new LicenseGenerator('   ')).toThrow();
      expect(() => new LicenseValidator('')).toThrow();
      expect(() => new LicenseValidator('   ')).toThrow();
    });
  });

  describe('License Information Accuracy', () => {
    test('should provide accurate license information', () => {
      const generator = new LicenseGenerator(testSecret);
      const validator = new LicenseValidator(testSecret);
      
      const hours = 48; // 2 days
      const license = generator.generateKey(hours);
      const info = validator.validateKey(license);
      
      expect(info.isValid).toBe(true);
      expect(info.hoursRemaining).toBeGreaterThan(47.9);
      expect(info.hoursRemaining).toBeLessThanOrEqual(48);
      
      // Check that issued and expiry times make sense
      const actualDuration = (info.expiresAt.getTime() - info.issuedAt.getTime()) / (1000 * 60 * 60);
      expect(actualDuration).toBeCloseTo(hours, 1);
    });
  });
});