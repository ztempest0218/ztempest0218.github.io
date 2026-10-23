# Frontend Dependencies

Bootstrap JavaScript and jQuery are pinned in `package.json` and `package-lock.json`.
The browser uses locally copied files, so GitHub Pages does not need npm to serve
the site. Bootstrap's bundle includes the pinned Popper dependency.

To update a dependency:

```sh
npm install --ignore-scripts --save-exact bootstrap@VERSION jquery@VERSION @popperjs/core@VERSION
npm run vendor
npm run check:vendor
npm audit
```

Commit the manifests, the updated files in `js/`, and `nakai.html` together.
The vendor script also refreshes the document's embedded copies so that it
continues to work as a standalone HTML file.
The unused MathJax 2 loader and IE8 polyfills have been removed; the exported
document contains no mathematical notation requiring MathJax.

The existing Bootstrap 3 theme CSS is retained for the original page layout.
It contains styling only; both pages use Bootstrap 5 JavaScript. The small
`css/bootstrap-compat.css` file adapts collapse, dropdown, and tab visibility.

Ideal Image Slider's object merge rejects prototype-related keys and safely
checks own properties. The homepage loads the patched, readable source; the stale
minified duplicate has been removed. `npm run check:security` checks malicious
option objects as well as generated security policies. Its unused upstream Grunt
development dependencies have been removed from the vendored package metadata. Do not commit
`node_modules/`; it is ignored and can be recreated with `npm ci --ignore-scripts`.

The dependency workflow checks npm advisories, browser library copies, and security
regressions. GitHub-managed CodeQL default setup is enabled with the extended query
suite for JavaScript/TypeScript and Actions. The obsolete repository-owned CodeQL
workflow is removed to avoid conflicting configurations.

## Browser Security Policy

`scripts/security-policy.mjs` generates the homepage's CSP/referrer meta tags and
the standalone document's script hashes. `npm run vendor` refreshes them after
library updates. Inline script changes to `nakai.html` also require regeneration;
CI rejects stale hashes. No `unsafe-inline` or `unsafe-eval` is allowed for scripts.
Inline styles remain allowed for the existing theme and R Markdown output.

The unused Google Maps loader and its embedded key have been removed. The site
does not require a Google Cloud login. Removal does not revoke any key stored in
Git history; its ownership and provider-side status have not been verified.

GitHub Pages does not support custom response headers. Meta CSP cannot enforce
`frame-ancestors`, and meta tags cannot substitute for `X-Frame-Options` or
`X-Content-Type-Options`. Those protections require a configurable hosting layer;
they are not claimed to be active here.

During pre-deployment checks on 2026-10-23, GitHub rejected the HTTPS-enforcement API setting with
`The certificate does not exist yet`, despite the HTTPS URL serving successfully.
Rebuilding the published branch and refreshing the unchanged Pages source did
not resolve the provider-side state. Do not disable/recreate Pages or change the
domain without approval; GitHub Support or a repair through Pages settings is
needed. Recheck the provider-side state after deployment; updating site files
does not by itself guarantee HTTPS enforcement.
