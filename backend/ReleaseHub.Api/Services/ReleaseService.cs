using Microsoft.EntityFrameworkCore;
using ReleaseHub.Api.Data;
using ReleaseHub.Api.Models;

namespace ReleaseHub.Api.Services;

public sealed class ReleaseService(ReleaseHubDbContext db) : IReleaseService
{
    public async Task<IReadOnlyCollection<ReleaseItem>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await db.Releases.AsNoTracking().OrderByDescending(x => x.PlannedDate).ToArrayAsync(cancellationToken);

    public Task<ReleaseItem?> GetAsync(Guid id, CancellationToken cancellationToken = default) =>
        db.Releases.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<ReleaseItem> CreateAsync(UpsertReleaseRequest request, CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var item = new ReleaseItem
        {
            Id = Guid.NewGuid(),
            Application = request.Application.Trim(),
            Version = request.Version.Trim(),
            Environment = request.Environment,
            Owner = request.Owner.Trim(),
            Risk = request.Risk,
            Status = request.Status,
            PlannedDate = request.PlannedDate,
            Summary = request.Summary.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Releases.Add(item);
        db.Activities.Add(Activity(item.Id, "Created", $"{item.Application} release created", $"v{item.Version} planned for {item.Environment}.", item.Owner));
        await db.SaveChangesAsync(cancellationToken);
        return item;
    }

    public async Task<ReleaseItem?> UpdateAsync(Guid id, UpsertReleaseRequest request, CancellationToken cancellationToken = default)
    {
        var item = await db.Releases.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (item is null) return null;

        var previousStatus = item.Status;
        item.Application = request.Application.Trim();
        item.Version = request.Version.Trim();
        item.Environment = request.Environment;
        item.Owner = request.Owner.Trim();
        item.Risk = request.Risk;
        item.Status = request.Status;
        item.PlannedDate = request.PlannedDate;
        item.Summary = request.Summary.Trim();
        item.UpdatedAt = DateTimeOffset.UtcNow;

        var isStatusChange = !string.Equals(previousStatus, item.Status, StringComparison.Ordinal);
        db.Activities.Add(Activity(
            item.Id,
            isStatusChange ? "Status" : "Updated",
            isStatusChange ? $"{item.Application} moved to {item.Status}" : $"{item.Application} release updated",
            isStatusChange ? $"Status changed from {previousStatus} to {item.Status}." : $"Release v{item.Version} details were updated.",
            item.Owner));

        await db.SaveChangesAsync(cancellationToken);
        return item;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var item = await db.Releases.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (item is null) return false;

        db.Activities.Add(Activity(item.Id, "Deleted", $"{item.Application} release deleted", $"v{item.Version} was removed from the workspace.", item.Owner));
        db.Releases.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyCollection<ReleaseActivity>> GetActivityAsync(CancellationToken cancellationToken = default) =>
        await db.Activities.AsNoTracking().OrderByDescending(x => x.CreatedAt).Take(100).ToArrayAsync(cancellationToken);

    private static ReleaseActivity Activity(Guid? releaseId, string type, string title, string detail, string actor) => new()
    {
        ReleaseId = releaseId,
        Type = type,
        Title = title,
        Detail = detail,
        Actor = actor,
        CreatedAt = DateTimeOffset.UtcNow
    };
}
