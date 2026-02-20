using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service for managing client payments.
/// </summary>
public class ClientPaymentService : IClientPaymentService
{
    private readonly IRepository<ClientPayment> _paymentRepository;
    private readonly IRepository<Project> _projectRepository;
    private readonly IRepository<ProgressInvoice> _invoiceRepository;
    private readonly IUnitOfWork? _unitOfWork;
    private readonly ILogger<ClientPaymentService> _logger;

    public ClientPaymentService(
        IRepository<ClientPayment> paymentRepository,
        IRepository<Project> projectRepository,
        IRepository<ProgressInvoice> invoiceRepository,
        IUnitOfWork unitOfWork,
        ILogger<ClientPaymentService> logger)
    {
        _paymentRepository = paymentRepository;
        _projectRepository = projectRepository;
        _invoiceRepository = invoiceRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<int> CreatePaymentAsync(CreateClientPaymentRequest request, int createdByUserId, int companyId)
    {
        if (_unitOfWork == null)
            throw new InvalidOperationException("UnitOfWork is not available.");

        _logger.LogInformation("Creating client payment for project {ProjectId}", request.ProjectId);

        // Validate project exists
        var project = await _projectRepository.GetByIdAsync(request.ProjectId);
        if (project == null)
            throw new ArgumentException("Project not found");

        // Parse payment type
        var paymentType = ParsePaymentType(request.PaymentType);
        var paymentMethod = ParsePaymentMethod(request.PaymentMethod);

        // Generate receipt number if not provided
        var receiptNumber = request.ReceiptNumber ?? await GenerateReceiptNumberAsync(DateTime.UtcNow.Year);

        var payment = new ClientPayment
        {
            CompanyId = companyId,
            ProjectId = request.ProjectId,
            PaymentType = paymentType,
            Amount = request.Amount,
            Currency = request.Currency ?? "EGP",
            PaymentDate = request.PaymentDate ?? DateTime.UtcNow,
            ReceiptNumber = receiptNumber,
            PaymentMethod = paymentMethod,
            BankName = request.BankName,
            CheckNumber = request.CheckNumber,
            CheckDueDate = request.CheckDueDate,
            ProgressInvoiceId = request.ProgressInvoiceId,
            Notes = request.Notes,
            AttachmentPath = request.AttachmentPath,
            Status = ClientPaymentStatus.Pending,
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTime.UtcNow
        };

        await _paymentRepository.AddAsync(payment);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Client payment {PaymentId} created successfully", payment.Id);
        return payment.Id;
    }

    public async Task<ClientPaymentDto?> GetPaymentByIdAsync(int paymentId)
    {
        var payment = await _paymentRepository.AsQueryable()
            .Include(p => p.Project)
            .Include(p => p.ProgressInvoice)
            .Include(p => p.CreatedByUser)
            .Include(p => p.ConfirmedByUser)
            .FirstOrDefaultAsync(p => p.Id == paymentId);

        return payment == null ? null : MapToDto(payment);
    }

    public async Task<bool> UpdatePaymentAsync(int paymentId, UpdateClientPaymentRequest request, int userId)
    {
        if (_unitOfWork == null)
            throw new InvalidOperationException("UnitOfWork is not available.");

        var payment = await _paymentRepository.GetByIdAsync(paymentId);
        if (payment == null) return false;

        // Only allow updates if payment is pending
        if (payment.Status != ClientPaymentStatus.Pending)
            return false;

        if (request.PaymentType != null)
            payment.PaymentType = ParsePaymentType(request.PaymentType);
        if (request.Amount.HasValue)
            payment.Amount = request.Amount.Value;
        if (request.Currency != null)
            payment.Currency = request.Currency;
        if (request.PaymentDate.HasValue)
            payment.PaymentDate = request.PaymentDate.Value;
        if (request.ReceiptNumber != null)
            payment.ReceiptNumber = request.ReceiptNumber;
        if (request.PaymentMethod != null)
            payment.PaymentMethod = ParsePaymentMethod(request.PaymentMethod);
        if (request.BankName != null)
            payment.BankName = request.BankName;
        if (request.CheckNumber != null)
            payment.CheckNumber = request.CheckNumber;
        if (request.CheckDueDate.HasValue)
            payment.CheckDueDate = request.CheckDueDate;
        if (request.ProgressInvoiceId.HasValue)
            payment.ProgressInvoiceId = request.ProgressInvoiceId;
        if (request.Notes != null)
            payment.Notes = request.Notes;
        if (request.AttachmentPath != null)
            payment.AttachmentPath = request.AttachmentPath;

        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeletePaymentAsync(int paymentId, int userId)
    {
        if (_unitOfWork == null)
            throw new InvalidOperationException("UnitOfWork is not available.");

        var payment = await _paymentRepository.GetByIdAsync(paymentId);
        if (payment == null) return false;

        // Only allow deletion if payment is pending
        if (payment.Status != ClientPaymentStatus.Pending)
            return false;

        await _paymentRepository.DeleteAsync(payment);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<PagedClientPaymentResult> GetPaymentsAsync(ClientPaymentFilterRequest filter, int companyId)
    {
        var query = _paymentRepository.AsQueryable()
            .Include(p => p.Project)
            .Include(p => p.CreatedByUser)
            .Where(p => p.CompanyId == companyId);

        // Apply filters
        if (filter.ProjectId.HasValue)
            query = query.Where(p => p.ProjectId == filter.ProjectId.Value);

        if (!string.IsNullOrEmpty(filter.PaymentType))
        {
            var paymentType = ParsePaymentType(filter.PaymentType);
            query = query.Where(p => p.PaymentType == paymentType);
        }

        if (!string.IsNullOrEmpty(filter.Status))
        {
            var status = ParsePaymentStatus(filter.Status);
            query = query.Where(p => p.Status == status);
        }

        if (!string.IsNullOrEmpty(filter.PaymentMethod))
        {
            var method = ParsePaymentMethod(filter.PaymentMethod);
            query = query.Where(p => p.PaymentMethod == method);
        }

        if (filter.DateFrom.HasValue)
            query = query.Where(p => p.PaymentDate >= filter.DateFrom.Value);

        if (filter.DateTo.HasValue)
            query = query.Where(p => p.PaymentDate <= filter.DateTo.Value);

        if (!string.IsNullOrEmpty(filter.SearchTerm))
        {
            var term = filter.SearchTerm.ToLower();
            query = query.Where(p =>
                (p.ReceiptNumber != null && p.ReceiptNumber.ToLower().Contains(term)) ||
                (p.Notes != null && p.Notes.ToLower().Contains(term)) ||
                p.Project.Name.ToLower().Contains(term));
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Apply sorting
        query = ApplySorting(query, filter.SortBy, filter.SortDescending);

        // Apply pagination
        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return new PagedClientPaymentResult(
            items.Select(MapToListItemDto).ToList(),
            totalCount,
            filter.PageNumber,
            filter.PageSize,
            (int)Math.Ceiling(totalCount / (double)filter.PageSize)
        );
    }

    public async Task<List<ClientPaymentListItemDto>> GetPaymentsForProjectAsync(int projectId, string? status = null)
    {
        var query = _paymentRepository.AsQueryable()
            .Include(p => p.Project)
            .Include(p => p.CreatedByUser)
            .Where(p => p.ProjectId == projectId);

        if (!string.IsNullOrEmpty(status))
        {
            var statusEnum = ParsePaymentStatus(status);
            query = query.Where(p => p.Status == statusEnum);
        }

        var payments = await query.OrderByDescending(p => p.PaymentDate).ToListAsync();
        return payments.Select(MapToListItemDto).ToList();
    }

    public async Task<bool> ConfirmPaymentAsync(int paymentId, int confirmedByUserId, ConfirmPaymentRequest? request = null)
    {
        if (_unitOfWork == null)
            throw new InvalidOperationException("UnitOfWork is not available.");

        var payment = await _paymentRepository.GetByIdAsync(paymentId);
        if (payment == null) return false;

        if (payment.Status != ClientPaymentStatus.Pending)
            return false;

        payment.Status = ClientPaymentStatus.Confirmed;
        payment.ConfirmedByUserId = confirmedByUserId;
        payment.ConfirmedAt = DateTime.UtcNow;

        if (request?.ReceiptNumber != null)
            payment.ReceiptNumber = request.ReceiptNumber;
        if (request?.Notes != null)
            payment.Notes = request.Notes;

        await _unitOfWork.SaveChangesAsync();

        // Update progress invoice if linked
        if (payment.ProgressInvoiceId.HasValue)
        {
            await UpdateInvoicePaymentStatus(payment.ProgressInvoiceId.Value);
        }

        return true;
    }

    public async Task<bool> CancelPaymentAsync(int paymentId, int userId, string? reason = null)
    {
        if (_unitOfWork == null)
            throw new InvalidOperationException("UnitOfWork is not available.");

        var payment = await _paymentRepository.GetByIdAsync(paymentId);
        if (payment == null) return false;

        payment.Status = ClientPaymentStatus.Cancelled;
        if (reason != null)
            payment.Notes = $"{payment.Notes}\nCancellation reason: {reason}".Trim();

        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<ClientPaymentStatisticsDto> GetStatisticsAsync(int? projectId = null, int? companyId = null)
    {
        var query = _paymentRepository.AsQueryable();

        if (projectId.HasValue)
            query = query.Where(p => p.ProjectId == projectId.Value);
        if (companyId.HasValue)
            query = query.Where(p => p.CompanyId == companyId.Value);

        var payments = await query.ToListAsync();

        return new ClientPaymentStatisticsDto(
            TotalPayments: payments.Count,
            PendingPayments: payments.Count(p => p.Status == ClientPaymentStatus.Pending),
            ConfirmedPayments: payments.Count(p => p.Status == ClientPaymentStatus.Confirmed),
            TotalAmount: payments.Sum(p => p.Amount),
            PendingAmount: payments.Where(p => p.Status == ClientPaymentStatus.Pending).Sum(p => p.Amount),
            ConfirmedAmount: payments.Where(p => p.Status == ClientPaymentStatus.Confirmed).Sum(p => p.Amount),
            AdvancePaymentsTotal: payments.Where(p => p.PaymentType == ClientPaymentType.Advance && p.Status == ClientPaymentStatus.Confirmed).Sum(p => p.Amount),
            ProgressPaymentsTotal: payments.Where(p => p.PaymentType == ClientPaymentType.Progress && p.Status == ClientPaymentStatus.Confirmed).Sum(p => p.Amount),
            OnAccountPaymentsTotal: payments.Where(p => p.PaymentType == ClientPaymentType.OnAccount && p.Status == ClientPaymentStatus.Confirmed).Sum(p => p.Amount),
            FinalPaymentsTotal: payments.Where(p => p.PaymentType == ClientPaymentType.Final && p.Status == ClientPaymentStatus.Confirmed).Sum(p => p.Amount)
        );
    }

    #region Private Methods

    private ClientPaymentType ParsePaymentType(string? value)
    {
        if (string.IsNullOrEmpty(value)) return ClientPaymentType.OnAccount;
        return value.ToLower() switch
        {
            "advance" => ClientPaymentType.Advance,
            "onaccount" or "on_account" => ClientPaymentType.OnAccount,
            "progress" => ClientPaymentType.Progress,
            "final" => ClientPaymentType.Final,
            _ => Enum.TryParse<ClientPaymentType>(value, true, out var result) ? result : ClientPaymentType.OnAccount
        };
    }

    private ClientPaymentMethod ParsePaymentMethod(string? value)
    {
        if (string.IsNullOrEmpty(value)) return ClientPaymentMethod.Cash;
        return value.ToLower() switch
        {
            "cash" => ClientPaymentMethod.Cash,
            "banktransfer" or "bank_transfer" => ClientPaymentMethod.BankTransfer,
            "check" or "cheque" => ClientPaymentMethod.Check,
            "creditcard" or "credit_card" => ClientPaymentMethod.CreditCard,
            _ => Enum.TryParse<ClientPaymentMethod>(value, true, out var result) ? result : ClientPaymentMethod.Cash
        };
    }

    private ClientPaymentStatus ParsePaymentStatus(string value)
    {
        return value.ToLower() switch
        {
            "pending" => ClientPaymentStatus.Pending,
            "confirmed" => ClientPaymentStatus.Confirmed,
            "cancelled" or "canceled" => ClientPaymentStatus.Cancelled,
            "bounced" => ClientPaymentStatus.Bounced,
            _ => Enum.TryParse<ClientPaymentStatus>(value, true, out var result) ? result : ClientPaymentStatus.Pending
        };
    }

    private async Task<string> GenerateReceiptNumberAsync(int year)
    {
        var count = await _paymentRepository.AsQueryable()
            .CountAsync(p => p.PaymentDate.Year == year);
        return $"RCP-{year}-{(count + 1):D5}";
    }

    private async Task UpdateInvoicePaymentStatus(int invoiceId)
    {
        var invoice = await _invoiceRepository.AsQueryable()
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null) return;

        var totalPaid = invoice.Payments
            .Where(p => p.Status == ClientPaymentStatus.Confirmed)
            .Sum(p => p.Amount);

        invoice.PaidAmount = totalPaid;
        invoice.RemainingAmount = invoice.NetAmount - totalPaid;

        if (totalPaid >= invoice.NetAmount)
            invoice.Status = ProgressInvoiceStatus.Paid;
        else if (totalPaid > 0)
            invoice.Status = ProgressInvoiceStatus.PartiallyPaid;

        await _unitOfWork!.SaveChangesAsync();
    }

    private IQueryable<ClientPayment> ApplySorting(IQueryable<ClientPayment> query, string sortBy, bool descending)
    {
        return sortBy.ToLower() switch
        {
            "amount" => descending ? query.OrderByDescending(p => p.Amount) : query.OrderBy(p => p.Amount),
            "paymentdate" => descending ? query.OrderByDescending(p => p.PaymentDate) : query.OrderBy(p => p.PaymentDate),
            "paymenttype" => descending ? query.OrderByDescending(p => p.PaymentType) : query.OrderBy(p => p.PaymentType),
            "status" => descending ? query.OrderByDescending(p => p.Status) : query.OrderBy(p => p.Status),
            "createdat" => descending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt),
            _ => descending ? query.OrderByDescending(p => p.PaymentDate) : query.OrderBy(p => p.PaymentDate)
        };
    }

    private static ClientPaymentDto MapToDto(ClientPayment payment)
    {
        return new ClientPaymentDto(
            payment.Id,
            payment.ProjectId,
            payment.Project?.Name ?? "",
            payment.PaymentType.ToString(),
            GetPaymentTypeDisplayName(payment.PaymentType),
            payment.Amount,
            payment.Currency,
            payment.PaymentDate,
            payment.ReceiptNumber,
            payment.PaymentMethod.ToString(),
            GetPaymentMethodDisplayName(payment.PaymentMethod),
            payment.BankName,
            payment.CheckNumber,
            payment.CheckDueDate,
            payment.ProgressInvoiceId,
            payment.ProgressInvoice?.InvoiceNumber,
            payment.Notes,
            payment.AttachmentPath,
            payment.Status.ToString(),
            GetPaymentStatusDisplayName(payment.Status),
            payment.ConfirmedByUserId,
            payment.ConfirmedByUser?.FullName,
            payment.ConfirmedAt,
            payment.CreatedByUserId,
            payment.CreatedByUser?.FullName,
            payment.CreatedAt
        );
    }

    private static ClientPaymentListItemDto MapToListItemDto(ClientPayment payment)
    {
        return new ClientPaymentListItemDto(
            Id: payment.Id,
            ProjectId: payment.ProjectId,
            ProjectName: payment.Project?.Name ?? "",
            PaymentType: payment.PaymentType.ToString(),
            PaymentTypeDisplayName: GetPaymentTypeDisplayName(payment.PaymentType),
            Amount: payment.Amount,
            Currency: payment.Currency,
            PaymentDate: payment.PaymentDate,
            ReceiptNumber: payment.ReceiptNumber,
            PaymentMethod: payment.PaymentMethod.ToString(),
            PaymentMethodDisplayName: GetPaymentMethodDisplayName(payment.PaymentMethod),
            Status: payment.Status.ToString(),
            StatusDisplayName: GetPaymentStatusDisplayName(payment.Status),
            Notes: payment.Notes,
            ProgressInvoiceId: payment.ProgressInvoiceId,
            ProgressInvoiceNumber: payment.ProgressInvoice?.InvoiceNumber,
            CreatedByFullName: payment.CreatedByUser?.FullName,
            CreatedAt: payment.CreatedAt
        );
    }

    private static string GetPaymentTypeDisplayName(ClientPaymentType type) => type switch
    {
        ClientPaymentType.Advance => "دفعة مقدمة",
        ClientPaymentType.OnAccount => "دفعة على الحساب",
        ClientPaymentType.Progress => "دفعة مستخلص",
        ClientPaymentType.Final => "دفعة نهائية",
        _ => type.ToString()
    };

    private static string GetPaymentMethodDisplayName(ClientPaymentMethod method) => method switch
    {
        ClientPaymentMethod.Cash => "نقداً",
        ClientPaymentMethod.BankTransfer => "تحويل بنكي",
        ClientPaymentMethod.Check => "شيك",
        ClientPaymentMethod.CreditCard => "بطاقة ائتمان",
        _ => method.ToString()
    };

    private static string GetPaymentStatusDisplayName(ClientPaymentStatus status) => status switch
    {
        ClientPaymentStatus.Pending => "معلق",
        ClientPaymentStatus.Confirmed => "مؤكد",
        ClientPaymentStatus.Cancelled => "ملغى",
        ClientPaymentStatus.Bounced => "مرتد",
        _ => status.ToString()
    };

    #endregion
}
