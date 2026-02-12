# Contributing to Ascent CLI

Thank you for considering contributing to Ascent CLI. This document provides guidelines and conventions for contributing.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Install** dependencies: `npm install`
4. **Create a branch** from `master`: `git checkout -b feat/your-feature`

## Development Setup

```bash
# Clone
git clone https://github.com/glorian-labs/ascent-cli.git
cd ascent-cli

# Install
npm install

# Link CLI globally for local development
npm link

# Test the CLI
ascent --version
```

## Branch Naming

Use prefixed branch names:

- `feat/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation changes
- `refactor/` — Code refactoring
- `test/` — Test additions or fixes

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add MCP server tool definitions
fix: correct USDC balance parsing in x402 client
docs: update quickstart with Hono template
refactor: extract facilitator config to lib/config.js
test: add e2e test for payment flow
```

## Pull Requests

1. Keep PRs focused — one feature or fix per PR
2. Update documentation if behavior changes
3. Ensure `npm test` passes (when tests exist)
4. Add a clear description of what changed and why

## Code Style

- JavaScript (CommonJS) for CLI and lib modules
- TypeScript for SDK code (`lib/arc8004/`)
- Move for smart contracts (`move/sources/`)
- No semicolons, single quotes, 2-space indent (follow existing patterns)

## Project Structure

```
bin/cli.js              # CLI entry point
lib/                    # Core libraries
move/sources/arc8004/   # Move smart contracts
templates/              # Project scaffolding templates
examples/               # Demo applications
docs/                   # Documentation
```

## Security

If you discover a security vulnerability, **do not** open a public issue. Instead, report it privately by emailing the maintainer. Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Never commit:**
- Private keys or mnemonics
- `.env.local` files
- Database files (`.db`)
- API tokens or secrets

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
