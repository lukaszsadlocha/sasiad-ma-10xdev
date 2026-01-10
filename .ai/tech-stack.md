# Stos Technologiczny - Sąsiad-Ma
## Micro-MVP

## 1. Przegląd

Aplikacja Sąsiad-Ma jest zbudowana jako nowoczesna aplikacja webowa (SPA) z oddzielonym frontendem i backendem, konteneryzowana przy użyciu Docker, z pełnym CI/CD pipeline.

**Architektura:**
- Frontend: Single Page Application (React)
- Backend: RESTful API (.NET 8)
- Database: PostgreSQL (relacyjna)
- Storage: Supabase Storage (dla zdjęć)
- Hosting: Azure App Service (Free Tier) + Vercel
- Deployment: Docker + GitHub Actions CI/CD

---

## 2. Frontend

### 2.1 Core Technologies

**React 18**
- Framework UI
- Wersja: 18.x (najnowsza stabilna)
- Hooks API (functional components)
- Justyfikacja: Najpopularniejszy framework, duża społeczność, doskonała dokumentacja

**TypeScript**
- Wersja: 5.x
- Strict mode enabled
- Justyfikacja: Type safety, lepsze DX, mniej błędów w runtime

**Vite**
- Build tool + dev server
- Wersja: 5.x
- Justyfikacja: Szybki HMR, prostsza konfiguracja niż Webpack

### 2.2 UI Framework

**shadcn/ui**
- Komponenty UI (nie library, ale komponenty do skopiowania)
- Bazuje na Radix UI (headless components)
- Justyfikacja: Customizowalne, accessible, nowoczesne
- Komponenty używane w MVP:
  - Button
  - Input, Textarea
  - Form (react-hook-form integration)
  - Card
  - Dialog (modals)
  - Select, Checkbox
  - Avatar
  - Badge
  - Toast (powiadomienia)

**Tailwind CSS**
- Wersja: 3.x
- Utility-first CSS framework
- Justyfikacja: Szybki development, mały bundle size, doskonała responsywność

### 2.3 Dodatkowe biblioteki

**React Router**
- Wersja: 6.x
- Routing po stronie klienta
- Routes: ~10-12 stron

**React Hook Form**
- Zarządzanie formularzami
- Justyfikacja: Lekki, wydajny, integracja z Zod

**Zod**
- Walidacja schematów
- Justyfikacja: Type-safe validation, integracja z TypeScript

**Fetch API (native)**
- HTTP client do API calls
- Built-in w przeglądarce, wystarczający dla MVP
- Wrapper helper functions dla token refresh

**date-fns**
- Operacje na datach (kalendarz, formatowanie)
- Justyfikacja: Lżejszy niż Moment.js, tree-shakeable

---

## 3. Backend

### 3.1 Core Technologies

**.NET 8**
- Framework: ASP.NET Core
- Wersja: 8.0 (LTS)
- Architektura: Minimal API
- Justyfikacja: Wysoka wydajność, nowoczesny, doskonałe tooling, darmowy hosting (Azure)

**C# 12**
- Język programowania
- Nowoczesne features (records, pattern matching, null-safety)

### 3.2 Architektura Backend

**Minimal API**
- Lekkie endpoints bez kontrollerów
- Justyfikacja: Mniej boilerplate, szybszy start dla MVP
- Struktura:
  ```
  /api/auth/*         - Authentication
  /api/communities/*  - Społeczności
  /api/items/*        - Przedmioty
  /api/bookings/*     - Rezerwacje
  /api/messages/*     - Czat
  /api/users/*        - Profile
  ```

**Entity Framework Core 8**
- ORM (Object-Relational Mapping)
- Code-First approach
- Migrations dla wersjonowania schematu
- Justyfikacja: Natywna integracja z .NET, LINQ queries, automatyczne migracje

### 3.3 Authentication & Authorization

