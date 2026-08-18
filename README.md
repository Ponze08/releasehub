# ReleaseHub

**Enterprise release & change management dashboard — portfolio project by Andrea Ponzellini.**

ReleaseHub is a polished demo application for planning, tracking and auditing software releases across environments. It is designed to look and behave like a real internal enterprise tool while remaining completely self-contained and safe to publish publicly.

## Highlights

- Dashboard with release KPIs, deployment volume and release health
- Search and multi-dimensional filtering
- Create, edit, delete and advance release status
- Risk, environment and status classification
- Persistent demo state using browser `localStorage`
- Chronological audit trail
- CSV release export and JSON activity export
- Responsive layout and dark mode
- Keyboard shortcut: `/` or `Ctrl/Cmd + K` focuses search
- No frontend framework or runtime dependency required
- Companion .NET 8 minimal API source
- SQL Server reference schema with constraints and indexes

## Tech stack

### Runnable demo
- HTML5
- CSS3
- JavaScript (ES2021+)
- Browser localStorage

### Backend reference implementation
- C#
- ASP.NET Core 8 minimal API
- Dependency injection
- Repository abstraction

### Database design
- Microsoft SQL Server
- Relational constraints
- Indexing
- Audit/activity model

## Run the demo

The easiest option is simply to open `index.html` in a modern browser.

For a local HTTP server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

On Windows you can also run `start-demo.bat`.

## Run the API

Requires the .NET 8 SDK:

```bash
cd backend/ReleaseHub.Api
dotnet run
```

The API uses an in-memory repository by default, so no database is required to explore the C# code or endpoints.

## Project structure

```text
releasehub/
├─ index.html
├─ assets/
│  ├─ css/styles.css
│  └─ js/
│     ├─ data.js
│     └─ app.js
├─ backend/ReleaseHub.Api/
├─ database/schema.sql
├─ docs/ARCHITECTURE.md
├─ start-demo.bat
└─ README.md
```

## Why this project exists

The goal is to demonstrate practical software-development skills through a compact project that combines UI engineering, state management, CRUD workflows, auditability, API design and relational database modeling.

The data and company/application names in the demo are fictional.

## Portfolio note

If you publish this repository, consider enabling GitHub Pages for the root folder or deploying it to Netlify so the LinkedIn Featured card can point directly to a live demo.
