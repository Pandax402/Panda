# Contributing to Pandax402

Thank you for your interest in contributing to Pandax402. This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

Before submitting a bug report:

1. Check the existing issues to avoid duplicates
2. Collect relevant information:
   - Version of Pandax402
   - Node.js version
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior

Submit bug reports via GitHub Issues with the `bug` label.

### Suggesting Features

Feature requests are welcome. Please:

1. Check existing issues and discussions
2. Clearly describe the use case
3. Explain how it aligns with Pandax402's core philosophy

Submit feature requests via GitHub Issues with the `enhancement` label.

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Write or update tests as needed
5. Ensure all tests pass
6. Submit a pull request

#### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

#### Commit Messages

Use clear, descriptive commit messages:

```
type: short description

Longer description if needed.

Refs: #issue-number
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/pandax402.git
cd pandax402

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Run linter
npm run lint
```

### Testing

All new features and bug fixes should include tests.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Style

- Use TypeScript
- Follow existing code patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and small

### Documentation

- Update README.md if adding features
- Add JSDoc comments for new public APIs
- Update API documentation in `docs/`
- Include code examples where helpful

## Review Process

1. All PRs require at least one review
2. CI checks must pass
3. Documentation must be updated
4. Breaking changes require discussion

## Questions?

Open a discussion on GitHub for questions about contributing.

---

Thank you for helping make Pandax402 better.
