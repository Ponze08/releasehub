window.RELEASEHUB_SEED = {
  releases: [
    {
      id: "rel-1001",
      application: "Customer Portal",
      version: "2.8.0",
      environment: "Production",
      owner: "Andrea Ponzellini",
      risk: "Medium",
      status: "Ready",
      plannedDate: "2026-08-19T09:30",
      summary: "Accessibility improvements, account settings redesign and API validation fixes.",
      createdAt: "2026-08-12T08:40:00",
      updatedAt: "2026-08-18T08:15:00"
    },
    {
      id: "rel-1002",
      application: "Orders API",
      version: "4.12.1",
      environment: "Production",
      owner: "M. Keller",
      risk: "High",
      status: "In Progress",
      plannedDate: "2026-08-18T11:15",
      summary: "Database index changes and queue retry logic for peak-order processing.",
      createdAt: "2026-08-10T13:20:00",
      updatedAt: "2026-08-18T09:28:00"
    },
    {
      id: "rel-1003",
      application: "Inventory Sync",
      version: "1.9.4",
      environment: "Staging",
      owner: "S. Romano",
      risk: "Low",
      status: "Completed",
      plannedDate: "2026-08-17T14:00",
      summary: "Incremental synchronization and improved import diagnostics.",
      createdAt: "2026-08-09T10:05:00",
      updatedAt: "2026-08-17T14:36:00"
    },
    {
      id: "rel-1004",
      application: "Identity Service",
      version: "3.4.2",
      environment: "QA",
      owner: "L. Bernasconi",
      risk: "Medium",
      status: "Planned",
      plannedDate: "2026-08-20T10:00",
      summary: "Session hardening and updated role-mapping validation.",
      createdAt: "2026-08-15T09:12:00",
      updatedAt: "2026-08-15T09:12:00"
    },
    {
      id: "rel-1005",
      application: "Reporting Hub",
      version: "5.1.0",
      environment: "Production",
      owner: "A. Meier",
      risk: "High",
      status: "Failed",
      plannedDate: "2026-08-16T07:30",
      summary: "New reporting export pipeline and scheduled aggregation jobs.",
      createdAt: "2026-08-05T15:44:00",
      updatedAt: "2026-08-16T08:22:00"
    },
    {
      id: "rel-1006",
      application: "Device Console",
      version: "2.2.7",
      environment: "Development",
      owner: "Andrea Ponzellini",
      risk: "Low",
      status: "Completed",
      plannedDate: "2026-08-15T13:00",
      summary: "Responsive table layout, status indicators and validation improvements.",
      createdAt: "2026-08-11T11:30:00",
      updatedAt: "2026-08-15T13:42:00"
    },
    {
      id: "rel-1007",
      application: "Partner Gateway",
      version: "1.6.0",
      environment: "Staging",
      owner: "N. Frei",
      risk: "Medium",
      status: "Ready",
      plannedDate: "2026-08-21T15:30",
      summary: "Partner onboarding workflow and webhook delivery observability.",
      createdAt: "2026-08-14T08:18:00",
      updatedAt: "2026-08-18T07:35:00"
    },
    {
      id: "rel-1008",
      application: "Billing Worker",
      version: "6.0.3",
      environment: "Production",
      owner: "D. Costa",
      risk: "Low",
      status: "Completed",
      plannedDate: "2026-08-14T06:45",
      summary: "Retry backoff tuning and improved billing reconciliation logs.",
      createdAt: "2026-08-06T16:12:00",
      updatedAt: "2026-08-14T07:24:00"
    },
    {
      id: "rel-1009",
      application: "Search Service",
      version: "3.7.5",
      environment: "QA",
      owner: "E. Rossi",
      risk: "Medium",
      status: "Completed",
      plannedDate: "2026-08-13T11:00",
      summary: "Query ranking tuning and new diagnostics for zero-result searches.",
      createdAt: "2026-08-07T12:50:00",
      updatedAt: "2026-08-13T11:46:00"
    }
  ],
  activity: [
    {
      id: "act-2001",
      releaseId: "rel-1002",
      type: "Status",
      title: "Orders API moved to In Progress",
      detail: "Deployment window opened for v4.12.1 in Production.",
      actor: "M. Keller",
      at: "2026-08-18T09:28:00"
    },
    {
      id: "act-2002",
      releaseId: "rel-1001",
      type: "Updated",
      title: "Customer Portal release updated",
      detail: "Risk assessment confirmed and production checklist completed.",
      actor: "Andrea Ponzellini",
      at: "2026-08-18T08:15:00"
    },
    {
      id: "act-2003",
      releaseId: "rel-1007",
      type: "Status",
      title: "Partner Gateway marked Ready",
      detail: "Staging validation passed for v1.6.0.",
      actor: "N. Frei",
      at: "2026-08-18T07:35:00"
    },
    {
      id: "act-2004",
      releaseId: "rel-1003",
      type: "Status",
      title: "Inventory Sync completed",
      detail: "v1.9.4 deployed successfully to Staging.",
      actor: "S. Romano",
      at: "2026-08-17T14:36:00"
    },
    {
      id: "act-2005",
      releaseId: "rel-1005",
      type: "Status",
      title: "Reporting Hub marked Failed",
      detail: "Release was stopped after an aggregation validation error.",
      actor: "A. Meier",
      at: "2026-08-16T08:22:00"
    },
    {
      id: "act-2006",
      releaseId: "rel-1006",
      type: "Status",
      title: "Device Console completed",
      detail: "Development deployment completed successfully.",
      actor: "Andrea Ponzellini",
      at: "2026-08-15T13:42:00"
    }
  ]
};
