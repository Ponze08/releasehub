using ReleaseHub.Api.Models;
using ReleaseHub.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IReleaseService, InMemoryReleaseService>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();
app.UseCors();

app.MapGet("/", () => Results.Ok(new
{
    service = "ReleaseHub.Api",
    version = "1.0.0",
    status = "ok"
}));

var releases = app.MapGroup("/api/releases");

releases.MapGet("/", (IReleaseService service) => Results.Ok(service.GetAll()));

releases.MapGet("/{id:guid}", (Guid id, IReleaseService service) =>
    service.Get(id) is { } item ? Results.Ok(item) : Results.NotFound());

releases.MapPost("/", (UpsertReleaseRequest request, IReleaseService service) =>
{
    var validation = Validate(request);
    if (validation is not null) return Results.ValidationProblem(validation);

    var created = service.Create(request);
    return Results.Created($"/api/releases/{created.Id}", created);
});

releases.MapPut("/{id:guid}", (Guid id, UpsertReleaseRequest request, IReleaseService service) =>
{
    var validation = Validate(request);
    if (validation is not null) return Results.ValidationProblem(validation);

    return service.Update(id, request) is { } updated
        ? Results.Ok(updated)
        : Results.NotFound();
});

releases.MapDelete("/{id:guid}", (Guid id, IReleaseService service) =>
    service.Delete(id) ? Results.NoContent() : Results.NotFound());

app.Run();

static Dictionary<string, string[]>? Validate(UpsertReleaseRequest request)
{
    var errors = new Dictionary<string, string[]>();

    if (string.IsNullOrWhiteSpace(request.Application)) errors["application"] = ["Application is required."];
    if (string.IsNullOrWhiteSpace(request.Version)) errors["version"] = ["Version is required."];
    if (string.IsNullOrWhiteSpace(request.Owner)) errors["owner"] = ["Owner is required."];
    if (string.IsNullOrWhiteSpace(request.Summary)) errors["summary"] = ["Summary is required."];

    var environments = new[] { "Production", "Staging", "QA", "Development" };
    if (!environments.Contains(request.Environment)) errors["environment"] = ["Unknown environment."];

    var risks = new[] { "Low", "Medium", "High" };
    if (!risks.Contains(request.Risk)) errors["risk"] = ["Unknown risk level."];

    var statuses = new[] { "Planned", "Ready", "In Progress", "Completed", "Failed" };
    if (!statuses.Contains(request.Status)) errors["status"] = ["Unknown status."];

    return errors.Count == 0 ? null : errors;
}
