# ReleaseHub architecture

ReleaseHub is intentionally split into three layers so the portfolio demo is easy to open while still showing how the application can evolve into a conventional enterprise stack.

## 1. Browser demo

The root `index.html` contains the runnable showcase. It uses plain HTML, CSS and JavaScript with no build step or third-party runtime dependencies.

- State is persisted in `localStorage`.
- Seed data is defined in `assets/js/data.js`.
- UI state, filtering, CRUD operations, exports and audit logging live in `assets/js/app.js`.
- The interface is responsive and supports light/dark themes.

This mode is ideal for GitHub Pages, Netlify or any static host.

## 2. ASP.NET Core API

`backend/ReleaseHub.Api` is a small .NET 8 minimal API that exposes CRUD endpoints for releases.

The service layer is deliberately abstracted behind `IReleaseService`. The included implementation is in-memory, keeping the repository self-contained and package-free. In a production implementation, the same interface can be backed by EF Core, Dapper or a custom SQL Server repository.

Endpoints:

- `GET /api/releases`
- `GET /api/releases/{id}`
- `POST /api/releases`
- `PUT /api/releases/{id}`
- `DELETE /api/releases/{id}`

## 3. SQL Server model

`database/schema.sql` contains a production-oriented SQL Server schema with:

- strongly constrained status, risk and environment values;
- deployment-focused indexes;
- a separate append-style activity table for auditability;
- foreign-key behavior that preserves audit records after a release is deleted.

## Production evolution

A realistic next step would be:

1. add authentication/authorization;
2. replace the in-memory repository with SQL Server persistence;
3. add optimistic concurrency and server-side audit logging;
4. connect the browser UI to the API;
5. add automated tests and CI/CD;
6. deploy the frontend and API separately behind HTTPS.

The current implementation is kept intentionally compact so recruiters can understand the full project quickly.
