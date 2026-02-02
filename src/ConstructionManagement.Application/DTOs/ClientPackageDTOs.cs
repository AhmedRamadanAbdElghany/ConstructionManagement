using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs;

public record CreateClientPackageRequest(
    string Name,
    string Description,
    decimal Price,
    string IncludedItemsDescription,
    PackageVariationCalculation VariationCalculation
);

public record UpdateClientPackageRequest(
    string? Name,
    string? Description,
    decimal? Price,
    string? IncludedItemsDescription,
    PackageVariationCalculation? VariationCalculation
);

public record ClientPackageResponse(
    int Id,
    string Name,
    string Description,
    decimal Price,
    string IncludedItemsDescription,
    PackageVariationCalculation VariationCalculation,
    List<string>? ImageUrls = null // Simplified for now
);