**ASP.NET Identity**
- System zarządzania użytkownikami (built-in)
- Hash passwords (PBKDF2)
- User management

**JWT Bearer Tokens**
- Access Token: 1 godzina (krótki)
- Refresh Token: 30 dni (httpOnly cookie)
- Biblioteka: `Microsoft.AspNetCore.Authentication.JwtBearer`

### 3.4 Dodatkowe biblioteki

**Npgsql.EntityFrameworkCore.PostgreSQL**
- Provider EF Core dla PostgreSQL
- Wymagany do połączenia z bazą

---

## 4. Database

**PostgreSQL 15+**
- Relacyjna baza danych
- Wersja: 15 lub 16 (najnowsza stabilna)
- Hosting: **Supabase** (free tier: 500MB, 2 CPU cores, 1GB RAM)
- Justyfikacja: Open-source, wydajny, doskonałe wsparcie dla JSON (jeśli potrzebne), darmowy hosting

**Schema Design:**
- Tabele:
  - Users
  - Communities
  - InviteLinks
  - Items
  - Bookings
  - Messages
  - Conversations
- Indeksy na foreign keys
- Constraints (unique, check)

---

## 5. Storage

**Supabase Storage**
- Object storage dla zdjęć przedmiotów i avatarów
- Free tier: 1GB storage, 2GB bandwidth/miesiąc
- Justyfikacja: Darmowy, prosty API, CDN built-in, integracja z PostgreSQL
- Struktura buckets:
  - `items-photos` - zdjęcia przedmiotów
  - `avatars` - avatary użytkowników
- Security: Row Level Security (RLS) dla kontroli dostępu

---

## 6. Email

**SendGrid**
- Free tier: 100 emails/dzień (wystarczające dla MVP: 4 typy emaili × 5-10 użytkowników)
- Justyfikacja: Prosty API, darmowy, reliable, doskonała dokumentacja
- .NET: `SendGrid` NuGet package
- Template: Prosty string interpolation dla MVP (HTML emails)

---

## 7. Konteneryzacja (Docker)

### 7.1 Backend Container

**Dockerfile (Backend)**
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["SasiadMa.Api/SasiadMa.Api.csproj", "SasiadMa.Api/"]
RUN dotnet restore "SasiadMa.Api/SasiadMa.Api.csproj"
COPY . .
WORKDIR "/src/SasiadMa.Api"
RUN dotnet build "SasiadMa.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SasiadMa.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SasiadMa.Api.dll"]
```

**Justyfikacja:**
- Consistent environment (dev = production)
- Łatwy deploy do Azure App Service (obsługuje Docker containers)
- Izolacja zależności
- Powtarzalne buildy

### 7.2 Docker Compose (Development)

**docker-compose.yml**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: sasiadma_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/sasiadma_dev
      - ASPNETCORE_ENVIRONMENT=Development
    ports:
      - "5000:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

**Użycie:**
- Development: `docker-compose up`
- Lokalna baza PostgreSQL (nie trzeba instalować na systemie)
- Backend w kontenerze

---

## 8. Testing

### 8.1 Backend Tests (.NET)

**xUnit**
- Framework do testów jednostkowych i integracyjnych
- Wersja: najnowsza stabilna
- Justyfikacja: Standard dla .NET, doskonała integracja z Rider/VSCode

**Struktura testów:**
```
tests/
├── SasiadMa.UnitTests/         - Testy jednostkowe (logic, services)
│   ├── Services/
│   ├── Validators/
│   └── Helpers/
└── SasiadMa.IntegrationTests/  - Testy integracyjne (API endpoints)
    ├── AuthTests.cs
    ├── ItemsTests.cs
    ├── BookingsTests.cs
    └── MessagesTests.cs
