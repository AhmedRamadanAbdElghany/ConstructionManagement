namespace ConstructionManagement.Domain.Entities;

public class InvoiceSequence
{
    public int YearPart { get; set; }      // PK – مثل 2025
    public int NextNumber { get; set; }    // الرقم التالي – يبدأ من 1

    // مش محتاج navigation properties أو audit fields
}