# ReleaseHub architecture

ReleaseHub is split into a browser client, an ASP.NET Core API and a persistence layer. The static client keeps a local fallback so the portfolio demo remains usable without infrastructure, while the backend demonstrates a conventional .NET application path to SQL Server.

## 1. Browser client

The root `index.html` uses plain HTML, CSS and JavaScript with no frontend build step.

- `assets/js/data.js` generates fictional seed data relative to the current date.
- `assets/js/app.js` owns UI state, filtering, CRUD workflows, exports and audit rendering.
- The UI can synchronize release data with the ASP.NET Core API when an API base URL is configured.
- If the API is unavailable, the browser falls back to `localStorage` so the demo stays functional.
- User-controlled values are escaped before HTML insertion.
- CSV export neutralizes spreadsheet formula prefixes.

## 2. ASP.NET Core API

`backend/ReleaseHub.Api` targets .NET 8 and exposes release CRUD plus audit activity.

Endpoints:

- `GET /health`
- `GET /api/releases`
- `GET /api/releases/{id}`
- `POST /api/releases`
- `PUT /api/releases/{id}`
- `DELETE /api/releases/{id}`
- `GET /api/activity`

The API uses dependency injection and an asynchronous `IReleaseService` abstraction. `ReleaseService` contains the application workflow and writes both release changes and audit records through EF Core.

Swagger/OpenAPI is enabled in the Development environment.

## 3. Persistence

`ReleaseHubDbContext` maps releases and audit activity with EF Core.

- If `ConnectionStrings:ReleaseHub` is configured, the API uses the SQL Server provider.
- If no connection string is configured, it uses the EF Core InMemory provider for zero-configuration development.
- `database/schema.sql` documents the corresponding SQL Server schema, constraints and indexes.

This keeps the repository easy to run while still providing a real persistence path.

## 4. Automated verification

`backend/ReleaseHub.Api.Tests` verifies core persistence behavior including creation, status-change auditing and deletion.

`.github/workflows/ci.yml` restores, builds and tests the .NET projects on feature branches and pull requests.

## Production evolution

The next production-oriented steps would be:

1. add authentication and role-based authorization;
2. add EF Core migrations and deployment-time migration handling;
3. add optimistic concurrency for release updates;
4. deploy the frontend and API behind HTTPS;
5. add structured logging and telemetry;
6. add end-to-end browser tests;
7. add environment-specific secret management.
