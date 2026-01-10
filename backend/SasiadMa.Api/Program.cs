using Microsoft.EntityFrameworkCore;
using SasiadMa.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                builder.Configuration["FrontendUrl"] ?? "http://localhost:5173"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Enable CORS
app.UseCors("AllowFrontend");

// Test endpoint
app.MapGet("/api/health", () => new
{
    status = "healthy",
    message = "Sąsiad-Ma API is running! 🚀",
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName
})
.WithName("HealthCheck");

app.Run();
