using Microsoft.EntityFrameworkCore;
using ReleaseHub.Api.Models;

namespace ReleaseHub.Api.Data;

public sealed class ReleaseHubDbContext(DbContextOptions<ReleaseHubDbContext> options) : DbContext(options)
{
    public DbSet<ReleaseItem> Releases => Set<ReleaseItem>();
    public DbSet<ReleaseActivity> Activities => Set<ReleaseActivity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var release = modelBuilder.Entity<ReleaseItem>();
        release.ToTable("Release");
        release.HasKey(x => x.Id);
        release.Property(x => x.Id).HasColumnName("ReleaseId");
        release.Property(x => x.Application).HasMaxLength(100).IsRequired();
        release.Property(x => x.Version).HasMaxLength(30).IsRequired();
        release.Property(x => x.Environment).HasMaxLength(30).IsRequired();
        release.Property(x => x.Owner).HasMaxLength(100).IsRequired();
        release.Property(x => x.Risk).HasMaxLength(20).IsRequired();
        release.Property(x => x.Status).HasMaxLength(30).IsRequired();
        release.Property(x => x.Summary).HasMaxLength(500).IsRequired();
        release.HasIndex(x => x.PlannedDate);
        release.HasIndex(x => new { x.Status, x.Environment });

        var activity = modelBuilder.Entity<ReleaseActivity>();
        activity.ToTable("ReleaseActivity");
        activity.HasKey(x => x.Id);
        activity.Property(x => x.Id).HasColumnName("ActivityId");
        activity.Property(x => x.Type).HasColumnName("ActivityType").HasMaxLength(30).IsRequired();
        activity.Property(x => x.Title).HasMaxLength(200).IsRequired();
        activity.Property(x => x.Detail).HasMaxLength(500).IsRequired();
        activity.Property(x => x.Actor).HasMaxLength(100).IsRequired();
        activity.Property(x => x.CreatedAt).IsRequired();
        activity.HasIndex(x => x.CreatedAt);
        activity.HasIndex(x => new { x.ReleaseId, x.CreatedAt });
    }
}