```

**Dodatkowe biblioteki:**
- `Microsoft.AspNetCore.Mvc.Testing` - WebApplicationFactory dla testów integracyjnych
- `Moq` - Mocking dependencies
- `FluentAssertions` - Czytelne asercje

**Przykład:**
```csharp
[Fact]
public async Task CreateItem_WithValidData_ReturnsCreatedItem()
{
    // Arrange
    var client = _factory.CreateClient();
    var newItem = new CreateItemDto { Name = "Wiertarka", Category = "Narzędzia" };

    // Act
    var response = await client.PostAsJsonAsync("/api/items", newItem);

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.Created);
    var item = await response.Content.ReadFromJsonAsync<ItemDto>();
    item.Name.Should().Be("Wiertarka");
}
```

**Pokrycie:**
- Unit tests: Services, business logic, validators
- Integration tests: API endpoints (happy path + error cases)
- Target coverage: >70% dla MVP

### 8.2 Frontend Tests (React)

**Vitest**
- Framework do testów jednostkowych
- Wersja: najnowsza stabilna
- Justyfikacja: Szybszy niż Jest, natywna integracja z Vite

**React Testing Library**
- Testowanie komponentów React
- Justyfikacja: Best practices, focus na user behavior

**Struktura testów:**
```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
├── pages/
│   ├── LoginPage.tsx
│   └── LoginPage.test.tsx
└── hooks/
    ├── useAuth.ts
    └── useAuth.test.ts
```

**Przykład:**
```typescript
describe('LoginPage', () => {
  it('should submit form with valid credentials', async () => {
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Hasło'), 'Password123!');
    await userEvent.click(screen.getByRole('button', { name: 'Zaloguj' }));

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });
});
```

**Pokrycie:**
- Komponenty: krytyczne UI components (formularze, modals)
- Hooks: custom hooks (useAuth, useItems)
- Utils: helper functions
- Target coverage: >60% dla MVP

### 8.3 E2E Tests (opcjonalnie dla MVP)

**Playwright** (jeśli czas pozwoli)
- End-to-end testing
- Testy krytycznego flow: rejestracja → dodanie przedmiotu → rezerwacja → zwrot

---

## 9. CI/CD Pipeline (GitHub Actions)

### 9.1 Backend Pipeline

**`.github/workflows/backend-ci-cd.yml`**

```yaml
name: Backend CI/CD

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'
  pull_request:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 8.0.x

    - name: Restore dependencies
      run: dotnet restore
      working-directory: ./backend

    - name: Build
      run: dotnet build --no-restore
      working-directory: ./backend

    - name: Run Unit Tests
      run: dotnet test --no-build --verbosity normal --filter "FullyQualifiedName~UnitTests"
      working-directory: ./backend

    - name: Run Integration Tests
      run: dotnet test --no-build --verbosity normal --filter "FullyQualifiedName~IntegrationTests"
      working-directory: ./backend

    - name: Generate Code Coverage
      run: dotnet test --collect:"XPlat Code Coverage"
      working-directory: ./backend

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Log in to GitHub Container Registry
      uses: docker/login-action@v2
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: ghcr.io/${{ github.repository }}/sasiad-ma-api:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Deploy to Azure App Service
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'sasiad-ma-api'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        images: ghcr.io/${{ github.repository }}/sasiad-ma-api:${{ github.sha }}
```

**Workflow:**
1. **Trigger:** Push do `main` lub PR
2. **Test Job:**
   - Restore dependencies
   - Build projektu
   - Run unit tests
   - Run integration tests
   - Generate code coverage
3. **Build & Deploy Job** (tylko main):
   - Build Docker image
   - Push to GitHub Container Registry (ghcr.io)
   - Deploy to Azure App Service

### 9.2 Frontend Pipeline

**`.github/workflows/frontend-ci-cd.yml`**

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [ main ]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [ main ]
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20.x'
        cache: 'npm'
        cache-dependency-path: './frontend/package-lock.json'

    - name: Install dependencies
      run: npm ci
      working-directory: ./frontend

    - name: Lint
      run: npm run lint
      working-directory: ./frontend

    - name: Type check
      run: npm run type-check
      working-directory: ./frontend

    - name: Run tests
      run: npm run test
      working-directory: ./frontend

    - name: Build
      run: npm run build
      working-directory: ./frontend
      env:
        VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        working-directory: ./frontend
        vercel-args: '--prod'
```

