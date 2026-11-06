# ZOCS Lifestyle pre-orders

Lightweight static landing page with compiled Tailwind CSS, vanilla JavaScript, Google Apps Script and Google Sheets. Product galleries, multi-product selection, Bengali validation, warning dialogs and verified-success contact popup are included.

## Local configuration

The current workspace is already connected. Its private local configuration is in `.env`; do not commit it. The existing Apps Script link is kept in ignored `.clasp.json`, and Google login credentials stay in clasp's account store outside the repository. Google Sheets `SHEET_ID` remains in Apps Script Properties, never in the browser.

`.env.example` is the safe template for a fresh checkout. Restore configuration from a secure local copy or the deployment environment. Never put passwords, OAuth tokens, service-account keys or other secrets in `public/`.

| Variable | Purpose | Published to browser? |
| --- | --- | --- |
| PUBLIC_APPS_SCRIPT_URL | Real anonymous submission endpoint | Yes |
| GOOGLE_APPS_SCRIPT_ID | Existing owner-managed script identifier | No |
| GOOGLE_SPREADSHEET_ID | Order spreadsheet identifier | No |
| GOOGLE_DEPLOYMENT_ID | Existing deployment identifier | No |

The submission URL is public by design. Moving it to `.env` keeps instance configuration out of Git, but cannot hide it from visitors because the browser must send orders to it. It grants submission access, not permission to read the private order spreadsheet. Do not introduce a frontend API key: visitors could read it too.

## Build and preview

Node 22 or newer is required for build tooling; the hosted site has no Node backend.

- Install dependencies: `npm.cmd ci`
- Build: `npm.cmd run build`
- Preview: `npm.cmd run preview`, then visit http://127.0.0.1:8080
- Tests: `npm.cmd test`

Use `npm` instead of `npm.cmd` on other shells. Build reads `.env` or environment variables and generates `public/js/config.js` using an explicit public-field allowlist. Missing or invalid endpoint configuration fails the build instead of publishing a broken form. This generated file is ignored by Git and must be built after a fresh checkout. Do not upload `.env` to Hosting.

## Google backend

Backend source and manifest are in `google-apps-script/`. The current project, Sheet and web app already exist. Do not create duplicates. Owner-only live links and verification notes remain in ignored `google-deployment.json` and `INTEGRATION-VERIFICATION.md` locally.

Authenticate using `npx.cmd clasp login` when needed, then use the existing `.clasp.json`. Upload changes with `npx.cmd clasp push`; update the existing deployment rather than creating replacements. The manifest uses owner execution and anonymous access. Google can require owner runtime approval after permission changes.

`setup()` creates the order spreadsheet only when `SHEET_ID` is absent in Script Properties. New orders appear in its **Orders** tab. Columns are Timestamp, Customer Name, Phone Number, Delivery Address, Selected Products, Order Status. Both products are stored in one row with Pending status. Keep column A submission notes intact for duplicate protection. The spreadsheet must stay private.

## Submission reliability

The browser uses a URL-encoded POST and verifies the returned saved confirmation and UUID. Opaque responses are never treated as success. Failure preserves the form. The backend validates input, checks a honeypot, locks concurrent writes, and atomically saves the order plus its duplicate-tracking note. This basic protection suits modest preorder traffic; the public submission endpoint is not a strong anti-bot system.

## Firebase Hosting

Firebase publication is pending; the user selected a separate ZOCS project for future hosting. Do not overwrite the existing portfolio site.

After selecting a real project, use `node scripts/configure.cjs firebase REAL_PROJECT_ID`. Its `.firebaserc` remains local and ignored. Hosting serves only `public/`, and a predeploy hook builds the public configuration and CSS. Provide PUBLIC_APPS_SCRIPT_URL through `.env` or your deployment environment before running `firebase deploy --only hosting`. Local CLI alternative: `npm.cmd run deploy`.

## GitHub preparation

Commit source, compiled CSS, package lockfile, `.env.example`, Firebase configuration and backend source. The ignore rules exclude environment files, Google login/link files, owner reports, local test data, logs, backups, generated browser configuration and dependencies. Historical implementation scripts are archived in ignored `.local/archive/`.

Keep a secure backup of `.env`, `.clasp.json` and the local deployment record so the same resources can be reused on a new computer. Git ignore rules do not remove anything previously published; if credentials were already committed elsewhere, remove them from history and revoke the affected credentials.

The repository excludes local credentials and generated instance configuration. Run the build with your local environment settings after a fresh checkout.
