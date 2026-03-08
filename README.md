# sfm-extension-template

Sigma File Manager extension base template.

## Structure

- `index.js`: extension entrypoint loaded by Sigma File Manager
- `package.json`: extension manifest plus the `@sigma-file-manager/api` dev dependency for editor types

## Notes

- Update the metadata in `package.json` before publishing your extension.
- Install dependencies with `npm install` to make the shared API types available locally.
- The template uses JSDoc in `index.js` so `activate(context)` and other exported entrypoints have proper types in plain JavaScript.
