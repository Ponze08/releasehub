using Microsoft.EntityFrameworkCore;
using ReleaseHub.Api.Data;
using ReleaseHub.Api.Models;
using ReleaseHub.Api.Services;
using Xunit;

namespace ReleaseHub.Api.Tests;

public sealed class ReleaseServiceTests
{
    [Fact]
    public async Task CreateAsync_PersistsReleaseAndActivity()
    {
        await using var db = CreateDb();
        var service = new ReleaseService(db);
        var request = ValidRequest();

        var created = await service.CreateAsync(request);

        Assert.NotEqual(Guid.Empty, created.Id);
        Assert.Equal("Customer Portal", created.Application);
        Assert.Single(await service.GetAllAsync());
        var activity = await service.GetActivityAsync();
        Assert.Single(activity);
        Assert.Equal("Created", activity.Single().Type);
    }

    [Fact]
    public async Task UpdateAsync_RecordsStatusChange()
    {
        await using var db = CreateDb();
        var service = new ReleaseService(db);
        var created = await service.CreateAsync(ValidRequest());
        var updatedRequest = ValidRequest() with { Status = "In Progress" };

        var updated = await service.UpdateAsync(created.Id, updatedRequest);

        Assert.NotNull(updated);
        Assert.Equal("In Progress", updated!.Status);
        var activity = await service.GetActivityAsync();
        Assert.Contains(activity, x => x.Type == "Status" && x.ReleaseId == created.Id);
    }

    [Fact]
    public async Task DeleteAsync_RemovesReleaseAndKeepsAuditRecord()
    {
        await using var db = CreateDb();
        var service = new ReleaseService(db);
        var created = await service.CreateAsync(ValidRequest());

        var deleted = await service.DeleteAsync(created.Id);

        Assert.True(deleted);
        Assert.Empty(await service.GetAllAsync());
        var activity = await service.GetActivityAsync();
        Assert.Contains(activity, x => x.Type == "Deleted");
    }

    private static ReleaseHubDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<ReleaseHubDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new ReleaseHubDbContext(options);
    }

    private static UpsertReleaseRequest ValidRequest() => new(
        "Customer Portal",
        "2.8.0",
        "Production",
        "Andrea Ponzellini",
        "Medium",
        "Ready",
        DateTimeOffset.UtcNow.AddDays(1),
        "Accessibility improvements and API validation fixes.");
}