**Workflow:**
1. **Trigger:** Push do `main` lub PR
2. **Test Job:**
   - Install dependencies
   - Lint (ESLint)
   - Type check (TypeScript)
   - Run unit tests (Vitest)
   - Build (sprawdzenie czy build działa)
3. **Deploy Job** (tylko main):
   - Deploy to Vercel

### 9.3 Database Migrations (opcjonalnie)

**Automatyczne migracje przy deploy:**
- EF Core migrations uruchamiane przy starcie aplikacji (Development/Staging)
- Production: manual approval przez GitHub Actions environment

---

## 10. Hosting & Deployment

### 10.1 Backend Hosting

**Azure App Service (Free Tier)**
- Plan: F1 (Free)
- Limits: 60 CPU minutes/day, 1GB RAM, 1GB storage
- Deployment: Docker container z Azure Container Registry
- URL: `https://sasiad-ma-api.azurewebsites.net`

### 10.2 Frontend Hosting

**Vercel**
- Free tier: Unlimited bandwidth, automatic SSL
- Automatic deployments z GitHub przez CI/CD
- URL: `https://sasiad-ma.vercel.app`

### 10.3 Database Hosting

**Supabase**
- Free tier: 500MB database, 2 CPU cores
- Storage included (1GB dla zdjęć)

### 10.4 Container Registry

**GitHub Container Registry (ghcr.io)**
- **Całkowicie darmowy** (unlimited private repositories)
- Automatyczna integracja z GitHub Actions
- URL: `ghcr.io/twoj-user/sasiad-ma-10xdev/sasiad-ma-api`
- Przechowywanie Docker images
- Integracja z Azure App Service

---

## 11. Development Environment

### 11.1 IDE

**JetBrains Rider**
- Jedyne oficjalne IDE dla projektu
- Wersja: najnowsza stabilna (2024.x)
- Justyfikacja:
  - Najlepsze IDE dla .NET + Frontend (React/TypeScript)
  - Excellent debugging
  - Built-in Docker support
  - Integracja z Git
  - Refactoring tools
  - Database tools (PostgreSQL)
  - HTTP Client (testing API)
- Licencja: Free dla edukacji/open-source lub trial

**Wymagane Pluginy:**
- Tailwind CSS IntelliSense
- .editorconfig support (built-in)

### 11.2 Inne narzędzia

**Git + GitHub**
- Version control
- Repository: `sasiad-ma-10xdev`
- Branch strategy: main + feature branches

**Docker Desktop**
- Wymagane do lokalnego developmentu
- Uruchamianie PostgreSQL lokalnie

**pgAdmin** (opcjonalnie)
- GUI dla PostgreSQL (jeśli potrzebne, Rider ma built-in DB tools)

---

## 12. Environment Variables

### 12.1 Backend (.env lub appsettings.json)

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sasiadma_dev

# JWT
JWT_SECRET=<strong-secret-key-minimum-32-chars>
JWT_ISSUER=sasiad-ma-api
JWT_AUDIENCE=sasiad-ma-client
JWT_ACCESS_TOKEN_EXPIRATION=60
JWT_REFRESH_TOKEN_EXPIRATION=43200

# Supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_KEY=<service-role-key>

# Email
SENDGRID_API_KEY=<your-sendgrid-api-key>
EMAIL_FROM=noreply@sasiad-ma.pl

# Frontend URL (dla linków w emailach)
FRONTEND_URL=https://sasiad-ma.vercel.app

