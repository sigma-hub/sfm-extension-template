# Binary Deno Template

Use this starter when your extension ships a managed binary and invokes a bundled script through `sigma.binary` and `sigma.shell`.

## Includes

- `binaries` manifest configuration
- `sigma.binary.getPath()`
- `sigma.shell.run()`
- `sigma.ui.createModal()`

## Usage

1. Copy this folder into a new repository.
2. Rename the extension metadata in `package.json`.
3. Run `npm install`.
4. Run `npm run build`.
