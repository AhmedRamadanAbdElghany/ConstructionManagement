using ConstructionManagement.Domain.Entities;  // ← add this line

namespace ConstructionManagement.Application.DTOs.Transaction
{
    public record ReviewTransactionRequest(
        TransactionStatus Status,           // ← now recognized
        string? ReviewNotes = null
    );
}
