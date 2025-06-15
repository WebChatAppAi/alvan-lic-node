/**
 * Basic usage example for alvan-lic Node.js package
 * This demonstrates the same functionality as the Rust version
 */

const { LicenseGenerator, LicenseValidator } = require('../dist/index.js');

function main() {
  // IMPORTANT: Use a strong, randomly generated secret key in production!
  // This is just an example. Store your secret key securely.
  const secretKey = 'your-super-secret-key-change-this-in-production';

  // Create a license generator
  const generator = new LicenseGenerator(secretKey);

  // Generate licenses with different durations
  console.log('Generating licenses...\n');

  try {
    // 1 hour license
    const license1h = generator.generateKey(1);
    console.log('1 hour license:', license1h);

    // 24 hour license
    const license24h = generator.generateKey(24);
    console.log('24 hour license:', license24h);

    // 30 day license (720 hours)
    const license30d = generator.generateKey(720);
    console.log('30 day license:', license30d);

    // 1 year license (8760 hours)
    const license1y = generator.generateKey(8760);
    console.log('1 year license:', license1y);

    // Create a validator with the same secret key
    const validator = new LicenseValidator(secretKey);

    console.log('\nValidating licenses...\n');

    // Validate the 24 hour license
    try {
      const info = validator.validateKey(license24h);
      console.log('License validation successful!');
      console.log('  Valid:', info.isValid);
      console.log('  Issued at:', info.issuedAt.toISOString());
      console.log('  Expires at:', info.expiresAt.toISOString());
      console.log('  Hours remaining:', info.hoursRemaining.toFixed(2));
    } catch (error) {
      console.log('License validation failed:', error.message);
    }

    // Example of validation with wrong secret key
    console.log('\nTrying validation with wrong secret key...');
    const wrongValidator = new LicenseValidator('wrong-secret-key');
    try {
      wrongValidator.validateKey(license24h);
      console.log('This shouldn\'t happen!');
    } catch (error) {
      console.log('Expected error:', error.message);
    }

    // Example of invalid license format
    console.log('\nTrying validation with invalid license...');
    try {
      validator.validateKey('invalid-license-key');
      console.log('This shouldn\'t happen!');
    } catch (error) {
      console.log('Expected error:', error.message);
    }

    // Example of expired license (generate one that expired 2 hours ago)
    console.log('\nTesting expired license...');
    const pastTime = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
    const expiredLicense = generator.generateKeyWithTimestamp(1, pastTime); // 1 hour duration
    try {
      validator.validateKey(expiredLicense);
      console.log('This shouldn\'t happen!');
    } catch (error) {
      console.log('Expected expired error:', error.message);
    }

  } catch (error) {
    console.error('Error during license operations:', error.message);
  }
}

// Run the example
if (require.main === module) {
  main();
}