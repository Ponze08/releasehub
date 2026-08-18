namespace ReleaseHub.Api.Models;

public sealed record ReleaseItem(
    Guid Id,
    string Application,
    string Version,
    string Environment,
    string Owner,
    string Risk,
    string Status,
    DateTimeOffset PlannedDate,
    string Summary,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record UpsertReleaseRequest(
    string Application,
    string Version,
    string Environment,
    string Owner,
    string Risk,
    string Status,
    DateTimeOffset PlannedDate,
    string Summary);
