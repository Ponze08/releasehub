using Microsoft.EntityFrameworkCore;
using ReleaseHub.Api.Data;
using ReleaseHub.Api.Models;
using ReleaseHub.Api.Services;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("ReleaseHub");
if (string.IsNullOrWhiteSpace(connectionString))
{
    builder.Services.AddDbContext<ReleaseHubDbContext>(options =>
        options.UseInMemoryDatabase("ReleaseHub"));
}
else
{
    builder.Services.AddDbContext<ReleaseHubDbContext>(options =>
        options.UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure()));
}

builder.Services.AddScoped<IReleaseService, ReleaseService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
            return;
        }

        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

var app = builder.Build();

app.UseExceptionHandler();
app.UseCors();

if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

await SeedAsync(app.Services);

app.MapGet("/health", async (ReleaseHubDbContext db, CancellationToken ct) =>
{
    var databaseAvailable = await db.Database.CanConnectAsync(ct);
    return databaseAvailable
        ? Results.Ok(new
        {
            service = "ReleaseHub.Api",
            status = "ok",
            database = db.Database.ProviderName,
            utc = DateTimeOffset.UtcNow
        })
        : Results.Problem(
            title: "Database unavailable",
            detail: "The application is running but the configured database cannot be reached.",
            statusCode: StatusCodes.Status503ServiceUnavailable);
});

var releases = app.MapGroup("/api/releases");

releases.MapGet("/", async (IReleaseService service, CancellationToken ct) =>
    Results.Ok(await service.GetAllAsync(ct)));

releases.MapGet("/{id:guid}", async (Guid id, IReleaseService service, CancellationToken ct) =>
    await service.GetAsync(id, ct) is { } item ? Results.Ok(item) : Results.NotFound());

releases.MapPost("/", async (UpsertReleaseRequest request, IReleaseService service, CancellationToken ct) =>
{
    var validation = Validate(request);
    if (validation is not null) return Results.ValidationProblem(validation);

    var created = await service.CreateAsync(request, ct);
    return Results.Created($"/api/releases/{created.Id}", created);
});

releases.MapPut("/{id:guid}", async (Guid id, UpsertReleaseRequest request, IReleaseService service, CancellationToken ct) =>
{
    var validation = Validate(request);
    if (validation is not null) return Results.ValidationProblem(validation);

    return await service.UpdateAsync(id, request, ct) is { } updated
        ? Results.Ok(updated)
        : Results.NotFound();
});

releases.MapDelete("/{id:guid}", async (Guid id, IReleaseService service, CancellationToken ct) =>
    await service.DeleteAsync(id, ct) ? Results.NoContent() : Results.NotFound());

app.MapGet("/api/activity", async (IReleaseService service, CancellationToken ct) =>
    Results.Ok(await service.GetActivityAsync(ct)));

app.Run();

static Dictionary<string, string[]>? Validate(UpsertReleaseRequest request)
{
    var errors = new Dictionary<string, string[]>();

    ValidateText(request.Application, "application", 100, errors);
    ValidateText(request.Version, "version", 30, errors);
    ValidateText(request.Owner, "owner", 100, errors);
    ValidateText(request.Summary, "summary", 500, errors);

    var environments = new[] { "Production", "Staging", "QA", "Development" };
    if (!environments.Contains(request.Environment))
        errors["environment"] = ["Unknown environment."];

    var risks = new[] { "Low", "Medium", "High" };
    if (!risks.Contains(request.Risk))
        errors["risk"] = ["Unknown risk level."];

    var statuses = new[] { "Planned", "Ready", "In Progress", "Completed", "Failed" };
    if (!statuses.Contains(request.Status))
        errors["status"] = ["Unknown status."];

    if (request.PlannedDate == default)
        errors["plannedDate"] = ["Planned date is required."];

    return errors.Count == 0 ? null : errors;
}

static void ValidateText(string? value, string key, int maxLength, Dictionary<string, string[]> errors)
{
    if (string.IsNullOrWhiteSpace(value))
    {
        errors[key] = ["This field is required."];
        return;
    }

    if (value.Trim().Length > maxLength)
        errors[key] = [$"Maximum length is {maxLength} characters."];
}

static async Task SeedAsync(IServiceProvider services)
{
    await using var scope = services.CreateAsyncScope();
    var db = scope.ServiceProvider.GetRequiredService<ReleaseHubDbContext>();
    await db.Database.EnsureCreatedAsync();

    if (await db.Releases.AnyAsync()) return;

    var now = DateTimeOffset.UtcNow;
    db.Releases.AddRange(
        new ReleaseItem
        {
            Id = Guid.NewGuid(), Application = "Customer Portal", Version = "2.8.0",
            Environment = "Production", Owner = "Andrea Ponzellini", Risk = "Medium",
            Status = "Ready", PlannedDate = now.AddDays(1),
            Summary = "Accessibility improvements and API validation fixes.",
            CreatedAt = now.AddDays(-6), UpdatedAt = now.AddHours(-3)
        },
        new ReleaseItem
        {
            Id = Guid.NewGuid(), Application = "Orders API", Version = "4.12.1",
            Environment = "Production", Owner = "M. Keller", Risk = "High",
            Status = "In Progress", PlannedDate = now.AddHours(4),
            Summary = "Database index changes and queue retry logic.",
            CreatedAt = now.AddDays(-8), UpdatedAt = now.AddHours(-1)
        },
        new ReleaseItem
        {
            Id = Guid.NewGuid(), Application = "Inventory Sync", Version = "1.9.4",
            Environment = "Staging", Owner = "S. Romano", Risk = "Low",
            Status = "Completed", PlannedDate = now.AddDays(-1),
            Summary = "Incremental synchronization and improved diagnostics.",
            CreatedAt = now.AddDays(-9), UpdatedAt = now.AddDays(-1)
        });

    await db.SaveChangesAsync();
}

public partial class Program;
