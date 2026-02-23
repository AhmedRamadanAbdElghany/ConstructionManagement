namespace ConstructionManagement.Application.DTOs.Vendor
{
    public class DeliveryCostTierDto
    {
        public int Id { get; set; }
        public int VendorProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal MinWeightKg { get; set; }
        public decimal MaxWeightKg { get; set; }
        public decimal PricePerKm { get; set; }
        public decimal FixedFee { get; set; }
        public bool IsActive { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateDeliveryCostTierRequest
    {
        public int VendorProductId { get; set; }
        public decimal MinWeightKg { get; set; }
        public decimal MaxWeightKg { get; set; }
        public decimal PricePerKm { get; set; }
        public decimal FixedFee { get; set; } = 0;
        public string? Description { get; set; }
    }

    public class UpdateDeliveryCostTierRequest
    {
        public decimal MinWeightKg { get; set; }
        public decimal MaxWeightKg { get; set; }
        public decimal PricePerKm { get; set; }
        public decimal FixedFee { get; set; }
        public bool IsActive { get; set; }
        public string? Description { get; set; }
    }

    public class DeliveryCalculationRequest
    {
        public int ProductId { get; set; }
        public decimal WeightKg { get; set; }
        public decimal DistanceKm { get; set; }
    }

    public class DeliveryCalculationResult
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal WeightKg { get; set; }
        public decimal DistanceKm { get; set; }
        public int? AppliedTierId { get; set; }
        public string? AppliedTierDescription { get; set; }
        public decimal PricePerKm { get; set; }
        public decimal FixedFee { get; set; }
        public decimal DistanceCost { get; set; }
        public decimal TotalDeliveryCost { get; set; }
        public bool IsCalculated { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class BulkDeliveryCalculationRequest
    {
        public List<DeliveryCalculationRequest> Items { get; set; } = new();
    }

    public class BulkDeliveryCalculationResult
    {
        public List<DeliveryCalculationResult> Results { get; set; } = new();
        public decimal TotalDeliveryCost { get; set; }
        public bool AllCalculated { get; set; }
    }
}
