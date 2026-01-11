using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SasiadMa.Api.Data;
using SasiadMa.Api.Models;
using SasiadMa.Api.Services;
using SasiadMa.Api.Endpoints;

// Ensure ASPNETCORE_ENVIRONMENT is set to Development if not already set
if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")))
{
    Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");
}

var builder = WebApplication.CreateBuilder(args);

// Configuration - Load environment-specific appsettings
var env = builder.Environment;
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    // Password validation (PRD requirements)
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 8;

    // Bez potwierdzenia email dla MVP
    options.SignIn.RequireConfirmedEmail = false;
    options.SignIn.RequireConfirmedAccount = false;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("JWT Secret not configured");
var key = Encoding.ASCII.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Dev only, production = true
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// HttpClient for external services
builder.Services.AddHttpClient();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICommunityService, CommunityService>();
builder.Services.AddScoped<IStorageService, StorageService>();
builder.Services.AddScoped<IItemService, ItemService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<IUserService, UserService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(builder.Configuration["FrontendUrl"] ?? "http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// Endpoints
app.MapGet("/api/health", () => new
{
    status = "healthy",
    message = "Sąsiad-Ma API is running! 🚀",
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName
}).WithName("HealthCheck");

app.MapAuthEndpoints();
app.MapCommunityEndpoints();
app.MapItemEndpoints();
app.MapBookingEndpoints();
app.MapMessageEndpoints();
app.MapUserEndpoints();

app.Run();
