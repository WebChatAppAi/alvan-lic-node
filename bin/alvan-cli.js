#!/usr/bin/env node

/**
 * Interactive CLI tool for generating and validating license keys
 * This matches the functionality of the Rust version's CLI tool
 */

const { Command } = require('commander');
const readline = require('readline');
const { LicenseGenerator, LicenseValidator, LicenseError, DEFAULT_SECRET_KEY } = require('../dist/index.js');

const program = new Command();

// Configure CLI
program
  .name('alvan-cli')
  .description('🔐 Alvan License Key Manager')
  .version('1.0.0');

// Add generate command
program
  .command('generate')
  .description('Generate a new license key')
  .option('-s, --secret <secret>', 'Secret key for signing')
  .option('-h, --hours <hours>', 'Duration in hours', '24')
  .action(async (options) => {
    const secretKey = options.secret || DEFAULT_SECRET_KEY;
    const hours = parseInt(options.hours, 10);

    if (isNaN(hours) || hours <= 0) {
      console.error('❌ Invalid hours value. Must be a positive number.');
      process.exit(1);
    }

    try {
      const generator = new LicenseGenerator(secretKey);
      const license = generator.generateKey(hours);
      
      console.log('\n✅ License key generated successfully!');
      console.log(`📋 License Key: ${license}`);
      console.log(`⏰ Valid for: ${hours} hours`);
      console.log(`🔑 Secret used: ${secretKey === DEFAULT_SECRET_KEY ? 'default' : 'custom'}`);
      
      const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
      console.log(`📅 Expires at: ${expiresAt.toISOString()}`);
    } catch (error) {
      console.error('❌ Failed to generate license key:', error.message);
      process.exit(1);
    }
  });

// Add validate command
program
  .command('validate')
  .description('Validate an existing license key')
  .option('-s, --secret <secret>', 'Secret key for validation')
  .option('-k, --key <key>', 'License key to validate')
  .action(async (options) => {
    const secretKey = options.secret || DEFAULT_SECRET_KEY;
    let licenseKey = options.key;

    if (!licenseKey) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      licenseKey = await new Promise((resolve) => {
        rl.question('Enter the license key to validate: ', (answer) => {
          rl.close();
          resolve(answer.trim());
        });
      });
    }

    if (!licenseKey) {
      console.error('❌ License key cannot be empty!');
      process.exit(1);
    }

    try {
      const validator = new LicenseValidator(secretKey);
      const info = validator.validateKey(licenseKey);

      console.log('\n✅ License key is VALID!');
      console.log('📊 License Information:');
      console.log(`   📅 Issued at: ${info.issuedAt.toISOString()}`);
      console.log(`   ⏰ Expires at: ${info.expiresAt.toISOString()}`);
      console.log(`   🕒 Hours remaining: ${info.hoursRemaining.toFixed(2)}`);
      console.log(`   ✅ Status: Active`);
    } catch (error) {
      console.log('\n❌ License key validation FAILED!');
      if (error instanceof LicenseError) {
        switch (error.type) {
          case 'EXPIRED':
            console.log('   🕒 Reason: License has expired');
            break;
          case 'INVALID_SIGNATURE':
            console.log('   🔑 Reason: Invalid signature (wrong secret key or tampered key)');
            break;
          case 'INVALID_FORMAT':
            console.log('   📝 Reason: Invalid license key format');
            break;
          case 'INVALID_DATA':
            console.log(`   📊 Reason: Invalid data - ${error.message}`);
            break;
          case 'BASE64_ERROR':
            console.log('   🔤 Reason: Base64 decoding error');
            break;
          case 'TIME_ERROR':
            console.log('   📅 Reason: Time parsing error');
            break;
          default:
            console.log(`   ❓ Reason: ${error.message}`);
        }
      } else {
        console.log(`   ❓ Reason: ${error.message}`);
      }
      process.exit(1);
    }
  });

// Interactive mode (default when no command is provided)
program
  .command('interactive', { isDefault: true })
  .description('Start interactive mode')
  .action(async () => {
    await runInteractiveMode();
  });

async function runInteractiveMode() {
  console.log('🔐 Alvan License Key Manager');
  console.log('==============================');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  while (true) {
    console.log('\nWhat would you like to do?');
    console.log('1. Generate a new license key');
    console.log('2. Validate an existing license key');
    console.log('3. Exit');

    const choice = await askQuestion(rl, '\nEnter your choice (1-3): ');

    switch (choice.trim()) {
      case '1':
        await generateKeyInteractive(rl);
        break;
      case '2':
        await validateKeyInteractive(rl);
        break;
      case '3':
        console.log('👋 Goodbye!');
        rl.close();
        return;
      default:
        console.log('❌ Invalid choice. Please enter 1, 2, or 3.');
    }
  }
}

