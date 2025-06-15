# alvan-lic Node.js Project Structure

This document outlines the complete project structure for the `alvan-lic` Node.js package, which provides identical functionality to the Rust version.

## 📁 Project Directory Structure

```
alvan-lic/
├── 📄 package.json                 # NPM package configuration
├── 📄 tsconfig.json               # TypeScript configuration
├── 📄 README.md                   # Main documentation
├── 📄 LICENSE                     # MIT license file
├── 📄 .gitignore                  # Git ignore rules
├── 📄 .npmignore                  # NPM ignore rules
├── 📁 src/                        # Source code (TypeScript)
│   ├── 📄 index.ts                # Main entry point & exports
│   ├── 📄 generator.ts            # License key generation
│   ├── 📄 validator.ts            # License key validation  
│   ├── 📄 error.ts                # Error handling & types
│   ├── 📄 constants.ts            # Package constants
│   └── 📄 utils.ts                # Utility functions
├── 📁 bin/                        # CLI executables
│   └── 📄 alvan-cli.js            # Interactive CLI tool
├── 📁 dist/                       # Compiled output (generated)
│   ├── 📄 index.js                # CommonJS build
│   ├── 📄 index.mjs               # ES Module build
│   ├── 📄 index.d.ts              # TypeScript definitions
│   └── 📄 *.map                   # Source maps
├── 📁 examples/                   # Usage examples
│   ├── 📄 basic-usage.js          # Basic Node.js example
│   └── 📄 react-example.jsx       # React integration
├── 📁 tests/                      # Test suite
│   └── 📄 integration.test.ts     # Integration tests
└── 📁 docs/                       # Additional documentation
    ├── 📄 API.md                  # API reference
    ├── 📄 SECURITY.md             # Security guidelines
    └── 📄 MIGRATION.md            # Migration from Rust
```

## 🏗️ Build Process

### Development Setup

```bash
# Clone the repository
git clone https://github.com/WebChatAppAi/alvan-lic-node.git
cd alvan-lic-node

# Install dependencies
npm install

# Start development with watch mode
npm run build:watch
```

### Build Commands

```bash
# Full build (all formats)
npm run build

# Build individual formats
npm run build:cjs      # CommonJS (dist/*.js)
npm run build:esm      # ES Modules (dist/*.mjs) 
npm run build:types    # TypeScript definitions (dist/*.d.ts)

# Clean build artifacts
npm run clean
```

### Testing & Quality

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode  
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

## 📦 Package Exports

The package supports multiple module systems through conditional exports:

### package.json exports field:
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js", 
      "types": "./dist/index.d.ts"
    }
  }
}
```

### Usage Examples:

```javascript
// CommonJS
const { LicenseGenerator } = require('alvan-lic');

// ES Modules  
import { LicenseGenerator } from 'alvan-lic';

