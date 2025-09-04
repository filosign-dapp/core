# Filosign

Secure, fast, and easy-to-use document signing on filecoin.

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. For client app:
   ```bash
   cd packages/client && cp .env.template .env
   ```

## Available Scripts

- `bun run build` - Build all packages
- `bun run dev` - Start development mode for all packages
- `bun run test` - Run tests for all packages
- `bun run lint` - Run linting for all packages
- `bun run clean` - Clean build artifacts and node_modules

## Adding New Packages

1. Create a new directory in `packages/`
3. Add your package configuration, and name modules as @filosign/<module_name>
4. Run `bun install`

## Workspace Structure

```
filosign/
├── packages/client   # Client application
├── package.json      # Root package configuration
├── bunfig.toml       # Bun configuration
└── README.md         # This file
```