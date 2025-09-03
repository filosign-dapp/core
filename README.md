# Filosign Monorepo

A monorepo managed with Bun runtime and package manager.

## Prerequisites

- [Bun](https://bun.sh/) installed (version 1.0.0 or higher)

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Install dependencies for all packages:
   ```bash
   bun run --cwd packages/* install
   ```

## Available Scripts

- `bun run build` - Build all packages
- `bun run dev` - Start development mode for all packages
- `bun run test` - Run tests for all packages
- `bun run lint` - Run linting for all packages
- `bun run clean` - Clean build artifacts and node_modules

## Adding New Packages

1. Create a new directory in `packages/`
2. Initialize with `bun init`
3. Add your package configuration
4. Run `bun install` from the root to link workspaces

## Workspace Structure

```
filosign/
├── packages/          # All workspace packages
├── package.json       # Root package configuration
├── bunfig.toml       # Bun configuration
└── README.md         # This file
```

## Package Development

Each package in the `packages/` directory can be developed independently while sharing the monorepo's dependency management and tooling.