# Environment
ASPNETCORE_ENVIRONMENT=Development
```

### 12.2 Frontend (.env)

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

### 12.3 GitHub Secrets (dla CI/CD)

**Backend:**
- `AZURE_WEBAPP_PUBLISH_PROFILE` - Azure App Service publish profile
- `GITHUB_TOKEN` - Automatycznie dostępny (nie trzeba konfigurować)

**Frontend:**
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `VITE_API_BASE_URL` - Production API URL
- `VITE_SUPABASE_URL` - Supabase URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key

---

## 13. Security Considerations

**Authentication:**
- ✅ JWT tokens (secure, httpOnly cookies dla refresh token)
- ✅ Password hashing (ASP.NET Identity - PBKDF2)
- ✅ HTTPS only (Vercel + Azure automatic SSL)

**API Security:**
- ✅ CORS configured (tylko frontend domain)
- ✅ Input validation (Data Annotations)
- ✅ Environment variables dla secrets (nie hardcoded)

**Database:**
- ✅ Parameterized queries (EF Core automatic)
- ✅ Connection string w environment variables

**Storage:**
- ✅ Supabase RLS (Row Level Security)
- ✅ File type validation (tylko JPG/PNG)
- ✅ File size limit (5MB)

**Docker:**
- ✅ Multi-stage builds (mniejsze images)
- ✅ Non-root user w kontenerze
- ✅ Security scanning w CI/CD (opcjonalnie: Trivy)

**CI/CD:**
- ✅ Secrets w GitHub Secrets (nie w kodzie)
- ✅ Testy przed deployment
- ✅ Branch protection (main requires PR + tests passing)

---

## 14. Szacowane koszty (Micro-MVP)

### Faza testowa (pierwsze 2 miesiące):

| Usługa | Plan | Koszt |
|--------|------|-------|
| Azure App Service | Free (F1) | **0 zł** |
| GitHub Container Registry | Free (unlimited) | **0 zł** |
| Vercel | Free | **0 zł** |
| Supabase (DB + Storage) | Free | **0 zł** |
| SendGrid | Free (100 emails/day) | **0 zł** |
| GitHub Actions | Free (2000 min/month) | **0 zł** |
| Domena (opcjonalna) | .pl domain | **~30 zł/rok** |
| **TOTAL** | | **0 zł/miesiąc** 🎉 |

**Limity:**
- Azure: 60 CPU minutes/day (wystarczy dla 5-10 użytkowników)
- GitHub Actions: 2000 minutes/month (wystarczy dla MVP)
- GitHub Container Registry: Unlimited private repos
- SendGrid: 100 emails/day (wystarczy dla MVP)
- Supabase: 500MB DB (wystarczy dla ~1000 przedmiotów z metadatą)
- Supabase Storage: 1GB (wystarczy dla ~200 zdjęć po 5MB)

**Stack w 100% darmowy** (z wyjątkiem opcjonalnej domeny za 30 zł/rok).

---

## 15. Development Workflow

### 15.1 Lokalne uruchomienie

**Backend:**
```bash
cd backend
docker-compose up -d postgres  # Uruchom PostgreSQL
dotnet ef database update      # Zastosuj migracje
dotnet run --project SasiadMa.Api
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Full stack z Docker:**
```bash
docker-compose up
```

### 15.2 Tworzenie feature

1. Utwórz branch: `git checkout -b feature/nazwa-funkcji`
2. Implementuj + testy
3. Uruchom testy lokalnie: `dotnet test` / `npm test`
4. Commit + Push
5. Utwórz Pull Request
6. CI/CD uruchomi testy automatycznie
7. Code review
8. Merge do `main` → automatyczny deploy

### 15.3 Debugging

**Backend (Rider):**
- F5 (Run with debugger)
- Breakpoints w kodzie
- Watch variables
- HTTP Client (testowanie endpoints)

**Frontend (Rider):**
- JavaScript debugger w przeglądarce
- React DevTools
- Network tab (Chrome DevTools)

---

**Koniec dokumentu**
Wersja: 0.1 Micro-MVP
Data: 2026-01-10
Status: Ready for Implementation
