# ReleaseHub

[![CI](https://github.com/Ponze08/releasehub/actions/workflows/ci.yml/badge.svg)](https://github.com/Ponze08/releasehub/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Release & change management dashboard built with JavaScript, ASP.NET Core 8, EF Core and SQL Server.**

ReleaseHub is a portfolio project for planning, tracking and auditing software releases across multiple applications and environments. The browser interface can run as a self-contained demo, while the backend provides a real ASP.NET Core API with persistent storage support.

## Highlights

- Release dashboard with KPIs, deployment volume and release health
- Search and multi-dimensional filtering
- Create, edit, delete and advance release status
- Risk, environment and status classification
- Chronological audit trail
- CSV release export and JSON activity export
- Responsive layout, dark mode and keyboard shortcuts
- ASP.NET Core 8 Minimal API
- EF Core persistence with SQL Server support
- In-memory database fallback for zero-configuration development
- Swagger/OpenAPI in Development
- Configurable CORS policy and Problem Details error handling
- Database-aware health endpoint
- Automated API service tests
- GitHub Actions build/test pipeline and Pages deployment workflow

## Architecture

```text
Browser UI
  HTML / CSS / JavaScript
          │
          │ optional REST integration
          ▼
ASP.NET Core 8 API
          │
          ▼
      EF Core
      ┌───┴────────────┐
      │                │
SQL Server       InMemory provider
production       local/demo fallback
```

The static UI keeps a `localStorage` fallback so the public demo remains usable even when the API is not deployed. When an API base URL is configured, release CRUD and audit data are synchronized through the ASP.NET Core backend.

## Project structure

```text
releasehub/
├─ index.html
├─ assets/
│  ├─ css/styles.css
│  └─ js/
│     ├─ app.js
│     ├─ config.js
│     └─ data.js
├─ backend/
│  ├─ ReleaseHub.Api/
│  │  ├─ Data/
│  │  ├─ Models/
│  │  └─ Services/
│  └─ ReleaseHub.Api.Tests/
├─ database/schema.sql
├─ docs/ARCHITECTURE.md
└─ .github/workflows/
   ├─ ci.yml
   └─ pages.yml
```

## Run the frontend

The quickest option is to open `index.html` directly in a modern browser.

For a local HTTP server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

On Windows you can also run:

```text
start-demo.bat
```

## Run the API

Requires the .NET 8 SDK.

```bash
cd backend/ReleaseHub.Api
dotnet run
```

With no SQL Server connection string configured, the API automatically uses EF Core's in-memory provider.

Swagger UI is available in the Development environment at:

```text
/swagger
```

The health endpoint is:

```text
/health
```

The health response also reports the active EF Core provider and returns a service-unavailable response if the configured database cannot be reached.

## SQL Server configuration

Set the `ConnectionStrings__ReleaseHub` environment variable or configure `ConnectionStrings:ReleaseHub` in your local application settings.

Example format:

```text
Server=localhost;Database=ReleaseHub;Trusted_Connection=True;TrustServerCertificate=True;
```

`database/schema.sql` documents the corresponding relational model, constraints and indexes.

## Connect the frontend to the API

The frontend reads `window.RELEASEHUB_CONFIG.apiBaseUrl`. Set it to the API origin before `app.js` is loaded, for example:

```javascript
window.RELEASEHUB_CONFIG = {
  apiBaseUrl: "https://api.example.com"
};
```

If the API cannot be reached, the app safely falls back to the local demo workspace.

## Run tests

```bash
cd backend/ReleaseHub.Api.Tests
dotnet test
```

The test suite verifies release creation, status-change auditing and delete behavior. GitHub Actions runs build and tests for feature branches, pull requests and `main`.

## Security and resilience details

- Browser-rendered user content is HTML-escaped before insertion.
- CSV exports neutralize spreadsheet formula prefixes to reduce CSV injection risk.
- API input is validated for required fields, maximum lengths and known enum-like values.
- CORS is restricted to configured origins outside Development.
- Unhandled API exceptions use ASP.NET Core Problem Details responses.
- SQL Server connections use transient-failure retry support.
- Demo seed dates are generated relative to the current date so the dashboard remains current.

## Data

All names, applications and release records used in the demo are fictional sample data created for this project. No company source code or internal production data is included.

## License

MIT
