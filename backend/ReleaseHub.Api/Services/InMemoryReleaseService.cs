using System.Collections.Concurrent;
using ReleaseHub.Api.Models;

namespace ReleaseHub.Api.Services;

public sealed class InMemoryReleaseService : IReleaseService
{
    private readonly ConcurrentDictionary<Guid, ReleaseItem> _releases = new();

    public InMemoryReleaseService()
    {
        Seed("Customer Portal", "2.8.0", "Production", "Andrea Ponzellini", "Medium", "Ready", DateTimeOffset.UtcNow.AddDays(1), "Accessibility improvements and API validation fixes.");
        Seed("Orders API", "4.12.1", "Production", "M. Keller", "High", "In Progress", DateTimeOffset.UtcNow.AddHours(2), "Database index changes and queue retry logic.");
        Seed("Inventory Sync", "1.9.4", "Staging", "S. Romano", "Low", "Completed", DateTimeOffset.UtcNow.AddDays(-1), "Incremental synchronization and improved diagnostics.");
    }

    public IReadOnlyCollection<ReleaseItem> GetAll() =>
        _releases.Values.OrderByDescending(x => x.PlannedDate).ToArray();

    public ReleaseItem? Get(Guid id) => _releases.GetValueOrDefault(id);

    public ReleaseItem Create(UpsertReleaseRequest request)
    {
        var now = DateTimeOffset.UtcNow;
        var item = new ReleaseItem(
            Guid.NewGuid(),
            request.Application.Trim(),
            request.Version.Trim(),
            request.Environment.Trim(),
            request.Owner.Trim(),
            request.Risk.Trim(),
            request.Status.Trim(),
            request.PlannedDate,
            request.Summary.Trim(),
            now,
            now);

        _releases[item.Id] = item;
        return item;
    }

    public ReleaseItem? Update(Guid id, UpsertReleaseRequest request)
    {
        if (!_releases.TryGetValue(id, out var current)) return null;

        var updated = current with
        {
            Application = request.Application.Trim(),
            Version = request.Version.Trim(),
            Environment = request.Environment.Trim(),
            Owner = request.Owner.Trim(),
            Risk = request.Risk.Trim(),
            Status = request.Status.Trim(),
            PlannedDate = request.PlannedDate,
            Summary = request.Summary.Trim(),
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _releases[id] = updated;
        return updated;
    }

    public bool Delete(Guid id) => _releases.TryRemove(id, out _);

    private void Seed(string application, string version, string environment, string owner, string risk, string status, DateTimeOffset plannedDate, string summary)
    {
        var now = DateTimeOffset.UtcNow;
        var item = new ReleaseItem(Guid.NewGuid(), application, version, environment, owner, risk, status, plannedDate, summary, now, now);
        _releases[item.Id] = item;
    }
}
