(() => {
  const now = new Date();
  const iso = ({ days = 0, hours = 0 } = {}) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(d.getHours() + hours);
    return d.toISOString().slice(0, 16);
  };
  const isoSeconds = ({ days = 0, hours = 0 } = {}) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(d.getHours() + hours);
    return d.toISOString();
  };

  window.RELEASEHUB_SEED = {
    generatedAt: now.toISOString(),
    releases: [
      { id: "rel-1001", application: "Customer Portal", version: "2.8.0", environment: "Production", owner: "Andrea Ponzellini", risk: "Medium", status: "Ready", plannedDate: iso({ days: 1 }), summary: "Accessibility improvements, account settings redesign and API validation fixes.", createdAt: isoSeconds({ days: -6 }), updatedAt: isoSeconds({ hours: -3 }) },
      { id: "rel-1002", application: "Orders API", version: "4.12.1", environment: "Production", owner: "M. Keller", risk: "High", status: "In Progress", plannedDate: iso({ hours: 4 }), summary: "Database index changes and queue retry logic for peak-order processing.", createdAt: isoSeconds({ days: -8 }), updatedAt: isoSeconds({ hours: -1 }) },
      { id: "rel-1003", application: "Inventory Sync", version: "1.9.4", environment: "Staging", owner: "S. Romano", risk: "Low", status: "Completed", plannedDate: iso({ days: -1 }), summary: "Incremental synchronization and improved import diagnostics.", createdAt: isoSeconds({ days: -9 }), updatedAt: isoSeconds({ days: -1 }) },
      { id: "rel-1004", application: "Identity Service", version: "3.4.2", environment: "QA", owner: "L. Bernasconi", risk: "Medium", status: "Planned", plannedDate: iso({ days: 2 }), summary: "Session hardening and updated role-mapping validation.", createdAt: isoSeconds({ days: -3 }), updatedAt: isoSeconds({ days: -3 }) },
      { id: "rel-1005", application: "Reporting Hub", version: "5.1.0", environment: "Production", owner: "A. Meier", risk: "High", status: "Failed", plannedDate: iso({ days: -2 }), summary: "New reporting export pipeline and scheduled aggregation jobs.", createdAt: isoSeconds({ days: -12 }), updatedAt: isoSeconds({ days: -2 }) },
      { id: "rel-1006", application: "Device Console", version: "2.2.7", environment: "Development", owner: "Andrea Ponzellini", risk: "Low", status: "Completed", plannedDate: iso({ days: -3 }), summary: "Responsive table layout, status indicators and validation improvements.", createdAt: isoSeconds({ days: -7 }), updatedAt: isoSeconds({ days: -3 }) },
      { id: "rel-1007", application: "Partner Gateway", version: "1.6.0", environment: "Staging", owner: "N. Frei", risk: "Medium", status: "Ready", plannedDate: iso({ days: 3 }), summary: "Partner onboarding workflow and webhook delivery observability.", createdAt: isoSeconds({ days: -4 }), updatedAt: isoSeconds({ hours: -5 }) },
      { id: "rel-1008", application: "Billing Worker", version: "6.0.3", environment: "Production", owner: "D. Costa", risk: "Low", status: "Completed", plannedDate: iso({ days: -4 }), summary: "Retry backoff tuning and improved billing reconciliation logs.", createdAt: isoSeconds({ days: -11 }), updatedAt: isoSeconds({ days: -4 }) },
      { id: "rel-1009", application: "Search Service", version: "3.7.5", environment: "QA", owner: "E. Rossi", risk: "Medium", status: "Completed", plannedDate: iso({ days: -5 }), summary: "Query ranking tuning and new diagnostics for zero-result searches.", createdAt: isoSeconds({ days: -13 }), updatedAt: isoSeconds({ days: -5 }) }
    ],
    activity: [
      { id: "act-2001", releaseId: "rel-1002", type: "Status", title: "Orders API moved to In Progress", detail: "Deployment window opened for v4.12.1 in Production.", actor: "M. Keller", at: isoSeconds({ hours: -1 }) },
      { id: "act-2002", releaseId: "rel-1001", type: "Updated", title: "Customer Portal release updated", detail: "Risk assessment confirmed and production checklist completed.", actor: "Andrea Ponzellini", at: isoSeconds({ hours: -3 }) },
      { id: "act-2003", releaseId: "rel-1007", type: "Status", title: "Partner Gateway marked Ready", detail: "Staging validation passed for v1.6.0.", actor: "N. Frei", at: isoSeconds({ hours: -5 }) },
      { id: "act-2004", releaseId: "rel-1003", type: "Status", title: "Inventory Sync completed", detail: "v1.9.4 deployed successfully to Staging.", actor: "S. Romano", at: isoSeconds({ days: -1 }) },
      { id: "act-2005", releaseId: "rel-1005", type: "Status", title: "Reporting Hub marked Failed", detail: "Release was stopped after an aggregation validation error.", actor: "A. Meier", at: isoSeconds({ days: -2 }) },
      { id: "act-2006", releaseId: "rel-1006", type: "Status", title: "Device Console completed", detail: "Development deployment completed successfully.", actor: "Andrea Ponzellini", at: isoSeconds({ days: -3 }) }
    ]
  };
})();
