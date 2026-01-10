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
