using ReleaseHub.Api.Models;

namespace ReleaseHub.Api.Services;

public interface IReleaseService
{
    IReadOnlyCollection<ReleaseItem> GetAll();
    ReleaseItem? Get(Guid id);
    ReleaseItem Create(UpsertReleaseRequest request);
    ReleaseItem? Update(Guid id, UpsertReleaseRequest request);
    bool Delete(Guid id);
}
