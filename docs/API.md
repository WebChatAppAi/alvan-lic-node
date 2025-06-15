# alvan-lic API Reference

## Core Classes

### LicenseGenerator

Creates time-based license keys with HMAC-SHA256 signatures.

```javascript
const { LicenseGenerator } = require('alvan-lic');
const generator = new LicenseGenerator('your-secret-key');
```

#### Methods

**`generateKey(hours: number): string`**
```javascript
const license = generator.generateKey(24); // 24-hour license
// Returns: "alvan-MTcwNDQ2NzI4MjoxNzA0NTUzNjgy..."
```

**`generateKeyWithTimestamp(hours: number, issuedAt: Date): string`**
```javascript
const customTime = new Date('2024-01-01T12:00:00Z');
const license = generator.generateKeyWithTimestamp(48, customTime);
```

### LicenseValidator

Validates license keys offline using the same secret key.

```javascript
const { LicenseValidator } = require('alvan-lic');
const validator = new LicenseValidator('your-secret-key');
```

#### Methods

**`validateKey(licenseKey: string): LicenseInfo`**
```javascript
try {
  const info = validator.validateKey(license);
  console.log(`Valid for ${info.hoursRemaining} hours`);
} catch (error) {
  console.log(`Invalid: ${error.message}`);
}
```

**`validateKeyAtTime(licenseKey: string, currentTime: Date): LicenseInfo`**
```javascript
const specificTime = new Date('2024-06-01T12:00:00Z');
const info = validator.validateKeyAtTime(license, specificTime);
```

## Types

### LicenseInfo
```typescript
interface LicenseInfo {
  isValid: boolean;        // Always true (throws on invalid)
  issuedAt: Date;         // When license was created
  expiresAt: Date;        // When license expires
  hoursRemaining: number; // Hours until expiration
}
```

### LicenseError
```typescript
enum LicenseErrorType {
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE', 
  EXPIRED = 'EXPIRED',
  INVALID_DATA = 'INVALID_DATA',
  BASE64_ERROR = 'BASE64_ERROR',
  TIME_ERROR = 'TIME_ERROR'
}
```

## Electron Integration

### Main Process (Node.js)
```javascript
// main.js
const { LicenseValidator } = require('alvan-lic');
const { ipcMain } = require('electron');

const validator = new LicenseValidator(process.env.LICENSE_SECRET);

ipcMain.handle('validate-license', async (event, licenseKey) => {
  try {
    const info = validator.validateKey(licenseKey);
    return { valid: true, info };
  } catch (error) {
    return { valid: false, error: error.message, type: error.type };
  }
});

ipcMain.handle('generate-trial', async () => {
  const generator = new LicenseGenerator(process.env.LICENSE_SECRET);
  const trialLicense = generator.generateKey(24); // 24-hour trial
  return trialLicense;
});
```

### Renderer Process
```javascript
// renderer.js
const { ipcRenderer } = require('electron');

async function checkLicense(licenseKey) {
  const result = await ipcRenderer.invoke('validate-license', licenseKey);
  
  if (result.valid) {
    console.log('✅ License valid until:', result.info.expiresAt);
    enableFeatures();
  } else {
    console.log('❌ License invalid:', result.error);
    showLicenseDialog();
  }
}

async function startTrial() {
  const trialKey = await ipcRenderer.invoke('generate-trial');
  localStorage.setItem('trial-license', trialKey);
  checkLicense(trialKey);
}
```

## Quick Examples

### Basic Usage
```javascript
const { LicenseGenerator, LicenseValidator } = require('alvan-lic');

const secret = 'my-app-secret-key';
const generator = new LicenseGenerator(secret);
const validator = new LicenseValidator(secret);

// Generate
const license = generator.generateKey(168); // 1 week

// Validate
const info = validator.validateKey(license);
console.log(`${info.hoursRemaining} hours remaining`);
```

### Error Handling
```javascript
const { LicenseError, LicenseErrorType } = require('alvan-lic');

try {
  validator.validateKey(userLicense);
} catch (error) {
  if (error instanceof LicenseError) {
    switch (error.type) {
      case LicenseErrorType.EXPIRED:
        showRenewalDialog();
        break;
      case LicenseErrorType.INVALID_SIGNATURE:
        showInvalidLicenseError();
        break;
      default:
        showGenericError(error.message);
    }
  }
}
```

### CLI Usage
```bash
# Generate license
npx alvan-cli generate --hours 720 --secret "prod-secret"

# Validate license  
npx alvan-cli validate --key "alvan-..." --secret "prod-secret"

# Interactive mode
npx alvan-cli
```

## Common Patterns

### License Duration Constants
```javascript
const { LICENSE_DURATIONS } = require('alvan-lic');

generator.generateKey(LICENSE_DURATIONS.ONE_DAY);    // 24 hours
generator.generateKey(LICENSE_DURATIONS.ONE_WEEK);   // 168 hours  
generator.generateKey(LICENSE_DURATIONS.ONE_MONTH);  // 720 hours
generator.generateKey(LICENSE_DURATIONS.ONE_YEAR);   // 8760 hours
```

### Environment-based Secrets
```javascript
const secret = process.env.NODE_ENV === 'production' 
  ? process.env.LICENSE_SECRET_PROD
  : process.env.LICENSE_SECRET_DEV;

const generator = new LicenseGenerator(secret);
```

### Validation with Grace Period
```javascript
function validateWithGrace(license, graceDays = 7) {
  try {
    return validator.validateKey(license);
  } catch (error) {
    if (error.type === 'EXPIRED') {
      // Check if within grace period
      const gracePeriod = graceDays * 24 * 60 * 60 * 1000;
      const expiredTime = new Date(Date.now() - gracePeriod);
      
      try {
        return validator.validateKeyAtTime(license, expiredTime);
      } catch {
        throw error; // Still expired even with grace
      }
    }
    throw error;
  }
}
```