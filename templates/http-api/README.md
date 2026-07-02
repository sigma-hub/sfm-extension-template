# HTTP API Template

Use this starter when your extension needs to call HTTP services from the Sigma File Manager worker runtime.

## Includes

- `sigma.http.request()` with host allowlists for public APIs and localhost
- Form modal demo against httpbin.org
- List-detail modal demo that loads JSON from jsonplaceholder.typicode.com
- Localhost request demo for services such as Everything HTTP Server

## Requirements

- Sigma File Manager with extension HTTP support
- `@sigma-file-manager/api` `>=1.10.0` (bundled in `vendor/` until the package is published to npm)

When `@sigma-file-manager/api@1.10.0` is available on npm, replace the vendored dependency in `package.json` with `"^1.10.0"` and remove the `vendor/` folder.

## Usage

1. Copy this folder into a new repository.
2. Rename the extension metadata in `package.json`.
3. Update the `http` host allowlist for the services your extension needs.
4. Run `npm install`.
5. Run `npm run build`.
6. Install the extension from the built folder in Sigma File Manager.

## Commands

- **Demo HTTP form modal** - GET `https://httpbin.org/get` and show status, headers, and body.
- **Demo HTTP list-detail modal** - GET demo posts and browse/search/filter them in a list-detail layout.
- **Demo HTTP localhost request** - GET `http://127.0.0.1:8080/` to verify local service access.
