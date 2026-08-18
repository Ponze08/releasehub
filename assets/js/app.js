(() => {
  "use strict";

  const STORAGE_KEY = "releasehub.workspace.v1";
  const THEME_KEY = "releasehub.theme";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const els = {
    pageTitle: $("#pageTitle"),
    pageEyebrow: $("#pageEyebrow"),
    releaseCountBadge: $("#releaseCountBadge"),
    statsGrid: $("#statsGrid"),
    deploymentChart: $("#deploymentChart"),
    chartTotal: $("#chartTotal"),
    healthRing: $("#healthRing"),
    healthPercent: $("#healthPercent"),
    healthLegend: $("#healthLegend"),
    priorityTableBody: $("#priorityTableBody"),
    activityMiniList: $("#activityMiniList"),
    releasesTableBody: $("#releasesTableBody"),
    releaseEmptyState: $("#releaseEmptyState"),
    releaseResultCount: $("#releaseResultCount"),
    releaseSearch: $("#releaseSearch"),
    globalSearch: $("#globalSearch"),
    statusFilter: $("#statusFilter"),
    environmentFilter: $("#environmentFilter"),
    riskFilter: $("#riskFilter"),
    activityTimeline: $("#activityTimeline"),
    activitySearch: $("#activitySearch"),
    activityTypeFilter: $("#activityTypeFilter"),
    releaseModalBackdrop: $("#releaseModalBackdrop"),
    releaseModalTitle: $("#releaseModalTitle"),
    releaseModalLabel: $("#releaseModalLabel"),
    releaseForm: $("#releaseForm"),
    releaseId: $("#releaseId"),
    applicationInput: $("#applicationInput"),
    versionInput: $("#versionInput"),
    ownerInput: $("#ownerInput"),
    environmentInput: $("#environmentInput"),
    riskInput: $("#riskInput"),
    statusInput: $("#statusInput"),
    plannedDateInput: $("#plannedDateInput"),
    summaryInput: $("#summaryInput"),
    saveReleaseButton: $("#saveReleaseButton"),
    deleteRelease: $("#deleteRelease"),
    confirmBackdrop: $("#confirmBackdrop"),
    confirmText: $("#confirmText"),
    toastRegion: $("#toastRegion"),
    themeGlyph: $("#themeGlyph")
  };

  const pageMeta = {
    dashboard: ["Dashboard", "Release operations"],
    releases: ["Releases", "Release inventory"],
    activity: ["Activity", "Audit trail"]
  };

  let state = loadState();
  let pendingDeleteId = null;

  function cloneSeed() {
    return JSON.parse(JSON.stringify(window.RELEASEHUB_SEED));
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return cloneSeed();
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed.releases) || !Array.isArray(parsed.activity)) throw new Error("Invalid workspace");
      return parsed;
    } catch {
      return cloneSeed();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(value = "") {
    return String(value).trim().toLowerCase();
  }

  function statusClass(status) {
    return status.toLowerCase().replaceAll(" ", "-");
  }

  function riskClass(risk) {
    return risk.toLowerCase();
  }

  function formatDate(value, includeTime = false) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    const options = { day: "2-digit", month: "short" };
    if (includeTime) Object.assign(options, { hour: "2-digit", minute: "2-digit" });
    return new Intl.DateTimeFormat("en-GB", options).format(d);
  }

  function formatRelative(value) {
    const d = new Date(value);
    const now = new Date("2026-08-18T11:44:00+02:00");
    const diff = now - d;
    const mins = Math.round(diff / 60000);
    if (mins < 60 && mins >= 0) return `${Math.max(1, mins)}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24 && hours >= 0) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 7 && days >= 0) return `${days}d ago`;
    return formatDate(value, true);
  }

  function addActivity({ releaseId, type, title, detail, actor = "Andrea Ponzellini" }) {
    state.activity.unshift({
      id: uid("act"),
      releaseId,
      type,
      title,
      detail,
      actor,
      at: new Date().toISOString()
    });
    state.activity = state.activity.slice(0, 100);
  }

  function navigate(page) {
    if (!pageMeta[page]) return;
    $$(".page").forEach((el) => el.classList.toggle("active", el.dataset.page === page));
    $$(".nav-item").forEach((el) => el.classList.toggle("active", el.dataset.nav === page));
    const [title, eyebrow] = pageMeta[page];
    els.pageTitle.textContent = title;
    els.pageEyebrow.textContent = eyebrow;
    document.body.classList.remove("sidebar-open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderAll() {
    els.releaseCountBadge.textContent = state.releases.length;
    renderStats();
    renderDeploymentChart();
    renderHealth();
    renderPriorityTable();
    renderMiniActivity();
    renderReleases();
    renderActivity();
  }

  function renderStats() {
    const total = state.releases.length;
    const active = state.releases.filter((r) => ["Ready", "In Progress"].includes(r.status)).length;
    const prod = state.releases.filter((r) => r.environment === "Production").length;
    const highRisk = state.releases.filter((r) => r.risk === "High" && r.status !== "Completed").length;

    const cards = [
      ["Total releases", total, "↗", "All tracked changes", "var(--primary)"],
      ["Active queue", active, "→", "Ready or deploying", "var(--warning)"],
      ["Production", prod, "◇", "Production-targeted", "var(--purple)"],
      ["High risk", highRisk, "!", "Requires attention", "var(--danger)"]
    ];

    els.statsGrid.innerHTML = cards.map(([label, value, icon, foot, accent]) => `
      <article class="stat-card" style="--accent:${accent}">
        <div class="stat-top">
          <span class="stat-label">${escapeHtml(label)}</span>
          <span class="stat-icon">${escapeHtml(icon)}</span>
        </div>
        <div class="stat-value">${value}</div>
        <div class="stat-foot">${escapeHtml(foot)}</div>
      </article>
    `).join("");
  }

  function renderDeploymentChart() {
    const anchor = new Date("2026-08-18T12:00:00+02:00");
    const days = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const d = new Date(anchor);
      d.setDate(anchor.getDate() - offset);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const count = state.releases.filter((r) => r.plannedDate.startsWith(key)).length;
      days.push({ label: new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(d), count });
    }

    const max = Math.max(1, ...days.map((d) => d.count));
    const total = days.reduce((sum, d) => sum + d.count, 0);
    els.chartTotal.textContent = `${total} ${total === 1 ? "release" : "releases"}`;
    els.deploymentChart.innerHTML = days.map((day) => {
      const height = Math.max(7, Math.round((day.count / max) * 100));
      return `
        <div class="chart-day">
          <div class="chart-bar-wrap">
            <span class="chart-value">${day.count}</span>
            <div class="chart-bar" style="height:${height}%"></div>
          </div>
          <span class="chart-label">${day.label}</span>
        </div>
      `;
    }).join("");
  }

  function renderHealth() {
    const completed = state.releases.filter((r) => r.status === "Completed").length;
    const failed = state.releases.filter((r) => r.status === "Failed").length;
    const resolved = completed + failed;
    const success = resolved ? Math.round((completed / resolved) * 100) : 100;
    const failedPct = resolved ? 100 - success : 0;

    els.healthPercent.textContent = `${success}%`;
    els.healthRing.style.setProperty("--success-pct", success);
    els.healthRing.style.setProperty("--failed-pct", failedPct);
    els.healthLegend.innerHTML = [
      ["Completed", completed, "var(--success)"],
      ["Failed", failed, "var(--danger)"],
      ["Open", state.releases.length - resolved, "var(--muted-2)"]
    ].map(([label, value, color]) => `
      <div class="legend-row">
        <span class="legend-key"><span class="legend-dot" style="--legend-color:${color}"></span>${label}</span>
        <strong>${value}</strong>
      </div>
    `).join("");
  }

  function renderPriorityTable() {
    const priority = [...state.releases]
      .filter((r) => !["Completed", "Failed"].includes(r.status))
      .sort((a, b) => new Date(a.plannedDate) - new Date(b.plannedDate))
      .slice(0, 5);

    els.priorityTableBody.innerHTML = priority.length ? priority.map((r) => `
      <tr>
        <td class="release-cell"><span class="release-title">${escapeHtml(r.application)}</span><span class="release-version">v${escapeHtml(r.version)}</span></td>
        <td><span class="environment-chip">${escapeHtml(r.environment)}</span></td>
        <td><span class="status-pill ${statusClass(r.status)}">${escapeHtml(r.status)}</span></td>
        <td class="date-cell">${formatDate(r.plannedDate, true)}</td>
      </tr>
    `).join("") : `<tr><td colspan="4" class="date-cell">No active releases.</td></tr>`;
  }

  function activityGlyph(type) {
    return ({ Created: "+", Updated: "↻", Status: "→", Deleted: "−" })[type] || "•";
  }

  function renderMiniActivity() {
    els.activityMiniList.innerHTML = state.activity.slice(0, 4).map((a) => `
      <div class="activity-mini-item">
        <div class="activity-type-icon">${activityGlyph(a.type)}</div>
        <div class="activity-mini-content">
          <strong>${escapeHtml(a.title)}</strong>
          <span>${escapeHtml(a.actor)} · ${formatRelative(a.at)}</span>
        </div>
      </div>
    `).join("");
  }

  function filteredReleases() {
    const q = normalize(els.releaseSearch.value || els.globalSearch.value);
    const status = els.statusFilter.value;
    const environment = els.environmentFilter.value;
    const risk = els.riskFilter.value;

    return [...state.releases]
      .filter((r) => {
        const haystack = normalize(`${r.application} ${r.version} ${r.owner} ${r.summary} ${r.environment} ${r.status}`);
        return (!q || haystack.includes(q))
          && (status === "all" || r.status === status)
          && (environment === "all" || r.environment === environment)
          && (risk === "all" || r.risk === risk);
      })
      .sort((a, b) => new Date(b.plannedDate) - new Date(a.plannedDate));
  }

  function renderReleases() {
    const releases = filteredReleases();
    els.releasesTableBody.innerHTML = releases.map((r) => `
      <tr data-id="${escapeHtml(r.id)}">
        <td class="release-cell"><span class="release-title">${escapeHtml(r.application)}</span><span class="release-version">v${escapeHtml(r.version)}</span></td>
        <td><span class="environment-chip">${escapeHtml(r.environment)}</span></td>
        <td class="owner-cell">${escapeHtml(r.owner)}</td>
        <td><span class="risk-pill ${riskClass(r.risk)}">${escapeHtml(r.risk)}</span></td>
        <td><span class="status-pill ${statusClass(r.status)}">${escapeHtml(r.status)}</span></td>
        <td class="date-cell">${formatDate(r.plannedDate, true)}</td>
        <td class="align-right">
          <div class="action-menu">
            <button class="action-button status" data-action="advance" data-id="${escapeHtml(r.id)}" title="Advance status">Advance</button>
            <button class="action-button" data-action="edit" data-id="${escapeHtml(r.id)}">Edit</button>
          </div>
        </td>
      </tr>
    `).join("");

    els.releaseEmptyState.classList.toggle("hidden", releases.length > 0);
    els.releaseResultCount.textContent = `${releases.length} ${releases.length === 1 ? "release" : "releases"}`;
  }

  function filteredActivity() {
    const q = normalize(els.activitySearch.value);
    const type = els.activityTypeFilter.value;
    return state.activity.filter((a) => {
      const haystack = normalize(`${a.title} ${a.detail} ${a.actor} ${a.type}`);
      return (!q || haystack.includes(q)) && (type === "all" || a.type === type);
    });
  }

  function renderActivity() {
    const activity = filteredActivity();
    els.activityTimeline.innerHTML = activity.length ? activity.map((a) => `
      <article class="timeline-item">
        <div class="timeline-icon">${activityGlyph(a.type)}</div>
        <div class="timeline-content">
          <h3>${escapeHtml(a.title)}</h3>
          <p>${escapeHtml(a.detail)}</p>
          <div class="timeline-meta">${escapeHtml(a.actor)} · ${escapeHtml(a.type)}</div>
        </div>
        <time class="timeline-time" datetime="${escapeHtml(a.at)}">${formatDate(a.at, true)}</time>
      </article>
    `).join("") : `<div class="empty-state"><div class="empty-icon">⌕</div><h3>No activity found</h3><p>Try a different search or filter.</p></div>`;
  }

  function defaultPlannedDate() {
    const d = new Date();
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    d.setHours(d.getHours() + 1);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    return local;
  }

  function openReleaseModal(id = null) {
    const r = id ? state.releases.find((item) => item.id === id) : null;
    els.releaseForm.reset();
    els.releaseId.value = r?.id || "";

    if (r) {
      els.releaseModalLabel.textContent = "Release details";
      els.releaseModalTitle.textContent = `Edit ${r.application}`;
      els.saveReleaseButton.textContent = "Save changes";
      els.deleteRelease.classList.remove("hidden");
      els.applicationInput.value = r.application;
      els.versionInput.value = r.version;
      els.ownerInput.value = r.owner;
      els.environmentInput.value = r.environment;
      els.riskInput.value = r.risk;
      els.statusInput.value = r.status;
      els.plannedDateInput.value = r.plannedDate.slice(0, 16);
      els.summaryInput.value = r.summary;
    } else {
      els.releaseModalLabel.textContent = "New change";
      els.releaseModalTitle.textContent = "Create release";
      els.saveReleaseButton.textContent = "Create release";
      els.deleteRelease.classList.add("hidden");
      els.ownerInput.value = "Andrea Ponzellini";
      els.environmentInput.value = "Production";
      els.riskInput.value = "Medium";
      els.statusInput.value = "Planned";
      els.plannedDateInput.value = defaultPlannedDate();
    }

    els.releaseModalBackdrop.classList.remove("hidden");
    setTimeout(() => els.applicationInput.focus(), 60);
  }

  function closeReleaseModal() {
    els.releaseModalBackdrop.classList.add("hidden");
  }

  function handleReleaseSubmit(event) {
    event.preventDefault();
    const id = els.releaseId.value;
    const payload = {
      application: els.applicationInput.value.trim(),
      version: els.versionInput.value.trim(),
      owner: els.ownerInput.value.trim(),
      environment: els.environmentInput.value,
      risk: els.riskInput.value,
      status: els.statusInput.value,
      plannedDate: els.plannedDateInput.value,
      summary: els.summaryInput.value.trim()
    };

    if (id) {
      const index = state.releases.findIndex((r) => r.id === id);
      if (index < 0) return;
      const before = state.releases[index];
      state.releases[index] = { ...before, ...payload, updatedAt: new Date().toISOString() };
      addActivity({
        releaseId: id,
        type: before.status !== payload.status ? "Status" : "Updated",
        title: before.status !== payload.status ? `${payload.application} moved to ${payload.status}` : `${payload.application} release updated`,
        detail: before.status !== payload.status ? `Status changed from ${before.status} to ${payload.status}.` : `Release v${payload.version} details were updated.`
      });
      toast("Release updated", `${payload.application} v${payload.version} was saved.`);
    } else {
      const release = {
        id: uid("rel"),
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      state.releases.unshift(release);
      addActivity({
        releaseId: release.id,
        type: "Created",
        title: `${release.application} release created`,
        detail: `v${release.version} planned for ${release.environment}.`
      });
      toast("Release created", `${payload.application} v${payload.version} is now tracked.`);
    }

    saveState();
    closeReleaseModal();
    renderAll();
  }

  function requestDelete(id) {
    const r = state.releases.find((item) => item.id === id);
    if (!r) return;
    pendingDeleteId = id;
    els.confirmText.textContent = `${r.application} v${r.version} will be removed from this demo workspace.`;
    els.confirmBackdrop.classList.remove("hidden");
  }

  function confirmDelete() {
    const r = state.releases.find((item) => item.id === pendingDeleteId);
    if (!r) return;
    state.releases = state.releases.filter((item) => item.id !== pendingDeleteId);
    addActivity({
      releaseId: r.id,
      type: "Deleted",
      title: `${r.application} release deleted`,
      detail: `v${r.version} was removed from the workspace.`
    });
    saveState();
    pendingDeleteId = null;
    els.confirmBackdrop.classList.add("hidden");
    closeReleaseModal();
    renderAll();
    toast("Release deleted", `${r.application} v${r.version} was removed.`);
  }

  function advanceStatus(id) {
    const flow = ["Planned", "Ready", "In Progress", "Completed"];
    const r = state.releases.find((item) => item.id === id);
    if (!r) return;
    if (r.status === "Failed" || r.status === "Completed") {
      toast("No status change", `${r.application} is already ${r.status.toLowerCase()}.`);
      return;
    }
    const current = flow.indexOf(r.status);
    const next = flow[Math.min(current + 1, flow.length - 1)];
    const previous = r.status;
    r.status = next;
    r.updatedAt = new Date().toISOString();
    addActivity({
      releaseId: id,
      type: "Status",
      title: `${r.application} moved to ${next}`,
      detail: `Status changed from ${previous} to ${next}.`
    });
    saveState();
    renderAll();
    toast("Status advanced", `${r.application} is now ${next}.`);
  }

  function toast(title, message) {
    const node = document.createElement("div");
    node.className = "toast";
    node.innerHTML = `<div class="toast-mark">✓</div><div class="toast-content"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span></div>`;
    els.toastRegion.appendChild(node);
    setTimeout(() => node.remove(), 3400);
  }

  function downloadBlob(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const headers = ["Application", "Version", "Environment", "Owner", "Risk", "Status", "Planned Date", "Summary"];
    const rows = state.releases.map((r) => [r.application, r.version, r.environment, r.owner, r.risk, r.status, r.plannedDate, r.summary]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    downloadBlob("releasehub-releases.csv", csv, "text/csv;charset=utf-8");
    toast("CSV exported", `${state.releases.length} releases were exported.`);
  }

  function exportActivity() {
    downloadBlob("releasehub-activity.json", JSON.stringify(state.activity, null, 2), "application/json");
    toast("Activity exported", "The audit log was exported as JSON.");
  }

  function resetDemo() {
    if (!window.confirm("Reset ReleaseHub to the original demo data?")) return;
    state = cloneSeed();
    saveState();
    renderAll();
    toast("Demo reset", "The original sample workspace has been restored.");
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    els.themeGlyph.textContent = theme === "dark" ? "☼" : "◐";
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const preferred = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    applyTheme(saved || preferred);
  }

  function clearFilters() {
    els.releaseSearch.value = "";
    els.globalSearch.value = "";
    els.statusFilter.value = "all";
    els.environmentFilter.value = "all";
    els.riskFilter.value = "all";
    renderReleases();
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const nav = event.target.closest("[data-nav]");
      if (nav) {
        event.preventDefault();
        navigate(nav.dataset.nav);
      }

      const action = event.target.closest("[data-action]");
      if (action) {
        const { id } = action.dataset;
        if (action.dataset.action === "edit") openReleaseModal(id);
        if (action.dataset.action === "advance") advanceStatus(id);
      }
    });

    $("#newReleaseTop").addEventListener("click", () => openReleaseModal());
    $("#newReleasePage").addEventListener("click", () => openReleaseModal());
    $("#closeReleaseModal").addEventListener("click", closeReleaseModal);
    $("#cancelReleaseModal").addEventListener("click", closeReleaseModal);
    els.releaseModalBackdrop.addEventListener("click", (event) => { if (event.target === els.releaseModalBackdrop) closeReleaseModal(); });
    els.releaseForm.addEventListener("submit", handleReleaseSubmit);
    els.deleteRelease.addEventListener("click", () => requestDelete(els.releaseId.value));
    $("#confirmCancel").addEventListener("click", () => { pendingDeleteId = null; els.confirmBackdrop.classList.add("hidden"); });
    $("#confirmDelete").addEventListener("click", confirmDelete);
    els.confirmBackdrop.addEventListener("click", (event) => { if (event.target === els.confirmBackdrop) { pendingDeleteId = null; els.confirmBackdrop.classList.add("hidden"); } });

    [els.releaseSearch, els.statusFilter, els.environmentFilter, els.riskFilter].forEach((el) => el.addEventListener("input", renderReleases));
    [els.activitySearch, els.activityTypeFilter].forEach((el) => el.addEventListener("input", renderActivity));
    $("#clearFilters").addEventListener("click", clearFilters);

    els.globalSearch.addEventListener("input", () => {
      els.releaseSearch.value = els.globalSearch.value;
      renderReleases();
      if (els.globalSearch.value.trim()) navigate("releases");
    });

    $("#exportCsv").addEventListener("click", exportCsv);
    $("#exportActivity").addEventListener("click", exportActivity);
    $("#resetDemo").addEventListener("click", resetDemo);
    $("#themeToggle").addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
    $("#openSidebar").addEventListener("click", () => document.body.classList.add("sidebar-open"));
    $("#closeSidebar").addEventListener("click", () => document.body.classList.remove("sidebar-open"));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeReleaseModal();
        els.confirmBackdrop.classList.add("hidden");
        document.body.classList.remove("sidebar-open");
      }
      if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
        event.preventDefault();
        els.globalSearch.focus();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        els.globalSearch.focus();
      }
    });
  }

  initTheme();
  bindEvents();
  renderAll();
})();
