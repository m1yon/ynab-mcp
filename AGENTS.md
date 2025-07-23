# AGENTS.md - MCP Server for YNAB API

## Build Commands
- `npm run build` - Compile TypeScript to JavaScript
- `npm run typecheck` - Run TypeScript type checking without emitting files
- `npm run lint` - Run Biome linter
- `npm start` - Build and run the server

## Code Style Guidelines
- **Formatting**: Use tabs for indentation (Biome), double quotes for strings
- **TypeScript**: Strict mode enabled, target ES2022, module resolution Node16
- **Imports**: Use ES module imports with .js extensions for local files
- **Types**: Prefer explicit types, use `type` for type aliases, `interface` for objects
- **Naming**: camelCase for variables/functions, PascalCase for types/interfaces
- **Error Handling**: Use try-catch blocks, log errors with console.error()
- **Async**: Use async/await over promises, handle rejections properly
- **Comments**: Use JSDoc style for functions and interfaces
- **No console.log**: Only console.error and console.warn allowed (ESLint rule)
- **Unused vars**: Prefix with underscore if intentionally unused
- **File structure**: Single index.ts file containing all server logic