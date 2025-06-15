<div align="center">

# 🔐 alvan-lic

**A Node.js package for generating and validating time-based license keys with offline validation**

[![npm version](https://img.shields.io/npm/v/alvan-lic.svg?style=for-the-badge)](https://www.npmjs.com/package/alvan-lic)
[![Downloads](https://img.shields.io/npm/dt/alvan-lic.svg?style=for-the-badge)](https://www.npmjs.com/package/alvan-lic)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen?style=for-the-badge)](https://nodejs.org)

[📦 NPM Package](https://www.npmjs.com/package/alvan-lic) | [🐙 GitHub](https://github.com/WebChatAppAi/alvan-lic-node) | [📖 API Docs](https://github.com/WebChatAppAi/alvan-lic-node#api-reference)

</div>

---

## ✨ Features

<table>
<tr>
<td>🔐</td>
<td><strong>Secure</strong></td>
<td>Uses HMAC-SHA256 for cryptographic signing</td>
</tr>
<tr>
<td>⏱️</td>
<td><strong>Time-based</strong></td>
<td>Create licenses valid for any duration (hours)</td>
</tr>
<tr>
<td>🔌</td>
<td><strong>Offline</strong></td>
<td>No internet connection required for validation</td>
</tr>
<tr>
<td>🚀</td>
<td><strong>Fast</strong></td>
<td>Minimal dependencies and efficient implementation</td>
</tr>
<tr>
<td>🛡️</td>
<td><strong>Tamper-proof</strong></td>
<td>Any modification to the license key will invalidate it</td>
</tr>
<tr>
<td>⚡</td>
<td><strong>Electron Ready</strong></td>
<td>Perfect for Electron applications</td>
</tr>
<tr>
<td>⚛️</td>
<td><strong>React Compatible</strong></td>
<td>Works seamlessly in React applications</td>
</tr>
<tr>
<td>🔧</td>
<td><strong>CLI Tools</strong></td>
<td>Interactive command-line interface included</td>
</tr>
</table>

## 📦 Installation

### As a Library

```bash
npm install alvan-lic
```

### With CLI Tools

The CLI tools are included automatically when you install the package:

```bash
npx alvan-cli
```

Or install globally for easier access:

```bash
npm install -g alvan-lic
alvan-cli
```

## 🚀 Quick Start

### Basic Usage

```javascript
const { LicenseGenerator, LicenseValidator } = require('alvan-lic');

// Use a strong secret key in production
const secretKey = 'your-super-secret-key';

// Generate a license valid for 24 hours
const generator = new LicenseGenerator(secretKey);
const licenseKey = generator.generateKey(24);
console.log('License:', licenseKey);

// Validate the license
const validator = new LicenseValidator(secretKey);
try {
  const info = validator.validateKey(licenseKey);
  console.log(`✅ Valid for ${info.hoursRemaining.toFixed(1)} more hours`);
} catch (error) {
  console.log(`❌ Invalid license: ${error.message}`);
}
```

### ES Modules (TypeScript/Modern JavaScript)

```typescript
import { LicenseGenerator, LicenseValidator } from 'alvan-lic';

const secretKey = 'your-super-secret-key';
const generator = new LicenseGenerator(secretKey);
const validator = new LicenseValidator(secretKey);

const license = generator.generateKey(24);
const info = validator.validateKey(license);
```

## 📖 Usage Examples

### 🔑 Generating License Keys

```javascript
const { LicenseGenerator } = require('alvan-lic');

const generator = new LicenseGenerator('secret-key');

// Generate different duration licenses
const oneHour = generator.generateKey(1);        // 1 hour
const oneDay = generator.generateKey(24);        // 24 hours  
const oneMonth = generator.generateKey(24 * 30); // 30 days
const oneYear = generator.generateKey(24 * 365); // 365 days

console.log('1 hour license:', oneHour);
console.log('1 day license:', oneDay);
```

### ✅ Validating License Keys

```javascript
const { LicenseValidator, LicenseError } = require('alvan-lic');

const validator = new LicenseValidator('secret-key');

try {
  const info = validator.validateKey(licenseKey);
  
  console.log('✅ License is valid!');
  console.log('📅 Issued:', info.issuedAt.toISOString());
  console.log('⏰ Expires:', info.expiresAt.toISOString());
  console.log('⏳ Hours remaining:', info.hoursRemaining.toFixed(2));
  
  // Additional time breakdowns
  const days = Math.floor(info.hoursRemaining / 24);
  const hours = Math.floor(info.hoursRemaining % 24);
  console.log(`📊 ${days} days and ${hours} hours remaining`);
  
} catch (error) {
  if (error instanceof LicenseError) {
    switch (error.type) {
      case 'EXPIRED':
        console.log('❌ License has expired');
        break;
      case 'INVALID_SIGNATURE':
        console.log('❌ Invalid signature (wrong secret key)');
        break;
      case 'INVALID_FORMAT':
        console.log('❌ Invalid license format');
        break;
      default:
        console.log('❌ License validation failed:', error.message);
    }
  }
}
```

### 🔧 Using Utility Functions

```javascript
const { 
  createQuickLicense, 
  validateLicenseWithDetails,
  formatDuration 
} = require('alvan-lic');

// Quick license generation
const quick = createQuickLicense('secret-key');
const dailyLicense = quick.oneDay();
const weeklyLicense = quick.oneWeek();

// Enhanced validation with detailed breakdown
const result = validateLicenseWithDetails(licenseKey, 'secret-key');
if (result.valid) {
  console.log(`License valid for ${result.details.remainingDays} days`);
  console.log(`${result.details.percentageRemaining}% of license remaining`);
}

// Format durations
console.log(formatDuration(1.5));   // "1 hour"
console.log(formatDuration(25));    // "1 day"
console.log(formatDuration(168));   // "1 week"
```

## 🖥️ CLI Usage

### Interactive Mode

```bash
npx alvan-cli
```

This launches an interactive menu similar to the Rust version:

```
🔐 Alvan License Key Manager
==============================

What would you like to do?
1. Generate a new license key
2. Validate an existing license key  
3. Exit

Enter your choice (1-3):
```

### Command Line Mode

```bash
# Generate a license key
npx alvan-cli generate --hours 24 --secret "my-secret-key"

# Validate a license key
npx alvan-cli validate --key "alvan-..." --secret "my-secret-key"

# Use default secret for testing
npx alvan-cli generate --hours 168
```

## ⚛️ React Integration

### Basic React Hook

```jsx
import React, { useState } from 'react';
import { LicenseValidator } from 'alvan-lic';

function useLicenseValidation(secretKey) {
  const [validator] = useState(() => new LicenseValidator(secretKey));
  
  const validateLicense = (licenseKey) => {
    try {
      const info = validator.validateKey(licenseKey);
      return { valid: true, info, error: null };
    } catch (error) {
      return { valid: false, info: null, error };
    }
  };
  
  return validateLicense;
}

function LicenseChecker() {
  const [licenseKey, setLicenseKey] = useState('');
  const [result, setResult] = useState(null);
  const validateLicense = useLicenseValidation('your-secret-key');
  
  const handleValidate = () => {
    const validation = validateLicense(licenseKey);
    setResult(validation);
  };
  
  return (
    <div>
      <input 
        value={licenseKey}
        onChange={(e) => setLicenseKey(e.target.value)}
        placeholder="Enter license key"
      />
      <button onClick={handleValidate}>Validate</button>
      
      {result && (
        <div>
          {result.valid ? (
            <p>✅ License valid for {result.info.hoursRemaining.toFixed(1)} hours</p>
          ) : (
            <p>❌ {result.error.message}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

## ⚡ Electron Integration

### Main Process (Node.js)

```javascript
// main.js
const { LicenseValidator } = require('alvan-lic');
const { ipcMain } = require('electron');

const validator = new LicenseValidator('your-secret-key');

ipcMain.handle('validate-license', async (event, licenseKey) => {
  try {
    const info = validator.validateKey(licenseKey);
    return { valid: true, info };
  } catch (error) {
    return { valid: false, error: error.message };
  }
});
```

### Renderer Process

```javascript
// renderer.js
const { ipcRenderer } = require('electron');

async function validateLicense(licenseKey) {
  const result = await ipcRenderer.invoke('validate-license', licenseKey);
  
  if (result.valid) {
    console.log('License valid until:', result.info.expiresAt);
  } else {
    console.log('License invalid:', result.error);
  }
}
```

## 🔒 Security Considerations

> **⚠️ Important Security Notes**

### 🔐 Secret Key Management
- **Use a strong, randomly generated secret key (32+ characters)**
- **Keep your secret key secure and never expose it in client-side code**
- **Use different secret keys for different applications/environments**
- **Store secret keys in environment variables or secure key management systems**

```javascript
// ✅ Good - secret key in environment variable
const secretKey = process.env.LICENSE_SECRET_KEY;

// ❌ Bad - secret key hardcoded
const secretKey = 'hardcoded-secret-key';
```

### 🔌 Offline Validation
- The same secret key must be used for generation and validation
- Keys cannot be forged without knowing the secret key  
- Validation works completely offline - no server required

### ⏰ Time Synchronization
- Ensure system clocks are reasonably synchronized
- Keys are validated against the system's current time
- Consider time zone differences in distributed systems

### 🛡️ Best Practices

```javascript
// Use environment variables for secrets
const secretKey = process.env.LICENSE_SECRET || 'fallback-for-dev';

// Validate secret key strength
if (secretKey.length < 32) {
  console.warn('⚠️ Secret key should be at least 32 characters long');
}

// Handle validation errors appropriately
try {
  const info = validator.validateKey(licenseKey);
  // Grant access to licensed features
} catch (error) {
  if (error.type === 'EXPIRED') {
    // Show license renewal prompt
  } else {
    // Log security violation attempt
    console.warn('License validation failed:', error.message);
  }
}
```

## 📋 License Format

All license keys follow this format:

```
alvan-<base64url-encoded-payload-and-signature>
```

**Example:**
```
alvan-MTcwNDQ2NzI4MjoxNzA0NTUzNjgyLkPCt8K3w4Qpw6ZVwq0N...
```

The payload contains:
- Issued timestamp (Unix timestamp in seconds)
- Expiration timestamp (Unix timestamp in seconds)  
- HMAC-SHA256 signature for tamper detection

## 🚨 Error Handling

The package provides detailed error types for robust error handling:

| Error Type | Description | Common Causes |
|------------|-------------|---------------|
| `INVALID_FORMAT` | License key format is incorrect | Wrong prefix, malformed base64 |
| `INVALID_SIGNATURE` | Signature verification failed | Wrong secret key, tampered license |
| `EXPIRED` | License has expired | Current time past expiration |
| `INVALID_DATA` | License data is corrupted | Corrupted payload, invalid timestamps |
| `BASE64_ERROR` | Base64 decoding failed | Malformed encoding |
| `TIME_ERROR` | Time parsing failed | Invalid timestamp format |

```javascript
const { LicenseError, LicenseErrorType } = require('alvan-lic');

try {
  validator.validateKey(licenseKey);
} catch (error) {
  if (error instanceof LicenseError) {
    switch (error.type) {
      case LicenseErrorType.EXPIRED:
        // Handle expired license
        break;
      case LicenseErrorType.INVALID_SIGNATURE:
        // Handle security violation
        break;
      // ... handle other error types
    }
  }
}
```

## 📚 API Reference

### LicenseGenerator

#### `new LicenseGenerator(secretKey: string)`
Creates a new license generator.

#### `generateKey(hours: number): string`
Generates a license key valid for the specified number of hours.

#### `generateKeyWithTimestamp(hours: number, issuedAt: Date): string`
Generates a license key with a custom issued timestamp (useful for testing).

### LicenseValidator

#### `new LicenseValidator(secretKey: string)`
Creates a new license validator.

#### `validateKey(licenseKey: string): LicenseInfo`
Validates a license key and returns license information. Throws `LicenseError` if invalid.

#### `validateKeyAtTime(licenseKey: string, currentTime: Date): LicenseInfo`
Validates a license key at a specific time (useful for testing).

### LicenseInfo Interface

```typescript
interface LicenseInfo {
  isValid: boolean;       // Whether the license is currently valid
  issuedAt: Date;         // When the license was issued
  expiresAt: Date;        // When the license expires  
  hoursRemaining: number; // Hours remaining until expiration
}
```

### Utility Functions

- `createQuickLicense(secretKey)` - Create quick license generator
- `validateLicenseWithDetails(licenseKey, secretKey)` - Enhanced validation
- `hasValidLicenseFormat(licenseKey)` - Format check without validation
- `formatDuration(hours)` - Convert hours to human-readable string

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run tests in watch mode:

```bash
npm run test:watch
```

## 🔨 Building from Source

```bash
# Clone the repository
git clone https://github.com/WebChatAppAi/alvan-lic-node.git
cd alvan-lic-node

# Install dependencies
npm install

# Build the package
npm run build

# Run examples
npm run example:basic
```

## 📦 Package Contents

```
alvan-lic/
├── dist/                  # Compiled JavaScript and TypeScript definitions
│   ├── index.js          # CommonJS build
│   ├── index.mjs         # ES Module build  
│   └── index.d.ts        # TypeScript definitions
├── bin/                   # CLI executable
│   └── alvan-cli.js      # Interactive CLI tool
├── examples/              # Usage examples
│   └── basic-usage.js    # Basic usage demonstration
└── README.md             # This file
```

## 🤝 Compatibility

- **Node.js**: 14.0.0 or higher
- **TypeScript**: Full type definitions included
- **Module Systems**: Both CommonJS (`require`) and ES Modules (`import`)
- **Browsers**: Not recommended (secret keys should stay server-side)
- **Electron**: Main process only (not renderer for security)

## 🔄 Migration from Rust Version

This Node.js package is functionally identical to the Rust `alvan-lic` crate:

| Rust | Node.js |
|------|---------|
| `LicenseGenerator::new()` | `new LicenseGenerator()` |
| `generator.generate_key()` | `generator.generateKey()` |
| `LicenseValidator::new()` | `new LicenseValidator()` |
| `validator.validate_key()` | `validator.validateKey()` |
| `LicenseError::Expired` | `LicenseError` with `type: 'EXPIRED'` |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and enhancement requests.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure tests pass: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`  
7. Submit a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original Rust implementation inspiration
- Node.js crypto module for HMAC-SHA256
- The open source community

---

<div align="center">

**[⭐ Star this repo](https://github.com/WebChatAppAi/alvan-lic-node) • [📦 View on NPM](https://www.npmjs.com/package/alvan-lic) • [🐛 Report Issues](https://github.com/WebChatAppAi/alvan-lic-node/issues)**

Made with ❤️ by [WebChatAppAi](https://github.com/WebChatAppAi)

</div>