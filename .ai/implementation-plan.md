# Plan Implementacji - Sąsiad-Ma Micro-MVP

**Wersja:** 0.1
**Data utworzenia:** 2026-01-10
**Szacowany czas realizacji:** 2-3 tygodnie
**Liczba User Stories:** 10

---

## Spis treści

1. [Faza 0: Przygotowanie środowiska](#faza-0-przygotowanie-środowiska)
2. [Faza 1: Fundament - Baza danych i autentykacja](#faza-1-fundament---baza-danych-i-autentykacja)
3. [Faza 2: Społeczności](#faza-2-społeczności)
4. [Faza 3: Przedmioty](#faza-3-przedmioty)
5. [Faza 4: Rezerwacje i wypożyczenia](#faza-4-rezerwacje-i-wypożyczenia)
6. [Faza 5: Komunikacja](#faza-5-komunikacja)
7. [Faza 6: Email notifications](#faza-6-email-notifications)
8. [Faza 7: Testy i deployment](#faza-7-testy-i-deployment)
9. [Metryki sukcesu](#metryki-sukcesu)

---

## Faza 0: Przygotowanie środowiska

**Szacowany czas:** 1-2 dni
**Status:** ⏳ Do zrobienia

### 0.1 Backend - Instalacja zależności

**Plik:** `backend/SasiadMa.Api/SasiadMa.Api.csproj`

Dodać następujące pakiety NuGet:

```bash
cd backend/SasiadMa.Api

# Database & ORM
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Design

# Authentication & JWT
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer

# Email
dotnet add package SendGrid

# Supabase Storage (unofficial client lub HTTP client)
# Alternatywnie: własna implementacja z HttpClient
dotnet add package Supabase
```

### 0.2 Frontend - Instalacja zależności

**Plik:** `frontend/package.json`

```bash
cd frontend

# UI Framework
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-avatar
npm install class-variance-authority clsx tailwind-merge lucide-react

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Routing
npm install react-router-dom

# Date utilities
npm install date-fns

# Dev dependencies
npm install -D @types/node
```

### 0.3 Konfiguracja Supabase

**Zadania:**

1. Założyć konto na Supabase (free tier)
2. Utworzyć nowy projekt: `sasiad-ma-dev`
3. Skopiować:
   - Database URL (Connection String)
   - Supabase URL
   - Anon Key
   - Service Role Key (do backendu)
4. Utworzyć buckety w Storage:
   - `items-photos`
   - `avatars`
5. Skonfigurować Row Level Security (RLS) dla buckets

### 0.4 Konfiguracja SendGrid

**Zadania:**

1. Założyć konto na SendGrid (free tier: 100 emails/day)
2. Utworzyć API Key
3. Zweryfikować sender identity (email FROM)

### 0.5 Environment Variables

**Backend:** `backend/SasiadMa.Api/appsettings.Development.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=<supabase-host>;Database=postgres;Username=postgres;Password=<password>"
  },
  "Jwt": {
    "Secret": "<generate-strong-secret-min-32-chars>",
    "Issuer": "sasiad-ma-api",
    "Audience": "sasiad-ma-client",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationMinutes": 43200
  },
  "Supabase": {
    "Url": "https://<project>.supabase.co",
    "AnonKey": "<anon-key>",
    "ServiceKey": "<service-role-key>"
  },
  "SendGrid": {
    "ApiKey": "<sendgrid-api-key>",
    "FromEmail": "noreply@sasiad-ma.pl",
    "FromName": "Sąsiad-Ma"
  },
  "FrontendUrl": "http://localhost:5173"
}
```

**Frontend:** `frontend/.env`

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### 0.6 Struktura projektu Backend

**Utworzyć foldery:**

```
backend/SasiadMa.Api/
├── Data/
│   ├── AppDbContext.cs
│   └── Migrations/
├── Models/
│   ├── User.cs
│   ├── Community.cs
│   ├── InviteLink.cs
│   ├── Item.cs
│   ├── Booking.cs
│   ├── Message.cs
│   └── Conversation.cs
├── DTOs/
│   ├── Auth/
│   ├── Communities/
│   ├── Items/
│   ├── Bookings/
│   └── Messages/
├── Services/
│   ├── IAuthService.cs
│   ├── AuthService.cs
│   ├── IEmailService.cs
│   ├── EmailService.cs
│   ├── IStorageService.cs
│   └── StorageService.cs
├── Endpoints/
│   ├── AuthEndpoints.cs
│   ├── CommunityEndpoints.cs
│   ├── ItemEndpoints.cs
│   ├── BookingEndpoints.cs
│   └── MessageEndpoints.cs
└── Program.cs
```

### 0.7 Struktura projektu Frontend

**Utworzyć foldery:**

```
frontend/src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── auth/
│   ├── community/
│   ├── items/
│   ├── bookings/
│   └── messages/
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── ItemsPage.tsx
│   ├── ItemDetailsPage.tsx
│   ├── MyItemsPage.tsx
│   ├── MessagesPage.tsx
│   └── ProfilePage.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useApi.ts
├── lib/
│   ├── api.ts
│   └── utils.ts
├── types/
│   └── index.ts
└── App.tsx
```

---

## Faza 1: Fundament - Baza danych i autentykacja

**Szacowany czas:** 3-4 dni
**User Stories:** US-001
**Status:** ⏳ Do zrobienia

### 1.1 Backend - Database Models

**Plik:** `backend/SasiadMa.Api/Models/User.cs`

```csharp
using Microsoft.AspNetCore.Identity;

namespace SasiadMa.Api.Models;

public class User : IdentityUser
{
    public string PreferredName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Relationships
    public int? CommunityId { get; set; }
    public Community? Community { get; set; }

    public ICollection<Item> Items { get; set; } = new List<Item>();
    public ICollection<Booking> BookingsAsOwner { get; set; } = new List<Booking>();
    public ICollection<Booking> BookingsAsBorrower { get; set; } = new List<Booking>();
}
```

**Plik:** `backend/SasiadMa.Api/Models/Community.cs`

```csharp
namespace SasiadMa.Api.Models;

public class Community
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string AdminId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Relationships
    public User Admin { get; set; } = null!;
    public ICollection<User> Members { get; set; } = new List<User>();
    public ICollection<InviteLink> InviteLinks { get; set; } = new List<InviteLink>();
    public ICollection<Item> Items { get; set; } = new List<Item>();
}
```

**Plik:** `backend/SasiadMa.Api/Models/InviteLink.cs`

```csharp
namespace SasiadMa.Api.Models;

public class InviteLink
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public int CommunityId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Relationships
    public Community Community { get; set; } = null!;
}
```

**Pozostałe modele:** Item.cs, Booking.cs, Message.cs, Conversation.cs (utworzyć w odpowiednich fazach)

### 1.2 Backend - DbContext

**Plik:** `backend/SasiadMa.Api/Data/AppDbContext.cs`

```csharp
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SasiadMa.Api.Models;

namespace SasiadMa.Api.Data;

public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Community> Communities { get; set; }
    public DbSet<InviteLink> InviteLinks { get; set; }
    public DbSet<Item> Items { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Conversation> Conversations { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // User - Community (1 user = 1 community MVP constraint)
        builder.Entity<User>()
            .HasOne(u => u.Community)
            .WithMany(c => c.Members)
            .HasForeignKey(u => u.CommunityId)
            .OnDelete(DeleteBehavior.SetNull);

        // Community - Admin
        builder.Entity<Community>()
            .HasOne(c => c.Admin)
            .WithMany()
            .HasForeignKey(c => c.AdminId)
            .OnDelete(DeleteBehavior.Restrict);

        // InviteLink unique token
        builder.Entity<InviteLink>()
            .HasIndex(i => i.Token)
            .IsUnique();

        // TODO: Add Item, Booking, Message configurations in later phases
    }
}
```

### 1.3 Backend - Konfiguracja w Program.cs

**Plik:** `backend/SasiadMa.Api/Program.cs`

Dodać do istniejącego pliku:

```csharp
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SasiadMa.Api.Data;
using SasiadMa.Api.Models;
using SasiadMa.Api.Services;

var builder = WebApplication.CreateBuilder(args);

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

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IStorageService, StorageService>();

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

// TODO: Add endpoints in later phases

app.Run();
```

### 1.4 Backend - Migracja bazy danych

**Komendy:**

```bash
cd backend/SasiadMa.Api

# Utworzenie pierwszej migracji
dotnet ef migrations add InitialCreate

# Zastosowanie migracji do bazy
dotnet ef database update
```

**Weryfikacja:** Sprawdzić w Supabase Dashboard, czy tabele zostały utworzone.

### 1.5 Backend - Auth Service

**Plik:** `backend/SasiadMa.Api/Services/IAuthService.cs`

```csharp
using SasiadMa.Api.DTOs.Auth;

namespace SasiadMa.Api.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
}
```

**Plik:** `backend/SasiadMa.Api/Services/AuthService.cs`

Implementacja:
- Rejestracja z walidacją hasła (min. 8 znaków, 1 wielka, 1 mała, 1 cyfra)
- Logowanie z JWT token generation
- Refresh token logic (30 dni)
- Access token (1h)

### 1.6 Backend - Auth DTOs

**Plik:** `backend/SasiadMa.Api/DTOs/Auth/RegisterRequest.cs`

```csharp
using System.ComponentModel.DataAnnotations;

namespace SasiadMa.Api.DTOs.Auth;

public class RegisterRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required, MinLength(2), MaxLength(100)]
    public string PreferredName { get; set; } = string.Empty;

    [Required]
    public bool AcceptTerms { get; set; }

    public string? InviteToken { get; set; }
}
```

**Inne DTOs:** LoginRequest.cs, AuthResponse.cs

### 1.7 Backend - Auth Endpoints

**Plik:** `backend/SasiadMa.Api/Endpoints/AuthEndpoints.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using SasiadMa.Api.DTOs.Auth;
using SasiadMa.Api.Services;

namespace SasiadMa.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Authentication");

        group.MapPost("/register", async (
            [FromBody] RegisterRequest request,
            [FromServices] IAuthService authService) =>
        {
            var result = await authService.RegisterAsync(request);
            return Results.Ok(result);
        });

        group.MapPost("/login", async (
            [FromBody] LoginRequest request,
            [FromServices] IAuthService authService) =>
        {
            var result = await authService.LoginAsync(request);
            return Results.Ok(result);
        });

        group.MapPost("/refresh", async (
            [FromBody] RefreshTokenRequest request,
            [FromServices] IAuthService authService) =>
        {
            var result = await authService.RefreshTokenAsync(request.RefreshToken);
            return Results.Ok(result);
        });
    }
}
```

**W Program.cs dodać:** `app.MapAuthEndpoints();`

### 1.8 Frontend - Auth Context & Hooks

**Plik:** `frontend/src/hooks/useAuth.ts`

```typescript
import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  preferredName: string;
  communityId?: number;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, acceptTerms: boolean) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 1.9 Frontend - Login & Register Pages

**Plik:** `frontend/src/pages/LoginPage.tsx`

- Formularz z email + hasło
- Walidacja z react-hook-form + zod
- Komunikaty błędów
- Link do rejestracji

**Plik:** `frontend/src/pages/RegisterPage.tsx`

- Formularz: email, hasło, potwierdzenie hasła, imię
- Checkbox zgody na regulamin (wymagany)
- Walidacja hasła (min. 8 znaków, 1 wielka, 1 mała, 1 cyfra)
- Automatyczne dołączenie do społeczności jeśli invite token w URL

### 1.10 Frontend - Routing

**Plik:** `frontend/src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/invite/:token" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

### ✅ Kryteria akceptacji Fazy 1:

- [ ] Backend: Baza danych PostgreSQL skonfigurowana w Supabase
- [ ] Backend: Migracje EF Core zastosowane poprawnie
- [ ] Backend: POST /api/auth/register działa (zwraca JWT tokens)
- [ ] Backend: POST /api/auth/login działa (zwraca JWT tokens)
- [ ] Frontend: Strona rejestracji działa i waliduje hasło
- [ ] Frontend: Strona logowania działa
- [ ] Frontend: Access token zapisywany w localStorage/sessionStorage
- [ ] Frontend: Przekierowanie do dashboard po zalogowaniu
- [ ] Test: Zarejestrowani użytkownik może się zalogować

---

## Faza 2: Społeczności

**Szacowany czas:** 2-3 dni
**User Stories:** US-002, US-003, US-004
**Status:** ⏳ Do zrobienia

### 2.1 Backend - Community Endpoints

**Plik:** `backend/SasiadMa.Api/Endpoints/CommunityEndpoints.cs`

```csharp
public static class CommunityEndpoints
{
    public static void MapCommunityEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/communities")
            .RequireAuthorization()
            .WithTags("Communities");

        // POST /api/communities - Utworzenie społeczności (US-002)
        group.MapPost("/", async (
            [FromBody] CreateCommunityRequest request,
            [FromServices] ICommunityService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.CreateCommunityAsync(request, userId);
            return Results.Created($"/api/communities/{result.Id}", result);
        });

        // POST /api/communities/{id}/invite-link - Generowanie linku (US-003)
        group.MapPost("/{id}/invite-link", async (
            int id,
            [FromServices] ICommunityService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.GenerateInviteLinkAsync(id, userId);
            return Results.Ok(result);
        });

        // GET /api/communities/join/{token} - Dołączenie (US-004)
        group.MapPost("/join/{token}", async (
            string token,
            [FromServices] ICommunityService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.JoinCommunityAsync(token, userId);
            return Results.Ok(result);
        });

        // GET /api/communities/my - Pobierz moją społeczność
        group.MapGet("/my", async (
            [FromServices] ICommunityService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.GetMyCommunityAsync(userId);
            return result != null ? Results.Ok(result) : Results.NotFound();
        });
    }
}
```

### 2.2 Backend - Community Service

**Implementacja logiki:**

- Tworzenie społeczności (admin = założyciel)
- Generowanie unikalnego invite token (GUID)
- Walidacja: 1 użytkownik = 1 społeczność
- Dołączanie przez token
- Ograniczenie MVP: brak usuwania członków, brak opuszczania

### 2.3 Frontend - Create Community Page

**Plik:** `frontend/src/pages/CreateCommunityPage.tsx`

- Formularz: nazwa (max 100 znaków), opis (opcjonalny, max 300 znaków)
- Po utworzeniu → przekierowanie do Dashboard
- Komunikat sukcesu

### 2.4 Frontend - Invite Link Modal

**Komponent:** `frontend/src/components/community/InviteLinkModal.tsx`

- Przycisk "Wygeneruj link zaproszeniowy" (tylko dla admina)
- Modal z linkiem: `https://sasiad-ma.vercel.app/invite/{token}`
- Przycisk "Skopiuj link" (copy to clipboard)
- Informacja: "Link jest ważny bezterminowo"

### 2.5 Frontend - Join Community Flow

**Plik:** `frontend/src/pages/JoinCommunityPage.tsx`

- URL: `/invite/:token`
- Wyświetlenie nazwy społeczności: "Dołączasz do: [Nazwa]"
- Jeśli użytkownik niezalogowany → formularz rejestracji/logowania
- Jeśli zalogowany → automatyczne dołączenie
- Walidacja: czy użytkownik już należy do innej społeczności

### ✅ Kryteria akceptacji Fazy 2:

- [ ] Backend: POST /api/communities działa (tworzy społeczność)
- [ ] Backend: POST /api/communities/{id}/invite-link generuje token
- [ ] Backend: POST /api/communities/join/{token} dodaje użytkownika
- [ ] Frontend: Strona tworzenia społeczności działa
- [ ] Frontend: Modal z linkiem zaproszeniowym działa
- [ ] Frontend: Kopiowanie linku do schowka działa
- [ ] Frontend: Strona /invite/:token wyświetla nazwę społeczności
- [ ] Test: Użytkownik może utworzyć społeczność i zaprosić innego użytkownika

---

## Faza 3: Przedmioty

**Szacowany czas:** 3-4 dni
**User Stories:** US-005, US-006, US-007
**Status:** ⏳ Do zrobienia

### 3.1 Backend - Item Model

**Plik:** `backend/SasiadMa.Api/Models/Item.cs`

```csharp
namespace SasiadMa.Api.Models;

public class Item
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public ItemStatus Status { get; set; } = ItemStatus.Available;

    public string OwnerId { get; set; } = string.Empty;
    public int CommunityId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Relationships
    public User Owner { get; set; } = null!;
    public Community Community { get; set; } = null!;
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

public enum ItemStatus
{
    Available,
    Borrowed,
    Unavailable
}
```

**Aktualizacja DbContext:** Dodać konfigurację Item w `OnModelCreating`

**Migracja:**

```bash
dotnet ef migrations add AddItems
dotnet ef database update
```

### 3.2 Backend - Storage Service (Supabase)

**Plik:** `backend/SasiadMa.Api/Services/IStorageService.cs`

```csharp
namespace SasiadMa.Api.Services;

public interface IStorageService
{
    Task<string> UploadItemPhotoAsync(IFormFile file, string itemId);
    Task<string> UploadAvatarAsync(IFormFile file, string userId);
    Task DeleteFileAsync(string bucket, string fileName);
}
```

**Implementacja:**

- Upload do Supabase Storage (bucket: `items-photos`, `avatars`)
- Walidacja: tylko JPG/PNG, max 5MB
- Zwrócenie public URL zdjęcia

### 3.3 Backend - Item Endpoints

**Plik:** `backend/SasiadMa.Api/Endpoints/ItemEndpoints.cs`

```csharp
public static class ItemEndpoints
{
    public static void MapItemEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/items")
            .RequireAuthorization()
            .WithTags("Items");

        // POST /api/items - Dodanie przedmiotu (US-005)
        group.MapPost("/", async (
            [FromForm] CreateItemRequest request,
            [FromServices] IItemService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.CreateItemAsync(request, userId);
            return Results.Created($"/api/items/{result.Id}", result);
        }).DisableAntiforgery(); // Dla form-data z plikiem

        // GET /api/items - Lista przedmiotów w społeczności (US-006)
        group.MapGet("/", async (
            [FromServices] IItemService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.GetCommunityItemsAsync(userId);
            return Results.Ok(result);
        });

        // GET /api/items/{id} - Szczegóły przedmiotu (US-007)
        group.MapGet("/{id}", async (
            int id,
            [FromServices] IItemService service) =>
        {
            var result = await service.GetItemByIdAsync(id);
            return result != null ? Results.Ok(result) : Results.NotFound();
        });

        // PATCH /api/items/{id}/status - Zmiana statusu (dostępny/niedostępny)
        group.MapPatch("/{id}/status", async (
            int id,
            [FromBody] UpdateItemStatusRequest request,
            [FromServices] IItemService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.UpdateItemStatusAsync(id, request.Status, userId);
            return Results.Ok(result);
        });

        // GET /api/items/my - Moje przedmioty
        group.MapGet("/my", async (
            [FromServices] IItemService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.GetMyItemsAsync(userId);
            return Results.Ok(result);
        });
    }
}
```

### 3.4 Frontend - Add Item Page

**Plik:** `frontend/src/pages/AddItemPage.tsx`

**Formularz:**

- Nazwa (wymagana, max 100 znaków)
- Kategoria (select, lista z PRD)
- Zdjęcie (opcjonalne, max 1, max 5MB, JPG/PNG)
- Preview zdjęcia przed uploadem
- Opis (wymagany, max 300 znaków)

**Walidacja:**

```typescript
const itemSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['Narzędzia ogrodowe', 'Narzędzia budowlane', ...]),
  description: z.string().min(1).max(300),
  photo: z.instanceof(File).optional()
});
```

### 3.5 Frontend - Items List Page

**Plik:** `frontend/src/pages/ItemsPage.tsx`

**Wyświetlenie:**

- Grid/karty przedmiotów (CSS Grid, responsive)
- Każda karta:
  - Zdjęcie lub placeholder
  - Nazwa
  - Kategoria (badge)
  - Imię właściciela
  - Status (badge: Dostępny 🟢 / Wypożyczony 🟡 / Niedostępny 🔴)
- Sortowanie: najnowsze (domyślne, bez opcji zmiany)
- Bez filtrowania, bez stronicowania (jedna strona)
- Kliknięcie → szczegóły przedmiotu

### 3.6 Frontend - Item Details Page

**Plik:** `frontend/src/pages/ItemDetailsPage.tsx`

**Wyświetlenie:**

- Zdjęcie (pełny rozmiar)
- Nazwa, kategoria, opis
- Profil właściciela: awatar + imię (link do profilu)
- Status przedmiotu
- Przycisk "Rezerwuj" (jeśli status: Dostępny, tylko dla nie-właścicieli)
- Jeśli status: Wypożyczony/Niedostępny → komunikat "Obecnie niedostępny"
- Dla właściciela: przycisk "Oznacz jako niedostępny/dostępny"

### ✅ Kryteria akceptacji Fazy 3:

- [ ] Backend: POST /api/items działa (z uploadem zdjęcia)
- [ ] Backend: GET /api/items zwraca listę przedmiotów społeczności
- [ ] Backend: GET /api/items/{id} zwraca szczegóły
- [ ] Backend: Upload zdjęcia do Supabase Storage działa
- [ ] Frontend: Formularz dodawania przedmiotu działa
- [ ] Frontend: Preview zdjęcia przed uploadem działa
- [ ] Frontend: Lista przedmiotów wyświetla się poprawnie (grid)
- [ ] Frontend: Strona szczegółów przedmiotu wyświetla wszystkie dane
- [ ] Frontend: Właściciel może zmienić status na niedostępny/dostępny
- [ ] Test: Użytkownik może dodać przedmiot ze zdjęciem i zobaczyć go w liście

---

## Faza 4: Rezerwacje i wypożyczenia

**Szacowany czas:** 4-5 dni
**User Stories:** US-008, US-009, US-010
**Status:** ⏳ Do zrobienia

### 4.1 Backend - Booking Model

**Plik:** `backend/SasiadMa.Api/Models/Booking.cs`

```csharp
namespace SasiadMa.Api.Models;

public class Booking
{
    public int Id { get; set; }
    public int ItemId { get; set; }
    public string BorrowerId { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;

    public DateTime RequestedFrom { get; set; }
    public DateTime RequestedTo { get; set; }
    public string? BorrowerNote { get; set; }
    public string? RejectionReason { get; set; }

    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    public DateTime? HandedOverAt { get; set; }
    public DateTime? ReturnedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Relationships
    public Item Item { get; set; } = null!;
    public User Borrower { get; set; } = null!;
    public User Owner { get; set; } = null!;
}

public enum BookingStatus
{
    Pending,      // Oczekujące
    Approved,     // Zatwierdzone
    Rejected,     // Odrzucone
    InProgress,   // W trakcie
    Returned      // Zwrócone
}
```

**Migracja:**

```bash
dotnet ef migrations add AddBookings
dotnet ef database update
```

### 4.2 Backend - Booking Endpoints

**Plik:** `backend/SasiadMa.Api/Endpoints/BookingEndpoints.cs`

```csharp
public static class BookingEndpoints
{
    public static void MapBookingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/bookings")
            .RequireAuthorization()
            .WithTags("Bookings");

        // POST /api/bookings - Rezerwacja przedmiotu (US-008)
        group.MapPost("/", async (
            [FromBody] CreateBookingRequest request,
            [FromServices] IBookingService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.CreateBookingAsync(request, userId);
            return Results.Created($"/api/bookings/{result.Id}", result);
        });

        // GET /api/bookings/my - Moje wypożyczenia (jako wypożyczający)
        group.MapGet("/my", async (
            [FromServices] IBookingService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.GetMyBookingsAsync(userId);
            return Results.Ok(result);
        });

        // GET /api/bookings/my-items - Prośby o moje przedmioty (jako właściciel)
        group.MapGet("/my-items", async (
            [FromServices] IBookingService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.GetBookingsForMyItemsAsync(userId);
            return Results.Ok(result);
        });

        // PATCH /api/bookings/{id}/approve - Akceptacja prośby (US-009)
        group.MapPatch("/{id}/approve", async (
            int id,
            [FromServices] IBookingService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.ApproveBookingAsync(id, userId);
            return Results.Ok(result);
        });

        // PATCH /api/bookings/{id}/reject - Odrzucenie prośby (US-009)
        group.MapPatch("/{id}/reject", async (
            int id,
            [FromBody] RejectBookingRequest request,
            [FromServices] IBookingService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.RejectBookingAsync(id, request.Reason, userId);
            return Results.Ok(result);
        });

        // PATCH /api/bookings/{id}/hand-over - Potwierdzenie przekazania (US-010)
        group.MapPatch("/{id}/hand-over", async (
            int id,
            [FromServices] IBookingService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.ConfirmHandOverAsync(id, userId);
            return Results.Ok(result);
        });

        // PATCH /api/bookings/{id}/return - Potwierdzenie zwrotu (US-010)
        group.MapPatch("/{id}/return", async (
            int id,
            [FromServices] IBookingService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.ConfirmReturnAsync(id, userId);
            return Results.Ok(result);
        });
    }
}
```

### 4.3 Backend - Booking Service

**Logika:**

- Walidacja dat (od < do, max 14 dni)
- **Brak walidacji kolizji dat** (właściciel sam sprawdzi - wymaganie MVP)
- Zmiana statusu przedmiotu przy przekazaniu/zwrocie
- Status flow:
  - `Pending` → `Approved` (akceptacja) lub `Rejected` (odrzucenie)
  - `Approved` → `InProgress` (przekazanie)
  - `InProgress` → `Returned` (zwrot, przedmiot → `Available`)

### 4.4 Frontend - Booking Modal (Item Details)

**Komponent:** `frontend/src/components/bookings/BookingModal.tsx`

**Formularz rezerwacji:**

- Data od (kalendarz, min: dzisiaj)
- Data do (kalendarz, max: data od + 14 dni)
- Notatka dla właściciela (textarea, opcjonalna, max 200 znaków)
- Przycisk "Wyślij prośbę"

**Walidacja:**

```typescript
const bookingSchema = z.object({
  dateFrom: z.date().min(new Date()),
  dateTo: z.date(),
  note: z.string().max(200).optional()
}).refine(data => data.dateTo > data.dateFrom, {
  message: "Data zwrotu musi być późniejsza niż data odbioru"
});
```

### 4.5 Frontend - My Bookings Page

**Plik:** `frontend/src/pages/MyBookingsPage.tsx`

**Sekcja: "Moje wypożyczenia" (jako wypożyczający)**

Lista rezerwacji z:
- Zdjęcie przedmiotu + nazwa
- Data od - do
- Status (badge z kolorami)
- Imię właściciela
- Akcje zależne od statusu:
  - Pending → "Czekam na odpowiedź"
  - Approved → "Zatwierdzone! Umów szczegóły" + przycisk "Wyślij wiadomość"
  - InProgress → "W trakcie wypożyczenia"
  - Returned → "Zwrócone ✅"
  - Rejected → "Odrzucone" + powód (jeśli podany)

### 4.6 Frontend - My Items Requests Page

**Plik:** `frontend/src/pages/MyItemsRequestsPage.tsx`

**Sekcja: "Prośby oczekujące" (jako właściciel)**

Lista próśb:
- Przedmiot (zdjęcie + nazwa)
- Kto prosi (imię, link do profilu)
- Daty (od - do)
- Notatka od wypożyczającego
- Przyciski: "Akceptuj" / "Odrzuć"

**Modal odrzucenia:**

- Pole "Powód odrzucenia" (textarea, opcjonalny, max 200 znaków)
- Przycisk "Potwierdź odrzucenie"

**Sekcja: "Zatwierdzone rezerwacje"**

Lista zatwierdzonych rezerwacji:
- Przedmiot + wypożyczający
- Daty
- Przycisk "Potwierdź przekazanie" (dla statusu `Approved`)
- Modal potwierdzenia: "Czy na pewno przekazałeś przedmiot?"

**Sekcja: "W trakcie wypożyczenia"**

Lista aktywnych wypożyczeń:
- Przedmiot + kto wypożyczył
- Data od - do
- Przycisk "Potwierdź zwrot" (dla statusu `InProgress`)
- Modal potwierdzenia: "Czy przedmiot został zwrócony?"

### ✅ Kryteria akceptacji Fazy 4:

- [ ] Backend: POST /api/bookings działa (tworzy rezerwację)
- [ ] Backend: PATCH /api/bookings/{id}/approve zmienia status na Approved
- [ ] Backend: PATCH /api/bookings/{id}/reject zmienia status na Rejected
- [ ] Backend: PATCH /api/bookings/{id}/hand-over zmienia status na InProgress
- [ ] Backend: PATCH /api/bookings/{id}/return zmienia status na Returned
- [ ] Backend: Status przedmiotu zmienia się na Borrowed przy przekazaniu
- [ ] Backend: Status przedmiotu wraca do Available przy zwrocie
- [ ] Frontend: Modal rezerwacji działa (data od/do, notatka)
- [ ] Frontend: Strona "Moje wypożyczenia" wyświetla rezerwacje
- [ ] Frontend: Strona "Prośby o moje przedmioty" wyświetla prośby
- [ ] Frontend: Właściciel może zaakceptować/odrzucić prośbę
- [ ] Frontend: Właściciel może potwierdzić przekazanie
- [ ] Frontend: Właściciel może potwierdzić zwrot
- [ ] Test: Pełny flow: rezerwacja → akceptacja → przekazanie → zwrot

---

## Faza 5: Komunikacja

**Szacowany czas:** 3-4 dni
**User Stories:** US-011
**Status:** ⏳ Do zrobienia

### 5.1 Backend - Message & Conversation Models

**Plik:** `backend/SasiadMa.Api/Models/Conversation.cs`

```csharp
namespace SasiadMa.Api.Models;

public class Conversation
{
    public int Id { get; set; }
    public string User1Id { get; set; } = string.Empty;
    public string User2Id { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Relationships
    public User User1 { get; set; } = null!;
    public User User2 { get; set; } = null!;
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
```

**Plik:** `backend/SasiadMa.Api/Models/Message.cs`

```csharp
namespace SasiadMa.Api.Models;

public class Message
{
    public int Id { get; set; }
    public int ConversationId { get; set; }
    public string SenderId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    // Relationships
    public Conversation Conversation { get; set; } = null!;
    public User Sender { get; set; } = null!;
}
```

**Migracja:**

```bash
dotnet ef migrations add AddMessages
dotnet ef database update
```

### 5.2 Backend - Message Endpoints

**Plik:** `backend/SasiadMa.Api/Endpoints/MessageEndpoints.cs`

```csharp
public static class MessageEndpoints
{
    public static void MapMessageEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/messages")
            .RequireAuthorization()
            .WithTags("Messages");

        // GET /api/messages/conversations - Lista konwersacji
        group.MapGet("/conversations", async (
            [FromServices] IMessageService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.GetMyConversationsAsync(userId);
            return Results.Ok(result);
        });

        // GET /api/messages/conversations/{userId} - Konwersacja z konkretnym użytkownikiem
        group.MapGet("/conversations/{otherUserId}", async (
            string otherUserId,
            [FromServices] IMessageService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.GetConversationWithUserAsync(userId, otherUserId);
            return Results.Ok(result);
        });

        // POST /api/messages - Wyślij wiadomość
        group.MapPost("/", async (
            [FromBody] SendMessageRequest request,
            [FromServices] IMessageService service,
            ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await service.SendMessageAsync(request, userId);
            return Results.Created($"/api/messages/{result.Id}", result);
        });
    }
}
```

### 5.3 Backend - Message Service

**Logika:**

- Tworzenie konwersacji automatycznie jeśli nie istnieje (1-1 między dwoma użytkownikami)
- Walidacja: max 1000 znaków wiadomości
- Sortowanie wiadomości chronologicznie (najstarsze u góry)
- Lista konwersacji: ostatnia wiadomość + czas

### 5.4 Frontend - Messages Page

**Plik:** `frontend/src/pages/MessagesPage.tsx`

**Layout:**

- Sidebar (lewa strona, 30%):
  - Lista konwersacji
  - Każda konwersacja: awatar, imię, fragment ostatniej wiadomości, czas
  - Kliknięcie → otwiera czat
- Chat window (prawa strona, 70%):
  - Historia czatu (scrollable, najstarsze u góry)
  - Formularz: textarea (max 1000 znaków) + przycisk "Wyślij"

**Komponent:** `frontend/src/components/messages/ConversationList.tsx`

**Komponent:** `frontend/src/components/messages/ChatWindow.tsx`

### 5.5 Frontend - Start Conversation

**Trigger:** Przycisk "Wyślij wiadomość" w:
- Profilu użytkownika
- Szczegółach przedmiotu (kontakt z właścicielem)
- Po zaakceptowaniu rezerwacji

**Akcja:** Przekierowanie do `/messages?userId={otherUserId}`

### ✅ Kryteria akceptacji Fazy 5:

- [ ] Backend: GET /api/messages/conversations zwraca listę konwersacji
- [ ] Backend: GET /api/messages/conversations/{userId} zwraca historię czatu
- [ ] Backend: POST /api/messages wysyła wiadomość
- [ ] Backend: Konwersacja tworzy się automatycznie przy pierwszej wiadomości
- [ ] Frontend: Strona wiadomości wyświetla listę konwersacji
- [ ] Frontend: Czat wyświetla historię wiadomości chronologicznie
- [ ] Frontend: Formularz wysyłania wiadomości działa
- [ ] Frontend: Przycisk "Wyślij wiadomość" otwiera czat z właścicielem
- [ ] Test: Dwóch użytkowników może wymienić wiadomości

---

## Faza 6: Email Notifications

**Szacowany czas:** 2-3 dni
**Zależności:** Wszystkie poprzednie fazy
**Status:** ⏳ Do zrobienia

### 6.1 Backend - Email Service Implementation

**Plik:** `backend/SasiadMa.Api/Services/EmailService.cs`

**Implementacja przy użyciu SendGrid:**

```csharp
using SendGrid;
using SendGrid.Helpers.Mail;

namespace SasiadMa.Api.Services;

public class EmailService : IEmailService
{
    private readonly SendGridClient _client;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly string _frontendUrl;

    public EmailService(IConfiguration config)
    {
        _client = new SendGridClient(config["SendGrid:ApiKey"]);
        _fromEmail = config["SendGrid:FromEmail"]!;
        _fromName = config["SendGrid:FromName"]!;
        _frontendUrl = config["FrontendUrl"]!;
    }

    public async Task SendNewBookingRequestEmailAsync(string ownerEmail, string ownerName, string itemName, string borrowerName)
    {
        var subject = $"Nowa prośba o wypożyczenie: {itemName}";
        var htmlContent = $@"
            <h2>Cześć {ownerName}!</h2>
            <p><strong>{borrowerName}</strong> prosi o wypożyczenie: <strong>{itemName}</strong></p>
            <p><a href=""{_frontendUrl}/my-items"">Sprawdź prośbę</a></p>
        ";

        await SendEmailAsync(ownerEmail, subject, htmlContent);
    }

    // Pozostałe metody: SendBookingApprovedEmail, SendBookingRejectedEmail, SendNewMessageEmail
}
```

### 6.2 Email Templates (HTML)

**4 typy emaili (wymagania PRD):**

1. **Nowa prośba o wypożyczenie** (→ właściciel)
   - Temat: "Nowa prośba o wypożyczenie: [przedmiot]"
   - Treść: Kto prosi, przedmiot, link do panelu

2. **Akceptacja prośby** (→ wypożyczający)
   - Temat: "[Imię] zaakceptował/a Twoją prośbę!"
   - Treść: Przedmiot, link do czatu

3. **Odrzucenie prośby** (→ wypożyczający)
   - Temat: "Prośba o [przedmiot] została odrzucona"
   - Treść: Powód (jeśli podany), link do listy przedmiotów

4. **Nowa wiadomość w czacie** (→ odbiorca)
   - Temat: "Nowa wiadomość od [Imię]"
   - Treść: Fragment wiadomości, link do czatu
   - **Z opcją wyłączenia w profilu**

### 6.3 Backend - Wywołania EmailService

**W BookingService:**

- Po utworzeniu rezerwacji → `SendNewBookingRequestEmailAsync`
- Po zaakceptowaniu → `SendBookingApprovedEmailAsync`
- Po odrzuceniu → `SendBookingRejectedEmailAsync`

**W MessageService:**

- Po wysłaniu wiadomości → `SendNewMessageEmailAsync` (jeśli odbiorca ma włączone powiadomienia)

### 6.4 Frontend - User Profile Settings

**Plik:** `frontend/src/pages/ProfilePage.tsx`

**Sekcja: Ustawienia powiadomień**

- Checkbox: "Otrzymuj powiadomienia email o nowych wiadomościach" (domyślnie: true)

### 6.5 Testowanie emaili

**SendGrid Sandbox Mode:**

- Konfiguracja dla development: wysyłanie emaili tylko do zweryfikowanych adresów
- Test: Sprawdzić czy wszystkie 4 typy emaili działają

### ✅ Kryteria akceptacji Fazy 6:

- [ ] Backend: EmailService zintegrowany z SendGrid
- [ ] Backend: Email wysyłany po nowej rezerwacji
- [ ] Backend: Email wysyłany po akceptacji rezerwacji
- [ ] Backend: Email wysyłany po odrzuceniu rezerwacji
- [ ] Backend: Email wysyłany po nowej wiadomości (jeśli włączone)
- [ ] Frontend: Profil użytkownika ma opcję wyłączenia emaili o wiadomościach
- [ ] Test: Wszystkie 4 typy emaili docierają poprawnie
- [ ] Test: Linki w emailach prowadzą do odpowiednich stron

---

## Faza 7: Testy i Deployment

**Szacowany czas:** 3-5 dni
**Status:** ⏳ Do zrobienia

### 7.1 Backend - Unit Tests

**Projekt testowy:**

```bash
cd backend
dotnet new xunit -n SasiadMa.UnitTests
cd SasiadMa.UnitTests
dotnet add reference ../SasiadMa.Api/SasiadMa.Api.csproj
dotnet add package Moq
dotnet add package FluentAssertions
```

**Przykładowe testy:**

- `AuthServiceTests.cs` - testy logiki JWT, rejestracji, logowania
- `BookingServiceTests.cs` - walidacja dat, zmiana statusów
- `MessageServiceTests.cs` - tworzenie konwersacji

**Target coverage:** >70%

### 7.2 Backend - Integration Tests

**Projekt testowy:**

```bash
dotnet new xunit -n SasiadMa.IntegrationTests
cd SasiadMa.IntegrationTests
dotnet add package Microsoft.AspNetCore.Mvc.Testing
```

**Testy API endpoints:**

- `AuthEndpointsTests.cs` - POST /api/auth/register, /login
- `ItemEndpointsTests.cs` - CRUD przedmiotów
- `BookingEndpointsTests.cs` - flow rezerwacji

**WebApplicationFactory** dla testów integracyjnych

### 7.3 Frontend - Unit Tests

**Konfiguracja Vitest:**

```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Przykładowe testy:**

- `LoginPage.test.tsx` - walidacja formularza
- `useAuth.test.ts` - custom hook
- `ItemCard.test.tsx` - komponent karty przedmiotu

**Target coverage:** >60%

### 7.4 Docker - Production Dockerfile

**Plik:** `backend/Dockerfile`

Zoptymalizowany Dockerfile (multi-stage build) zgodny z tech-stack.md

**Plik:** `docker-compose.yml`

Aktualizacja dla produkcji (jeśli potrzebne dla lokalnych testów)

### 7.5 GitHub Actions - CI/CD

**Plik:** `.github/workflows/backend-ci-cd.yml`

Workflow zgodny z tech-stack.md:
- Test job: restore, build, unit tests, integration tests, code coverage
- Build & Deploy job: Docker build, push to ghcr.io, deploy to Azure

**Plik:** `.github/workflows/frontend-ci-cd.yml`

Workflow:
- Test job: install, lint, type-check, tests, build
- Deploy job: deploy to Vercel

### 7.6 Azure App Service Setup

**Zadania:**

1. Utworzyć Azure App Service (Free Tier F1)
2. Skonfigurować Environment Variables (appsettings)
3. Pobrać Publish Profile
4. Dodać `AZURE_WEBAPP_PUBLISH_PROFILE` do GitHub Secrets

### 7.7 Vercel Setup

**Zadania:**

1. Importować projekt z GitHub
2. Skonfigurować Environment Variables (.env)
3. Pobrać tokeny
4. Dodać do GitHub Secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

### 7.8 Polityka prywatności i Regulamin

**Plik:** `frontend/src/pages/PrivacyPolicyPage.tsx`

- Szablon zgodny z RODO
- Link w stopce

**Plik:** `frontend/src/pages/TermsPage.tsx`

- Szablon regulaminu
- Link w stopce

### 7.9 Manual Testing - Full Flow

**Scenariusz testowy:**

1. Rejestracja użytkownika A
2. Utworzenie społeczności
3. Wygenerowanie linku zaproszeniowego
4. Rejestracja użytkownika B przez link
5. Użytkownik A dodaje przedmiot ze zdjęciem
6. Użytkownik B rezerwuje przedmiot
7. Użytkownik A akceptuje rezerwację
8. Wymiana wiadomości w czacie
9. Użytkownik A potwierdza przekazanie
10. Użytkownik A potwierdza zwrot
11. Weryfikacja emaili na każdym etapie

### 7.10 Production Deployment

**Kroki:**

1. Merge do `main` branch
2. GitHub Actions uruchamia CI/CD
3. Backend deploy do Azure
4. Frontend deploy do Vercel
5. Weryfikacja healthcheck: `https://sasiad-ma-api.azurewebsites.net/api/health`
6. Weryfikacja frontend: `https://sasiad-ma.vercel.app`

### ✅ Kryteria akceptacji Fazy 7:

- [ ] Backend: >70% code coverage testów
- [ ] Frontend: >60% code coverage testów
- [ ] CI/CD: Pipeline uruchamia testy automatycznie
- [ ] CI/CD: Deploy do Azure działa automatycznie (main branch)
- [ ] CI/CD: Deploy do Vercel działa automatycznie (main branch)
- [ ] Production: Backend działa na Azure (health check OK)
- [ ] Production: Frontend działa na Vercel
- [ ] Production: CORS skonfigurowany poprawnie
- [ ] Production: Baza danych Supabase połączona
- [ ] Production: Upload zdjęć do Supabase Storage działa
- [ ] Production: Emaile SendGrid wysyłane poprawnie
- [ ] Manual Test: Pełny flow działa end-to-end
- [ ] RODO: Polityka prywatności i regulamin dostępne

---

## Metryki sukcesu

### Definition of Done (DoD) dla Micro-MVP:

- [x] Wszystkie 10 user stories zaimplementowane
- [x] Aplikacja wdrożona na produkcję (Azure + Vercel)
- [x] Co najmniej **1 działająca społeczność** z **3+ członkami**
- [x] Co najmniej **3 przedmioty** dodane
- [x] Co najmniej **1 udana transakcja** (prośba → akceptacja → przekazanie → zwrot)
- [x] Działające powiadomienia email (4 typy)
- [x] Responsywny interfejs mobilny (podstawowy)
- [x] Zgodność z RODO (polityka prywatności, regulamin)

### Metryki walidacji (pierwsze 2 tygodnie testów):

**Cel minimalny (SUKCES):**

- 5+ zarejestrowanych użytkowników
- 5+ przedmiotów dodanych
- 3+ próśb o wypożyczenie
- 2+ zaakceptowanych rezerwacji
- 1+ fizyczne przekazanie przedmiotu (status: "W trakcie")
- 1+ zwrot przedmiotu (status: "Zwrócone")

**Pytania walidacyjne:**

1. Czy użytkownicy dodają przedmioty? (min. 1 przedmiot/użytkownik)
2. Czy rezerwują przedmioty innych? (min. 50% użytkowników)
3. Czy właściciele akceptują prośby? (min. 50% próśb)
4. Czy dochodzi do fizycznego wypożyczenia? (min. 1 przekazanie)
5. Czy przedmioty są zwracane? (min. 1 zwrot)

**Jeśli TAK → rozwijamy dalej**
**Jeśli NIE → pivot lub stop**

---

## Harmonogram i priorytety

### Priorytet krytyczny (MUST HAVE):

- Faza 0: Przygotowanie środowiska
- Faza 1: Autentykacja (US-001)
- Faza 2: Społeczności (US-002, US-003, US-004)
- Faza 3: Przedmioty (US-005, US-006, US-007)
- Faza 4: Rezerwacje (US-008, US-009, US-010)

### Priorytet wysoki (SHOULD HAVE):

- Faza 5: Komunikacja (US-011)
- Faza 6: Email notifications

### Priorytet opcjonalny (NICE TO HAVE):

- Faza 7: Testy automatyczne (możliwe manualnie)
- E2E testy (Playwright)

### Szacowany timeline:

| Faza | Czas | Dni kumulatywnie |
|------|------|------------------|
| Faza 0 | 1-2 dni | Dzień 1-2 |
| Faza 1 | 3-4 dni | Dzień 3-6 |
| Faza 2 | 2-3 dni | Dzień 7-9 |
| Faza 3 | 3-4 dni | Dzień 10-13 |
| Faza 4 | 4-5 dni | Dzień 14-18 |
| Faza 5 | 3-4 dni | Dzień 19-22 |
| Faza 6 | 2-3 dni | Dzień 23-25 |
| Faza 7 | 3-5 dni | Dzień 26-30 |

**TOTAL: ~20-30 dni (3-4 tygodnie)**

---

## Ryzyka i mitygacje

| Ryzyko | Mitygacja |
|--------|-----------|
| Azure Free Tier limit (60 CPU min/day) | Monitoring użycia, plan B: Vercel serverless functions |
| Supabase Storage limit (1GB) | Max 1 zdjęcie/przedmiot, kompresja zdjęć |
| SendGrid limit (100 emails/day) | Start z małą grupą (5-10 użytkowników) |
| Brak doświadczenia z .NET/React | Tech stack dobrze udokumentowany, dużo tutoriali |
| Opóźnienia w implementacji | Priorytetyzacja: core features first (Faza 1-4) |

---

## Koniec planu implementacji

**Wersja:** 0.1
**Data:** 2026-01-10
**Status:** ✅ Gotowy do implementacji

**Następne kroki:**
1. Review planu z zespołem
2. Setup środowiska (Supabase, SendGrid, Azure, Vercel)
3. Start implementacji od Fazy 0

**Pytania? Komentarze?**
Zaktualizować plan w razie potrzeby przed rozpoczęciem implementacji.