// TypeScript
import { LicenseGenerator, LicenseInfo } from 'alvan-lic';
```

## 🔧 Key Components

### Core Classes

| File | Class | Purpose |
|------|-------|---------|
| `generator.ts` | `LicenseGenerator` | Creates signed license keys |
| `validator.ts` | `LicenseValidator` | Validates license keys offline |
| `error.ts` | `LicenseError` | Error handling & types |

### Supporting Modules

| File | Exports | Purpose |
|------|---------|---------|
| `constants.ts` | Constants | License prefixes, durations, defaults |
| `utils.ts` | Utility functions | Convenience methods, formatters |
| `index.ts` | All exports | Main package entry point |

### CLI Tools

| File | Purpose |
|------|---------|
| `bin/alvan-cli.js` | Interactive command-line interface |

## 🔄 Build Pipeline

The build process transforms TypeScript source code into multiple JavaScript formats:

```
src/*.ts
    ↓ (TypeScript Compiler)
src/*.js (temporary)
    ↓ (Babel)
├── dist/*.js (CommonJS)
├── dist/*.mjs (ES Modules)
└── dist/*.d.ts (Type definitions)
```

### Build Configuration

**TypeScript (`tsconfig.json`):**
- Target: ES2020
- Module: CommonJS  
- Strict type checking enabled
- Declaration files generated

**Babel (`.babelrc`):**
- CommonJS build for Node.js compatibility
- ES Module build for modern bundlers
- Polyfills for Node.js 14+ support

## 🧪 Test Structure

```
tests/
└── integration.test.ts     # Comprehensive test suite
    ├── Full Workflow      # End-to-end license operations
    ├── License Format     # Format validation tests
    ├── Security           # Cryptographic security tests  
    ├── Expiration         # Time-based validation tests
    ├── Tampering          # Tamper detection tests
    ├── Error Handling     # Error scenario tests
    └── Edge Cases         # Boundary condition tests
```

### Test Coverage

Target coverage: **>95%** for all modules

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

## 📝 Documentation Structure

### Primary Documentation
- `README.md` - Main package documentation
- `API.md` - Detailed API reference
- `SECURITY.md` - Security best practices
- `MIGRATION.md` - Migration guide from Rust

### Code Documentation
- JSDoc comments in all source files
- TypeScript type annotations
- Inline code examples
- Usage patterns and best practices

## 🚀 Release Process

### Version Management

```bash
# Update version
npm version patch|minor|major

# Build for release
npm run build

# Publish to NPM
npm publish
```

### Pre-publish Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Version bumped appropriately
- [ ] Changelog updated
- [ ] Build artifacts generated
- [ ] Package files verified

### NPM Package Contents

Files included in the published package:

```
alvan-lic@1.0.0
├── dist/           # Compiled JavaScript & types
├── bin/            # CLI executables  
├── examples/       # Usage examples
├── README.md       # Documentation
├── LICENSE         # License file
└── package.json    # Package metadata
```

## 🔧 Development Workflow

### 1. Setup Development Environment

```bash
git clone <repository>
cd alvan-lic
npm install
```

### 2. Make Changes

- Edit source files in `src/`
- Add tests in `tests/`
- Update documentation as needed

### 3. Test Changes

```bash
npm test              # Run test suite
npm run lint          # Check code style
npm run build         # Verify build
```

### 4. Commit & Push

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature-branch
```

### 5. Create Pull Request

- Describe changes clearly
- Ensure all CI checks pass
- Request code review

## 🛠️ Tooling & Dependencies

### Production Dependencies
- `commander` - CLI argument parsing

### Development Dependencies
- `typescript` - TypeScript compiler
- `@babel/core` - JavaScript transpilation
- `jest` - Testing framework
- `@types/node` - Node.js type definitions

### Build Tools
- **Babel** - Multi-format JavaScript compilation
- **TypeScript** - Type checking and declaration generation
- **Jest** - Unit and integration testing

## 🔒 Security Considerations

### Source Code Security
- No hardcoded secrets or keys
- Cryptographic operations use Node.js built-in `crypto` module
- Input validation on all public methods
- Timing-safe comparisons for signature verification

### Package Security
- Minimal dependencies to reduce attack surface
- Regular dependency updates and security audits
- Secure build pipeline and publication process

## 📊 Performance Benchmarks

Target performance metrics:

| Operation | Target Time | Memory Usage |
|-----------|-------------|--------------|
| Generate License | <1ms | <1MB |
| Validate License | <1ms | <1MB |
| CLI Startup | <100ms | <10MB |

### Optimization Strategies
- Minimal object allocation in hot paths
- Reuse of crypto primitives where possible
- Efficient base64url encoding/decoding
- Lazy loading of non-critical modules

## 🤝 Contributing Guidelines

### Code Style
- TypeScript with strict type checking
- Consistent naming conventions
- Comprehensive JSDoc documentation
- 100% test coverage for new features

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Ensure all checks pass
5. Submit pull request with clear description

### Issue Reporting
- Use provided issue templates
- Include reproduction steps
- Provide environment details
- Search existing issues first

---

This project structure ensures maintainability, extensibility, and compatibility across different JavaScript environments while maintaining feature parity with the original Rust implementation.