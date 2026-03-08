# sfm-extension-template

Sigma File Manager extension base template.

## Structure

- `index.js`: extension entrypoint loaded by Sigma File Manager
- `sigma-extension.d.ts`: local Sigma API type definitions for editor autocomplete

## Notes

- Update the metadata in `package.json` before publishing your extension.
- The template uses JSDoc in `index.js` so `activate(context)` and other exported entrypoints have proper types in plain JavaScript.