async function generateKeyInteractive(rl) {
  console.log('\n🔧 License Key Generation');
  console.log('-------------------------');

  const secretKey = await getSecretKeyInteractive(rl);
  const hours = await getHoursInputInteractive(rl);

  try {
    const generator = new LicenseGenerator(secretKey);
    const license = generator.generateKey(hours);

    console.log('\n✅ License key generated successfully!');
    console.log(`📋 License Key: ${license}`);
    console.log(`⏰ Valid for: ${hours} hours`);
    console.log(`🔑 Secret used: ${secretKey === DEFAULT_SECRET_KEY ? 'default' : 'custom'}`);

    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    console.log(`📅 Expires at: ${expiresAt.toISOString()}`);
  } catch (error) {
    console.error('❌ Failed to generate license key:', error.message);
  }
}

async function validateKeyInteractive(rl) {
  console.log('\n🔍 License Key Validation');
  console.log('-------------------------');

  const licenseKey = await askQuestion(rl, 'Enter the license key to validate: ');

  if (!licenseKey.trim()) {
    console.log('❌ License key cannot be empty!');
    return;
  }

  console.log(''); // Add spacing
  const secretKey = await getSecretKeyInteractive(rl);

  try {
    const validator = new LicenseValidator(secretKey);
    const info = validator.validateKey(licenseKey.trim());

    console.log('\n✅ License key is VALID!');
    console.log('📊 License Information:');
    console.log(`   📅 Issued at: ${info.issuedAt.toISOString()}`);
    console.log(`   ⏰ Expires at: ${info.expiresAt.toISOString()}`);
    console.log(`   🕒 Hours remaining: ${info.hoursRemaining.toFixed(2)}`);
    console.log(`   ✅ Status: Active`);
  } catch (error) {
    console.log('\n❌ License key validation FAILED!');
    // Same error handling as command mode
    if (error instanceof LicenseError) {
      switch (error.type) {
        case 'EXPIRED':
          console.log('   🕒 Reason: License has expired');
          break;
        case 'INVALID_SIGNATURE':
          console.log('   🔑 Reason: Invalid signature (wrong secret key or tampered key)');
          break;
        case 'INVALID_FORMAT':
          console.log('   📝 Reason: Invalid license key format');
          break;
        case 'INVALID_DATA':
          console.log(`   📊 Reason: Invalid data - ${error.message}`);
          break;
        case 'BASE64_ERROR':
          console.log('   🔤 Reason: Base64 decoding error');
          break;
        case 'TIME_ERROR':
          console.log('   📅 Reason: Time parsing error');
          break;
        default:
          console.log(`   ❓ Reason: ${error.message}`);
      }
    } else {
      console.log(`   ❓ Reason: ${error.message}`);
    }
  }
}

async function getSecretKeyInteractive(rl) {
  console.log('🔐 Secret Key Configuration');
  console.log('1. Use default secret key (recommended for testing)');
  console.log('2. Enter custom secret key');

  const choice = await askQuestion(rl, 'Choose option (1-2): ');

  switch (choice.trim()) {
    case '1':
      console.log('✅ Using default secret key');
      return DEFAULT_SECRET_KEY;
    case '2':
      const secret = await askQuestion(rl, 'Enter your secret key: ');
      if (!secret.trim()) {
        console.log('⚠️  Empty secret key provided, using default instead');
        return DEFAULT_SECRET_KEY;
      } else if (secret.length < 8) {
        console.log('⚠️  Secret key is very short (less than 8 characters). Consider using a longer key for better security.');
        return secret.trim();
      } else {
        console.log('✅ Using custom secret key');
        return secret.trim();
      }
    default:
      console.log('❌ Invalid choice, using default secret key');
      return DEFAULT_SECRET_KEY;
  }
}

async function getHoursInputInteractive(rl) {
  while (true) {
    console.log('\n⏰ License Duration Options:');
    console.log('1. 1 hour');
    console.log('2. 24 hours (1 day)');
    console.log('3. 168 hours (1 week)');
    console.log('4. 720 hours (30 days)');
    console.log('5. 8760 hours (1 year)');
    console.log('6. Custom duration');

    const choice = await askQuestion(rl, 'Choose duration (1-6): ');

    switch (choice.trim()) {
      case '1': return 1;
      case '2': return 24;
      case '3': return 168;
      case '4': return 720;
      case '5': return 8760;
      case '6':
        const customInput = await askQuestion(rl, 'Enter custom duration in hours: ');
        const hours = parseInt(customInput.trim(), 10);
        if (isNaN(hours) || hours <= 0) {
          console.log('❌ Duration must be greater than 0');
          continue;
        }
        return hours;
      default:
        console.log('❌ Invalid choice. Please enter 1-6.');
    }
  }
}

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Parse command line arguments
program.parse();