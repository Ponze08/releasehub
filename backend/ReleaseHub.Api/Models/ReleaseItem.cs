using System.ComponentModel.DataAnnotations;

namespace ReleaseHub.Api.Models;

public sealed class ReleaseItem
{
    public Guid Id { get; set; }

    [MaxLength(100)]
    public string Application { get; set; } = string.Empty;

    [MaxLength(30)]
    public string Version { get; set; } = string.Empty;

    [MaxLength(30)]
    public string Environment { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Owner { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Risk { get; set; } = string.Empty;

    [MaxLength(30)]
    public string Status { get; set; } = string.Empty;

    public DateTimeOffset PlannedDate { get; set; }

    [MaxLength(500)]
    public string Summary { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class ReleaseActivity
{
    public long Id { get; set; }
    public Guid? ReleaseId { get; set; }

    [MaxLength(30)]
    public string Type { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Detail { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Actor { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }
}

public sealed record UpsertReleaseRequest(
    string Application,
    string Version,
    string Environment,
    string Owner,
    string Risk,
    string Status,
    DateTimeOffset PlannedDate,
    string Summary);
