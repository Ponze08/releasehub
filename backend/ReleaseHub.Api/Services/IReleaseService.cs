using ReleaseHub.Api.Models;

namespace ReleaseHub.Api.Services;

public interface IReleaseService
{
    Task<IReadOnlyCollection<ReleaseItem>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ReleaseItem?> GetAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ReleaseItem> CreateAsync(UpsertReleaseRequest request, CancellationToken cancellationToken = default);
    Task<ReleaseItem?> UpdateAsync(Guid id, UpsertReleaseRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ReleaseActivity>> GetActivityAsync(CancellationToken cancellationToken = default);
}
