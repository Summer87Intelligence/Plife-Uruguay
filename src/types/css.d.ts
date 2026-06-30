// Ambient declaration so TypeScript accepts global CSS side-effect imports
// (e.g. `import './globals.css'`). Next.js handles these via its bundler, but
// `tsc --noEmit` needs an explicit module declaration.
declare module '*.css';
