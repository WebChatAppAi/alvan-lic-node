# Security Guidelines

## 🔐 Secret Key Management

### Production Requirements
- **Minimum 32 characters** for production use
- **Cryptographically random** - use `crypto.randomBytes(32).toString('hex')`
- **Environment variables** - never hardcode secrets
- **Different keys per environment** (dev/staging/prod)

```javascript
// ✅ Good
const secret = process.env.LICENSE_SECRET_KEY;
if (!secret || secret.length < 32) {
  throw new Error('LICENSE_SECRET_KEY must be at least 32 characters');
}

// ❌ Bad  
const secret = 'my-simple-key';
```

### Secret Generation
```bash
# Generate secure secret key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🛡️ Implementation Security

### Electron Applications
```javascript
// main.js - Keep secrets in main process only
const { LicenseValidator } = require('alvan-lic');

// ✅ Secure - secret stays in main process
const validator = new LicenseValidator(process.env.LICENSE_SECRET);

ipcMain.handle('validate-license', async (event, licenseKey) => {
  try {
    const info = validator.validateKey(licenseKey);
    return { valid: true, expiresAt: info.expiresAt };
  } catch {
    return { valid: false };
  }
});

// ❌ Never expose secret to renderer process
// ipcMain.handle('get-secret', () => process.env.LICENSE_SECRET);
```

### Web Applications
```javascript
// ✅ Server-side validation only
app.post('/validate-license', (req, res) => {
  try {
    const info = validator.validateKey(req.body.licenseKey);
    res.json({ valid: true, expiresAt: info.expiresAt });
  } catch (error) {
    res.json({ valid: false, reason: 'Invalid license' });
  }
});

// ❌ Never send validation logic to browser
// app.get('/license-secret', (req, res) => res.json({ secret }));
```

## ⚠️ Common Vulnerabilities

### Timing Attacks
**Protected**: Signature verification uses `timingSafeEqual()` to prevent timing attacks.

```javascript
// Built-in protection - no action needed
validator.validateKey(licenseKey); // Uses timing-safe comparison
```

### License Key Exposure
```javascript
// ✅ Safe logging
console.log('License validation result:', result.valid);

// ❌ Dangerous logging  
console.log('License key:', licenseKey); // Never log license keys
```

### Client-Side Validation
```javascript
// ✅ Server/main process validation
const isValid = await ipcRenderer.invoke('validate-license', key);

// ❌ Client-side validation (bypassable)
// const validator = new LicenseValidator(secret); // Don't do this
```

## 🔒 Best Practices

### Environment Configuration
```bash
# .env (never commit this file)
LICENSE_SECRET_PROD=a1b2c3d4e5f6...32+_characters_here
LICENSE_SECRET_DEV=dev_secret_for_testing_only
```

```javascript
// config.js
const config = {
  licenseSecret: process.env.NODE_ENV === 'production' 
    ? process.env.LICENSE_SECRET_PROD
    : process.env.LICENSE_SECRET_DEV
};

// Validate secret on startup
if (!config.licenseSecret || config.licenseSecret.length < 32) {
  console.error('❌ Invalid or missing LICENSE_SECRET');
  process.exit(1);
}
```

### Error Handling Security
```javascript
// ✅ Safe error responses
try {
  const info = validator.validateKey(licenseKey);
  return { valid: true, expiresAt: info.expiresAt };
} catch (error) {
  // Don't expose internal details
  return { valid: false, message: 'License validation failed' };
}

// ❌ Information disclosure
// catch (error) {
//   return { valid: false, error: error.message, stack: error.stack };
// }
```

### License Storage
```javascript
// ✅ Secure storage in Electron
const Store = require('electron-store');
const store = new Store({ encryptionKey: 'app-specific-key' });
store.set('license', licenseKey);

// ✅ Secure storage in Node.js  
const fs = require('fs');
const path = require('path');
const licenseFile = path.join(os.homedir(), '.myapp', 'license');
fs.writeFileSync(licenseFile, licenseKey, { mode: 0o600 }); // Owner read/write only
```

## 🚨 Security Checklist

### Development
- [ ] Secret keys stored in environment variables
- [ ] Minimum 32-character secrets in production
- [ ] Different secrets for each environment
- [ ] Secrets never logged or exposed in errors
- [ ] License validation only on server/main process

### Deployment  
- [ ] Environment variables properly configured
- [ ] Secret rotation plan in place
- [ ] License files have restricted permissions
- [ ] Error messages don't leak sensitive information
- [ ] Monitoring for unusual license validation patterns

### Code Review
- [ ] No hardcoded secrets in source code
- [ ] Client-side validation code removed
- [ ] Proper error handling implemented
- [ ] License keys not logged or transmitted unnecessarily
- [ ] Timing attack protections verified

## 🔄 Secret Rotation

### When to Rotate
- Suspected compromise
- Employee departures with access
- Regular schedule (quarterly/annually)
- Before major releases

### Rotation Process
1. Generate new secret key
2. Update environment variables
3. Deploy new validation service
4. Re-issue licenses with new secret
5. Phase out old secret gradually

```javascript
// Graceful rotation - support both keys temporarily
const oldValidator = new LicenseValidator(process.env.LICENSE_SECRET_OLD);
const newValidator = new LicenseValidator(process.env.LICENSE_SECRET_NEW);

function validateLicense(licenseKey) {
  try {
    return newValidator.validateKey(licenseKey);
  } catch {
    try {
      const info = oldValidator.validateKey(licenseKey);
      // Log for migration tracking
      console.log('Using old secret for license validation');
      return info;
    } catch {
      throw new Error('License validation failed');
    }
  }
}
```

## 📞 Incident Response

If you suspect a security breach:

1. **Immediate**: Rotate secret keys
2. **Assess**: Review logs for unauthorized access
3. **Notify**: Inform affected users if necessary
4. **Update**: Patch vulnerabilities and update documentation