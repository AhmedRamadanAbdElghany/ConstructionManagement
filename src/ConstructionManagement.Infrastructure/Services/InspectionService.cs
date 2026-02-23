using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;

namespace ConstructionManagement.Infrastructure.Services
{
    /// <summary>
    /// Implementation of inspection management service
    /// </summary>
    public class InspectionService : IInspectionService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<InspectionService> _logger;
        private readonly IFileStorageService _fileStorage;
        private readonly IPushNotificationService _pushNotification;
        private readonly IEmailService _emailService;

        public InspectionService(
            ApplicationDbContext context,
            ILogger<InspectionService> logger,
            IFileStorageService fileStorage,
            IPushNotificationService pushNotification,
            IEmailService emailService)
        {
            _context = context;
            _logger = logger;
            _fileStorage = fileStorage;
            _pushNotification = pushNotification;
            _emailService = emailService;
        }

        #region Inspection Requests

        public async Task<InspectionRequestDto> CreateRequestAsync(int clientUserId, CreateInspectionRequestDto dto)
        {
            var user = await _context.Users.FindAsync(clientUserId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }

            var company = await _context.Companies.FindAsync(dto.CompanyId);
            if (company == null)
            {
                throw new ArgumentException("Company not found");
            }

            var request = new InspectionRequest
            {
                CompanyId = dto.CompanyId,
                ClientUserId = clientUserId,
                PropertyType = (PropertyType)dto.PropertyType,
                PropertyTypeName = dto.PropertyTypeName,
                Title = dto.Title,
                Description = dto.Description,
                ApproximateArea = dto.ApproximateArea,
                Address = dto.Address,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Status = InspectionStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.InspectionRequests.Add(request);
            await _context.SaveChangesAsync();

            // Add time slots if provided
            if (dto.TimeSlots != null && dto.TimeSlots.Any())
            {
                foreach (var slot in dto.TimeSlots)
                {
                    var timeSlot = new InspectionTimeSlot
                    {
                        InspectionRequestId = request.Id,
                        ProposedBy = ProposedBy.Client,
                        ProposedByUserId = clientUserId,
                        Date = slot.Date,
                        TimeStart = slot.TimeStart,
                        TimeEnd = slot.TimeEnd,
                        Notes = slot.Notes
                    };
                    _context.InspectionTimeSlots.Add(timeSlot);
                }
                await _context.SaveChangesAsync();
            }

            // Add custom field values if provided
            if (dto.CustomFields != null)
            {
                foreach (var field in dto.CustomFields)
                {
                    // Find custom field by name for the company
                    var customField = await _context.InspectionCustomFields
                        .FirstOrDefaultAsync(f => f.CompanyId == dto.CompanyId && f.Name == field.Key);

                    if (customField != null)
                    {
                        var fieldValue = new InspectionCustomFieldValue
                        {
                            InspectionRequestId = request.Id,
                            CustomFieldId = customField.Id,
                            Value = field.Value
                        };
                        _context.InspectionCustomFieldValues.Add(fieldValue);
                    }
                }
                await _context.SaveChangesAsync();
            }

            // Notify company owner
            var companyOwner = await _context.Users.FirstOrDefaultAsync(u => u.CompanyId == dto.CompanyId && u.UserType == UserType.CompanyOwner);
            if (companyOwner != null)
            {
                await _pushNotification.SendNotificationAsync(
                    companyOwner.Id,
                    "New Inspection Request",
                    $"New inspection request: {request.Title}",
                    new Dictionary<string, string> { ["inspectionId"] = request.Id.ToString() }
                );
            }

            _logger.LogInformation("Inspection request {RequestId} created by user {UserId}", request.Id, clientUserId);

            return await GetRequestByIdAsync(request.Id, clientUserId) ?? throw new InvalidOperationException("Failed to retrieve created request");
        }

        public async Task<InspectionRequestDto?> GetRequestByIdAsync(int id, int userId)
        {
            var request = await _context.InspectionRequests
                .Include(r => r.Company)
                .Include(r => r.ClientUser)
                .Include(r => r.TimeSlots)
                .Include(r => r.Quotes)
                .Include(r => r.Session)
                .Include(r => r.Documents)
                .Include(r => r.Payment)
                .Include(r => r.WorkRequest)
                .Include(r => r.Review)
                .Include(r => r.CostEstimate).ThenInclude(c => c.Items)
                .Include(r => r.TeamMembers).ThenInclude(t => t.User)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (request == null)
            {
                return null;
            }

            // Verify access
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            var hasAccess = request.ClientUserId == userId ||
                           request.CompanyId == user.CompanyId ||
                           request.TeamMembers.Any(t => t.UserId == userId);

            if (!hasAccess)
            {
                return null;
            }

            return MapToDto(request);
        }

        public async Task<InspectionRequestPagedResultDto> GetClientRequestsAsync(int clientUserId, InspectionFilterDto filter)
        {
            var query = _context.InspectionRequests
                .Include(r => r.Company)
                .Where(r => r.ClientUserId == clientUserId);

            query = ApplyFilter(query, filter);

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new InspectionRequestPagedResultDto
            {
                Items = items.Select(MapToListDto).ToList(),
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize)
            };
        }

        public async Task<InspectionRequestPagedResultDto> GetCompanyRequestsAsync(int companyId, InspectionFilterDto filter)
        {
            var query = _context.InspectionRequests
                .Include(r => r.ClientUser)
                .Where(r => r.CompanyId == companyId);

            query = ApplyFilter(query, filter);

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new InspectionRequestPagedResultDto
            {
                Items = items.Select(MapToListDto).ToList(),
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize)
            };
        }

        public async Task<InspectionRequestDto> UpdateRequestAsync(int id, int clientUserId, UpdateInspectionRequestDto dto)
        {
            var request = await _context.InspectionRequests
                .FirstOrDefaultAsync(r => r.Id == id && r.ClientUserId == clientUserId);

            if (request == null)
            {
                throw new ArgumentException("Inspection request not found or access denied");
            }

            if (request.Status != InspectionStatus.Pending)
            {
                throw new InvalidOperationException("Can only update pending requests");
            }

            request.PropertyType = (PropertyType)dto.PropertyType;
            request.PropertyTypeName = dto.PropertyTypeName;
            request.Title = dto.Title;
            request.Description = dto.Description;
            request.ApproximateArea = dto.ApproximateArea;
            request.Address = dto.Address;
            request.Latitude = dto.Latitude;
            request.Longitude = dto.Longitude;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Inspection request {RequestId} updated by user {UserId}", id, clientUserId);

            return await GetRequestByIdAsync(id, clientUserId) ?? throw new InvalidOperationException("Failed to retrieve updated request");
        }

        public async Task<bool> CancelRequestAsync(int id, int userId, string? reason)
        {
            var request = await _context.InspectionRequests
                .FirstOrDefaultAsync(r => r.Id == id);

            if (request == null)
            {
                return false;
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            // Check if user can cancel (client or company member)
            var canCancel = request.ClientUserId == userId ||
                           request.CompanyId == user.CompanyId;

            if (!canCancel)
            {
                return false;
            }

            if (request.Status == InspectionStatus.InProgress || request.Status == InspectionStatus.Completed)
            {
                throw new InvalidOperationException("Cannot cancel inspection in progress or completed");
            }

            request.Status = InspectionStatus.Cancelled;
            request.CancellationReason = reason;
            request.CancelledByUserId = userId;

            await _context.SaveChangesAsync();

            // Notify the other party
            if (request.ClientUserId == userId)
            {
                // Notify company
                var companyOwner = await _context.Users.FirstOrDefaultAsync(u => u.CompanyId == request.CompanyId && u.UserType == UserType.CompanyOwner);
                if (companyOwner != null)
                {
                    await _pushNotification.SendNotificationAsync(
                        companyOwner.Id,
                        "Inspection Cancelled",
                        $"Inspection request '{request.Title}' has been cancelled",
                        new Dictionary<string, string> { ["inspectionId"] = request.Id.ToString() }
                    );
                }
            }
            else
            {
                // Notify client
                await _pushNotification.SendNotificationAsync(
                    request.ClientUserId,
                    "Inspection Cancelled",
                    $"Your inspection request '{request.Title}' has been cancelled by the company",
                    new Dictionary<string, string> { ["inspectionId"] = request.Id.ToString() }
                );
            }

            _logger.LogInformation("Inspection request {RequestId} cancelled by user {UserId}", id, userId);

            return true;
        }

        #endregion

        #region Time Slots

        public async Task<List<InspectionTimeSlotDto>> AddTimeSlotsAsync(int inspectionId, int userId, List<CreateTimeSlotDto> slots)
        {
            var request = await _context.InspectionRequests.FindAsync(inspectionId);
            if (request == null)
            {
                throw new ArgumentException("Inspection request not found");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new ArgumentException("User not found");

            var isClient = request.ClientUserId == userId;
            var isCompany = request.CompanyId == user.CompanyId;

            if (!isClient && !isCompany)
            {
                throw new UnauthorizedAccessException("Access denied");
            }

            var proposedBy = isClient ? ProposedBy.Client : ProposedBy.Company;

            var timeSlots = new List<InspectionTimeSlot>();
            foreach (var slot in slots)
            {
                var timeSlot = new InspectionTimeSlot
                {
                    InspectionRequestId = inspectionId,
                    ProposedBy = proposedBy,
                    ProposedByUserId = userId,
                    Date = slot.Date,
                    TimeStart = slot.TimeStart,
                    TimeEnd = slot.TimeEnd,
                    Notes = slot.Notes
                };
                _context.InspectionTimeSlots.Add(timeSlot);
                timeSlots.Add(timeSlot);
            }

            await _context.SaveChangesAsync();

            return timeSlots.Select(MapTimeSlotToDto).ToList();
        }

        public async Task<bool> SelectTimeSlotAsync(int inspectionId, int timeSlotId, int userId)
        {
            var request = await _context.InspectionRequests
                .Include(r => r.TimeSlots)
                .FirstOrDefaultAsync(r => r.Id == inspectionId);

            if (request == null) return false;

            var timeSlot = request.TimeSlots.FirstOrDefault(t => t.Id == timeSlotId);
            if (timeSlot == null) return false;

            // Deselect all other slots
            foreach (var slot in request.TimeSlots)
            {
                slot.IsSelected = false;
            }

            timeSlot.IsSelected = true;
            request.ScheduledDate = timeSlot.Date;
            request.ScheduledTimeStart = timeSlot.TimeStart;
            request.ScheduledTimeEnd = timeSlot.TimeEnd;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Time slot {TimeSlotId} selected for inspection {InspectionId}", timeSlotId, inspectionId);

            return true;
        }

        public async Task<bool> RemoveTimeSlotAsync(int inspectionId, int timeSlotId, int userId)
        {
            var timeSlot = await _context.InspectionTimeSlots
                .FirstOrDefaultAsync(t => t.Id == timeSlotId && t.InspectionRequestId == inspectionId);

            if (timeSlot == null) return false;

            if (timeSlot.IsSelected)
            {
                throw new InvalidOperationException("Cannot remove selected time slot");
            }

            _context.InspectionTimeSlots.Remove(timeSlot);
            await _context.SaveChangesAsync();

            return true;
        }

        #endregion

        #region Quotes

        public async Task<InspectionQuoteDto> CreateQuoteAsync(int inspectionId, int companyUserId, CreateInspectionQuoteDto dto)
        {
            var request = await _context.InspectionRequests.FindAsync(inspectionId);
            if (request == null)
            {
                throw new ArgumentException("Inspection request not found");
            }

            var user = await _context.Users.FindAsync(companyUserId);
            if (user == null || user.CompanyId != request.CompanyId)
            {
                throw new UnauthorizedAccessException("Only company members can create quotes");
            }

            var quote = new InspectionQuote
            {
                InspectionRequestId = inspectionId,
                CompanyUserId = companyUserId,
                InspectionFee = dto.InspectionFee,
                Currency = dto.Currency,
                ValidUntil = dto.ValidUntil,
                Terms = dto.Terms,
                Status = QuoteStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.InspectionQuotes.Add(quote);

            request.Status = InspectionStatus.Quoted;
            request.InspectionFee = dto.InspectionFee;
            request.Currency = dto.Currency;

            await _context.SaveChangesAsync();

            // Notify client
            await _pushNotification.SendNotificationAsync(
                request.ClientUserId,
                "Inspection Quote Received",
                $"You have received a quote for your inspection request",
                new Dictionary<string, string> { ["inspectionId"] = inspectionId.ToString() }
            );

            _logger.LogInformation("Quote {QuoteId} created for inspection {InspectionId}", quote.Id, inspectionId);

            return MapQuoteToDto(quote);
        }

        public async Task<List<InspectionQuoteDto>> GetQuotesAsync(int inspectionId)
        {
            var quotes = await _context.InspectionQuotes
                .Include(q => q.CompanyUser)
                .Where(q => q.InspectionRequestId == inspectionId)
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync();

            return quotes.Select(MapQuoteToDto).ToList();
        }

        public async Task<bool> AcceptQuoteAsync(int inspectionId, int quoteId, int clientUserId)
        {
            var request = await _context.InspectionRequests
                .FirstOrDefaultAsync(r => r.Id == inspectionId && r.ClientUserId == clientUserId);

            if (request == null)
            {
                throw new ArgumentException("Inspection request not found or access denied");
            }

            var quote = await _context.InspectionQuotes.FindAsync(quoteId);
            if (quote == null || quote.InspectionRequestId != inspectionId)
            {
                throw new ArgumentException("Quote not found");
            }

            if (quote.Status != QuoteStatus.Pending)
            {
                throw new InvalidOperationException("Quote is no longer pending");
            }

            if (quote.ValidUntil < DateTime.UtcNow)
            {
                quote.Status = QuoteStatus.Expired;
                await _context.SaveChangesAsync();
                throw new InvalidOperationException("Quote has expired");
            }

            quote.Status = QuoteStatus.Accepted;
            quote.RespondedAt = DateTime.UtcNow;
            quote.RespondedByUserId = clientUserId;

            request.Status = InspectionStatus.Approved;

            await _context.SaveChangesAsync();

            // Notify company
            var companyOwner = await _context.Users.FirstOrDefaultAsync(u => u.CompanyId == request.CompanyId && u.UserType == UserType.CompanyOwner);
            if (companyOwner != null)
            {
                await _pushNotification.SendNotificationAsync(
                    companyOwner.Id,
                    "Quote Accepted",
                    $"Client has accepted the quote for inspection",
                    new Dictionary<string, string> { ["inspectionId"] = inspectionId.ToString() }
                );
            }

            _logger.LogInformation("Quote {QuoteId} accepted for inspection {InspectionId}", quoteId, inspectionId);

            return true;
        }

        public async Task<bool> RejectQuoteAsync(int inspectionId, int quoteId, int clientUserId, string? reason)
        {
            var request = await _context.InspectionRequests
                .FirstOrDefaultAsync(r => r.Id == inspectionId && r.ClientUserId == clientUserId);

            if (request == null)
            {
                throw new ArgumentException("Inspection request not found or access denied");
            }

            var quote = await _context.InspectionQuotes.FindAsync(quoteId);
            if (quote == null || quote.InspectionRequestId != inspectionId)
            {
                throw new ArgumentException("Quote not found");
            }

            quote.Status = QuoteStatus.Rejected;
            quote.RespondedAt = DateTime.UtcNow;
            quote.RespondedByUserId = clientUserId;
            quote.RejectionReason = reason;

            request.Status = InspectionStatus.Rejected;

            await _context.SaveChangesAsync();

            // Notify company
            var companyOwner = await _context.Users.FirstOrDefaultAsync(u => u.CompanyId == request.CompanyId && u.UserType == UserType.CompanyOwner);
            if (companyOwner != null)
            {
                await _pushNotification.SendNotificationAsync(
                    companyOwner.Id,
                    "Quote Rejected",
                    $"Client has rejected the quote for inspection",
                    new Dictionary<string, string> { ["inspectionId"] = inspectionId.ToString() }
                );
            }

            _logger.LogInformation("Quote {QuoteId} rejected for inspection {InspectionId}", quoteId, inspectionId);

            return true;
        }

        #endregion

        #region Session Management

        public async Task<QRCodeResponseDto> GenerateQRCodeAsync(int inspectionId, int companyUserId)
        {
            var request = await _context.InspectionRequests.FindAsync(inspectionId);
            if (request == null)
            {
                throw new ArgumentException("Inspection request not found");
            }

            var user = await _context.Users.FindAsync(companyUserId);
            if (user == null || user.CompanyId != request.CompanyId)
            {
                throw new UnauthorizedAccessException("Only company members can generate QR codes");
            }

            // Generate verification code
            var verificationCode = GenerateVerificationCode();
            var expiresAt = DateTime.UtcNow.AddHours(4);

            // Create or update session
            var session = await _context.InspectionSessions
                .FirstOrDefaultAsync(s => s.InspectionRequestId == inspectionId);

            if (session == null)
            {
                session = new InspectionSession
                {
                    InspectionRequestId = inspectionId,
                    CompanyUserId = companyUserId
                };
                _context.InspectionSessions.Add(session);
            }

            session.VerificationCode = verificationCode;
            session.CodeGeneratedAt = DateTime.UtcNow;
            session.CodeExpiresAt = expiresAt;

            await _context.SaveChangesAsync();

            return new QRCodeResponseDto
            {
                VerificationCode = verificationCode,
                QrCodeUrl = $"constructionapp://inspection/verify/{verificationCode}",
                GeneratedAt = DateTime.UtcNow,
                ExpiresAt = expiresAt
            };
        }

        public async Task<InspectionSessionDto> VerifyStartAsync(int inspectionId, int clientUserId, VerifyInspectionStartDto dto)
        {
            var request = await _context.InspectionRequests
                .Include(r => r.Session)
                .FirstOrDefaultAsync(r => r.Id == inspectionId && r.ClientUserId == clientUserId);

            if (request == null)
            {
                throw new ArgumentException("Inspection request not found or access denied");
            }

            if (request.Session == null)
            {
                throw new InvalidOperationException("No active session for this inspection");
            }

            if (request.Session.VerificationCode != dto.VerificationCode)
            {
                throw new InvalidOperationException("Invalid verification code");
            }

            if (request.Session.CodeExpiresAt < DateTime.UtcNow)
            {
                throw new InvalidOperationException("Verification code has expired");
            }

            // Start the inspection
            request.Session.StartedAt = DateTime.UtcNow;
            request.Session.StartMethod = InspectionStartMethod.QRCode;
            request.Session.StartVerifiedByClient = true;
            request.Session.ClientLatitude = dto.Latitude;
            request.Session.ClientLongitude = dto.Longitude;
            request.Session.ClientLocationVerified = dto.Latitude.HasValue && dto.Longitude.HasValue;

            request.Status = InspectionStatus.InProgress;
            request.ActualStartTime = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Inspection {InspectionId} started via QR code verification", inspectionId);

            return MapSessionToDto(request.Session);
        }

        public async Task<InspectionSessionDto> StartInspectionAsync(int inspectionId, int companyUserId, StartInspectionDto dto)
        {
            var request = await _context.InspectionRequests
                .Include(r => r.Session)
                .FirstOrDefaultAsync(r => r.Id == inspectionId);

            if (request == null)
            {
                throw new ArgumentException("Inspection request not found");
            }

            var user = await _context.Users.FindAsync(companyUserId);
            if (user == null || user.CompanyId != request.CompanyId)
            {
                throw new UnauthorizedAccessException("Only company members can start inspections");
            }

            // Create or update session
            if (request.Session == null)
            {
                request.Session = new InspectionSession
                {
                    InspectionRequestId = inspectionId,
                    CompanyUserId = companyUserId
                };
                _context.InspectionSessions.Add(request.Session);
            }

            request.Session.StartedAt = DateTime.UtcNow;
            request.Session.StartMethod = (InspectionStartMethod)dto.StartMethod;
            request.Session.SessionNotes = dto.SessionNotes;

            if ((InspectionStartMethod)dto.StartMethod == InspectionStartMethod.ApprovalRequest)
            {
                // Request client approval
                await _pushNotification.SendNotificationAsync(
                    request.ClientUserId,
                    "Inspection Start Request",
                    "The company is ready to start the inspection. Please approve to begin.",
                    new Dictionary<string, string> { ["inspectionId"] = inspectionId.ToString(), ["action"] = "approveStart" }
                );
            }
            else
            {
                request.Status = InspectionStatus.InProgress;
                request.ActualStartTime = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Inspection {InspectionId} started by company user {UserId}", inspectionId, companyUserId);

            return MapSessionToDto(request.Session);
        }

        public async Task<InspectionSessionDto> ApproveStartAsync(int inspectionId, int clientUserId)
        {
            var request = await _context.InspectionRequests
                .Include(r => r.Session)
                .FirstOrDefaultAsync(r => r.Id == inspectionId && r.ClientUserId == clientUserId);

            if (request == null || request.Session == null)
            {
                throw new ArgumentException("Inspection request not found or access denied");
            }

            request.Session.StartVerifiedByClient = true;
            request.Status = InspectionStatus.InProgress;
            request.ActualStartTime = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Notify company
            await _pushNotification.SendNotificationAsync(
                request.Session.CompanyUserId,
                "Inspection Approved",
                "Client has approved the inspection start",
                new Dictionary<string, string> { ["inspectionId"] = inspectionId.ToString() }
            );

            _logger.LogInformation("Inspection {InspectionId} start approved by client", inspectionId);

            return MapSessionToDto(request.Session);
        }

        public async Task<bool> CompleteInspectionAsync(int inspectionId, int companyUserId, string? notes)
        {
            var request = await _context.InspectionRequests
                .Include(r => r.Session)
                .FirstOrDefaultAsync(r => r.Id == inspectionId);

            if (request == null)
            {
                throw new ArgumentException("Inspection request not found");
            }

            var user = await _context.Users.FindAsync(companyUserId);
            if (user == null || user.CompanyId != request.CompanyId)
            {
                throw new UnauthorizedAccessException("Only company members can complete inspections");
            }

            if (request.Status != InspectionStatus.InProgress)
            {
                throw new InvalidOperationException("Inspection must be in progress to complete");
            }

            request.Status = InspectionStatus.Completed;
            request.ActualEndTime = DateTime.UtcNow;
            request.Notes = notes;

            if (request.Session != null)
            {
                request.Session.EndedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Notify client
            await _pushNotification.SendNotificationAsync(
                request.ClientUserId,
                "Inspection Completed",
                "Your inspection has been completed",
                new Dictionary<string, string> { ["inspectionId"] = inspectionId.ToString() }
            );

            _logger.LogInformation("Inspection {InspectionId} completed by company user {UserId}", inspectionId, companyUserId);

            return true;
        }

        public async Task<InspectionSessionDto?> GetSessionAsync(int inspectionId)
        {
            var session = await _context.InspectionSessions
                .Include(s => s.CompanyUser)
                .FirstOrDefaultAsync(s => s.InspectionRequestId == inspectionId);

            return session == null ? null : MapSessionToDto(session);
        }

        #endregion

        #region Documents

        public async Task<InspectionDocumentDto> UploadDocumentAsync(int inspectionId, int userId, UploadInspectionDocumentDto dto, byte[] fileData, string fileName, string mimeType)
        {
            var request = await _context.InspectionRequests.FindAsync(inspectionId);
            if (request == null)
            {
                throw new ArgumentException("Inspection request not found");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }

            var hasAccess = request.ClientUserId == userId || request.CompanyId == user.CompanyId;
            if (!hasAccess)
            {
                throw new UnauthorizedAccessException("Access denied");
            }

            var filePath = await _fileStorage.SaveFileAsync(fileData, $"inspections/{inspectionId}", fileName);

            var document = new InspectionDocument
            {
                InspectionRequestId = inspectionId,
                Type = (InspectionDocumentType)dto.Type,
                FileName = fileName,
                FilePath = filePath,
                FileSize = fileData.Length,
                MimeType = mimeType,
                Description = dto.Description,
                UploadedByUserId = userId,
                UploadedAt = DateTime.UtcNow
            };

            _context.InspectionDocuments.Add(document);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Document {DocumentId} uploaded for inspection {InspectionId}", document.Id, inspectionId);

            return MapDocumentToDto(document);
        }

        public async Task<List<InspectionDocumentDto>> GetDocumentsAsync(int inspectionId)
        {
            var documents = await _context.InspectionDocuments
                .Include(d => d.UploadedByUser)
                .Where(d => d.InspectionRequestId == inspectionId)
                .OrderBy(d => d.DisplayOrder)
                .ThenByDescending(d => d.UploadedAt)
                .ToListAsync();

            return documents.Select(MapDocumentToDto).ToList();
        }

        public async Task<bool> DeleteDocumentAsync(int inspectionId, int documentId, int userId)
        {
            var document = await _context.InspectionDocuments
                .FirstOrDefaultAsync(d => d.Id == documentId && d.InspectionRequestId == inspectionId);

            if (document == null) return false;

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            // Only uploader or company member can delete
            var canDelete = document.UploadedByUserId == userId || 
                           (await _context.InspectionRequests.AnyAsync(r => r.Id == inspectionId && r.CompanyId == user.CompanyId));

            if (!canDelete) return false;

            await _fileStorage.DeleteFileAsync(document.FilePath);
            _context.InspectionDocuments.Remove(document);
            await _context.SaveChangesAsync();

            return true;
        }

        #endregion

        #region Payments

        public async Task<InspectionPaymentDto> ProcessPaymentAsync(int inspectionId, int clientUserId, PayInspectionDto dto)
        {
            var request = await _context.InspectionRequests.FindAsync(inspectionId);
            if (request == null || request.ClientUserId != clientUserId)
            {
                throw new ArgumentException("Inspection request not found or access denied");
            }

            if (!request.InspectionFee.HasValue)
            {
                throw new InvalidOperationException("No inspection fee set");
            }

            var payment = new InspectionPayment
            {
                InspectionRequestId = inspectionId,
                Amount = request.InspectionFee.Value,
                Currency = request.Currency ?? "USD",
                PaymentMethod = dto.PaymentMethod,
                PaidByUserId = clientUserId,
                Status = InspectionPaymentStatus.Pending
            };

            if (dto.PaymentMethod.Equals("Online", StringComparison.OrdinalIgnoreCase))
            {
                // Process online payment (integration with payment gateway)
                payment.PaymentGateway = "Stripe";
                payment.TransactionReference = Guid.NewGuid().ToString(); // Placeholder
                payment.Status = InspectionPaymentStatus.Completed;
                payment.PaidAt = DateTime.UtcNow;
            }
            else if (dto.PaymentMethod.Equals("Cash", StringComparison.OrdinalIgnoreCase))
            {
                payment.Status = InspectionPaymentStatus.Pending;
            }

            _context.InspectionPayments.Add(payment);
            await _context.SaveChangesAsync();

            // Notify company of payment
            var companyOwner = await _context.Users.FirstOrDefaultAsync(u => u.CompanyId == request.CompanyId && u.UserType == UserType.CompanyOwner);
            if (companyOwner != null && payment.Status == InspectionPaymentStatus.Completed)
            {
                await _pushNotification.SendNotificationAsync(
                    companyOwner.Id,
                    "Payment Received",
                    $"Payment received for inspection",
                    new Dictionary<string, string> { ["inspectionId"] = inspectionId.ToString() }
                );
            }

            _logger.LogInformation("Payment {PaymentId} processed for inspection {InspectionId}", payment.Id, inspectionId);

            return MapPaymentToDto(payment);
        }

        public async Task<InspectionPaymentDto> ConfirmCashPaymentAsync(int inspectionId, int companyUserId, ConfirmCashPaymentDto dto)
        {
            var payment = await _context.InspectionPayments
                .Include(p => p.InspectionRequest)
                .FirstOrDefaultAsync(p => p.InspectionRequestId == inspectionId);

            if (payment == null)
            {
                throw new ArgumentException("Payment not found");
            }

            var user = await _context.Users.FindAsync(companyUserId);
            if (user == null || user.CompanyId != payment.InspectionRequest.CompanyId)
            {
                throw new UnauthorizedAccessException("Only company members can confirm cash payments");
            }

            payment.Status = InspectionPaymentStatus.Completed;
            payment.PaidAt = DateTime.UtcNow;
            payment.ConfirmedByUserId = companyUserId;
            payment.ConfirmedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Cash payment confirmed for inspection {InspectionId}", inspectionId);

            return MapPaymentToDto(payment);
        }

        public async Task<InspectionPaymentDto?> GetPaymentAsync(int inspectionId)
        {
            var payment = await _context.InspectionPayments
                .Include(p => p.PaidByUser)
                .FirstOrDefaultAsync(p => p.InspectionRequestId == inspectionId);

            return payment == null ? null : MapPaymentToDto(payment);
        }

        #endregion

        #region Work Requests

        public async Task<InspectionWorkRequestDto> CreateWorkRequestAsync(int inspectionId, int clientUserId, CreateWorkRequestDto dto)
        {
            var request = await _context.InspectionRequests.FindAsync(inspectionId);
            if (request == null || request.ClientUserId != clientUserId)
            {
                throw new ArgumentException("Inspection request not found or access denied");
            }

            if (request.Status != InspectionStatus.Completed)
            {
                throw new InvalidOperationException("Can only request work after inspection is completed");
            }

            var workRequest = new InspectionWorkRequest
            {
                InspectionRequestId = inspectionId,
                ClientUserId = clientUserId,
                Message = dto.Message,
                Status = WorkRequestStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.InspectionWorkRequests.Add(workRequest);
            await _context.SaveChangesAsync();

            // Notify company
            var companyOwner = await _context.Users.FirstOrDefaultAsync(u => u.CompanyId == request.CompanyId && u.UserType == UserType.CompanyOwner);
            if (companyOwner != null)
            {
                await _pushNotification.SendNotificationAsync(
                    companyOwner.Id,
                    "Work Request Received",
                    "Client has requested to start work based on inspection",
                    new Dictionary<string, string> { ["inspectionId"] = inspectionId.ToString() }
                );
            }

            _logger.LogInformation("Work request created for inspection {InspectionId}", inspectionId);

            return MapWorkRequestToDto(workRequest);
        }

        public async Task<InspectionWorkRequestDto> RespondToWorkRequestAsync(int inspectionId, int companyUserId, RespondToWorkRequestDto dto)
        {
            var workRequest = await _context.InspectionWorkRequests
                .Include(w => w.InspectionRequest)
                .FirstOrDefaultAsync(w => w.InspectionRequestId == inspectionId);

            if (workRequest == null)
            {
                throw new ArgumentException("Work request not found");
            }

            var user = await _context.Users.FindAsync(companyUserId);
            if (user == null || user.CompanyId != workRequest.InspectionRequest.CompanyId)
            {
                throw new UnauthorizedAccessException("Only company members can respond to work requests");
            }

            workRequest.Status = dto.Accept ? WorkRequestStatus.Accepted : WorkRequestStatus.Rejected;
            workRequest.CompanyResponse = dto.Response;
            workRequest.RespondedAt = DateTime.UtcNow;
            workRequest.RespondedByUserId = companyUserId;

            await _context.SaveChangesAsync();

            // Notify client
            await _pushNotification.SendNotificationAsync(
                workRequest.ClientUserId,
                dto.Accept ? "Work Request Accepted" : "Work Request Rejected",
                dto.Accept ? "The company has accepted your work request" : "The company has rejected your work request",
                new Dictionary<string, string> { ["inspectionId"] = inspectionId.ToString() }
            );

            _logger.LogInformation("Work request for inspection {InspectionId} {Status}", inspectionId, dto.Accept ? "accepted" : "rejected");

            return MapWorkRequestToDto(workRequest);
        }

        public async Task<int> ConvertToProjectAsync(int inspectionId, int companyUserId)
        {
            var workRequest = await _context.InspectionWorkRequests
                .Include(w => w.InspectionRequest)
                .FirstOrDefaultAsync(w => w.InspectionRequestId == inspectionId);

            if (workRequest == null)
            {
                throw new ArgumentException("Work request not found");
            }

            var user = await _context.Users.FindAsync(companyUserId);
            if (user == null || user.CompanyId != workRequest.InspectionRequest.CompanyId)
            {
                throw new UnauthorizedAccessException("Only company members can convert to project");
            }

            if (workRequest.Status != WorkRequestStatus.Accepted)
            {
                throw new InvalidOperationException("Work request must be accepted first");
            }

            // Create project from inspection
            var inspection = workRequest.InspectionRequest;
            var project = new Project
            {
                ProjectName = inspection.Title,
                Description = inspection.Description,
                CompanyId = inspection.CompanyId,
                Status = "Planning",
                OwnerUserId = inspection.ClientUserId
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            workRequest.Status = WorkRequestStatus.Converted;
            workRequest.ConvertedToProjectId = project.Id;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Inspection {InspectionId} converted to project {ProjectId}", inspectionId, project.Id);

            return project.Id;
        }

        #endregion

        #region Reviews

        public async Task<InspectionReviewDto> CreateReviewAsync(int inspectionId, int clientUserId, CreateInspectionReviewDto dto)
        {
            var request = await _context.InspectionRequests.FindAsync(inspectionId);
            if (request == null || request.ClientUserId != clientUserId)
            {
                throw new ArgumentException("Inspection request not found or access denied");
            }

            if (request.Status != InspectionStatus.Completed)
            {
                throw new InvalidOperationException("Can only review completed inspections");
            }

            var existingReview = await _context.InspectionReviews
                .FirstOrDefaultAsync(r => r.InspectionRequestId == inspectionId);

            if (existingReview != null)
            {
                throw new InvalidOperationException("Review already exists");
            }

            var review = new InspectionReview
            {
                InspectionRequestId = inspectionId,
                ClientUserId = clientUserId,
                Rating = Math.Clamp(dto.Rating, 1, 5),
                Comment = dto.Comment,
                IsPublic = dto.IsPublic,
                CreatedAt = DateTime.UtcNow
            };

            _context.InspectionReviews.Add(review);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Review created for inspection {InspectionId}", inspectionId);

            return MapReviewToDto(review);
        }

        public async Task<InspectionReviewDto?> GetReviewAsync(int inspectionId)
        {
            var review = await _context.InspectionReviews
                .Include(r => r.ClientUser)
                .FirstOrDefaultAsync(r => r.InspectionRequestId == inspectionId);

            return review == null ? null : MapReviewToDto(review);
        }

        public async Task<InspectionReviewDto> RespondToReviewAsync(int inspectionId, int companyUserId, string response)
        {
            var review = await _context.InspectionReviews
                .Include(r => r.InspectionRequest)
                .FirstOrDefaultAsync(r => r.InspectionRequestId == inspectionId);

            if (review == null)
            {
                throw new ArgumentException("Review not found");
            }

            var user = await _context.Users.FindAsync(companyUserId);
            if (user == null || user.CompanyId != review.InspectionRequest.CompanyId)
            {
                throw new UnauthorizedAccessException("Only company members can respond to reviews");
            }

            review.CompanyResponse = response;
            review.CompanyResponseUserId = companyUserId;
            review.CompanyRespondedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapReviewToDto(review);
        }

        #endregion

        #region Cost Estimates

        public async Task<InspectionCostEstimateDto> CreateCostEstimateAsync(int inspectionId, int companyUserId, CreateCostEstimateDto dto)
        {
            var request = await _context.InspectionRequests.FindAsync(inspectionId);
            if (request == null)
            {
                throw new ArgumentException("Inspection request not found");
            }

            var user = await _context.Users.FindAsync(companyUserId);
            if (user == null || user.CompanyId != request.CompanyId)
            {
                throw new UnauthorizedAccessException("Only company members can create cost estimates");
            }

            var estimate = new InspectionCostEstimate
            {
                InspectionRequestId = inspectionId,
                TotalEstimatedCost = dto.Items.Sum(i => i.Quantity * i.UnitPrice),
                Currency = "USD",
                Summary = dto.Summary,
                Terms = dto.Terms,
                ValidUntil = dto.ValidUntil,
                CreatedByUserId = companyUserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.InspectionCostEstimates.Add(estimate);
            await _context.SaveChangesAsync();

            foreach (var item in dto.Items)
            {
                var estimateItem = new CostEstimateItem
                {
                    InspectionCostEstimateId = estimate.Id,
                    Category = item.Category,
                    Description = item.Description,
                    Quantity = item.Quantity,
                    Unit = item.Unit,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.Quantity * item.UnitPrice,
                    Notes = item.Notes
                };
                _context.CostEstimateItems.Add(estimateItem);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Cost estimate created for inspection {InspectionId}", inspectionId);

            return await GetCostEstimateAsync(inspectionId) ?? throw new InvalidOperationException("Failed to retrieve cost estimate");
        }

        public async Task<InspectionCostEstimateDto?> GetCostEstimateAsync(int inspectionId)
        {
            var estimate = await _context.InspectionCostEstimates
                .Include(e => e.Items)
                .Include(e => e.CreatedByUser)
                .FirstOrDefaultAsync(e => e.InspectionRequestId == inspectionId);

            if (estimate == null) return null;

            return new InspectionCostEstimateDto
            {
                Id = estimate.Id,
                InspectionRequestId = estimate.InspectionRequestId,
                TotalEstimatedCost = estimate.TotalEstimatedCost,
                Currency = estimate.Currency,
                Summary = estimate.Summary,
                Terms = estimate.Terms,
                CreatedAt = estimate.CreatedAt,
                ValidUntil = estimate.ValidUntil,
                Items = estimate.Items.Select(i => new CostEstimateItemDto
                {
                    Id = i.Id,
                    Category = i.Category,
                    Description = i.Description,
                    Quantity = i.Quantity,
                    Unit = i.Unit,
                    UnitPrice = i.UnitPrice,
                    TotalPrice = i.TotalPrice,
                    Notes = i.Notes
                }).ToList()
            };
        }

        public async Task<InspectionCostEstimateDto> UpdateCostEstimateAsync(int inspectionId, int estimateId, int companyUserId, CreateCostEstimateDto dto)
        {
            var estimate = await _context.InspectionCostEstimates
                .Include(e => e.InspectionRequest)
                .Include(e => e.Items)
                .FirstOrDefaultAsync(e => e.Id == estimateId && e.InspectionRequestId == inspectionId);

            if (estimate == null)
            {
                throw new ArgumentException("Cost estimate not found");
            }

            var user = await _context.Users.FindAsync(companyUserId);
            if (user == null || user.CompanyId != estimate.InspectionRequest.CompanyId)
            {
                throw new UnauthorizedAccessException("Only company members can update cost estimates");
            }

            // Remove existing items
            _context.CostEstimateItems.RemoveRange(estimate.Items);

            estimate.TotalEstimatedCost = dto.Items.Sum(i => i.Quantity * i.UnitPrice);
            estimate.Summary = dto.Summary;
            estimate.Terms = dto.Terms;
            estimate.ValidUntil = dto.ValidUntil;

            foreach (var item in dto.Items)
            {
                var estimateItem = new CostEstimateItem
                {
                    InspectionCostEstimateId = estimate.Id,
                    Category = item.Category,
                    Description = item.Description,
                    Quantity = item.Quantity,
                    Unit = item.Unit,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.Quantity * item.UnitPrice,
                    Notes = item.Notes
                };
                _context.CostEstimateItems.Add(estimateItem);
            }

            await _context.SaveChangesAsync();

            return await GetCostEstimateAsync(inspectionId) ?? throw new InvalidOperationException("Failed to retrieve cost estimate");
        }

        #endregion

        #region Rescheduling

        public async Task<InspectionRescheduleRequestDto> CreateRescheduleRequestAsync(int inspectionId, int userId, CreateRescheduleRequestDto dto)
        {
            var request = await _context.InspectionRequests.FindAsync(inspectionId);
            if (request == null)
            {
                throw new ArgumentException("Inspection request not found");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }

            var isClient = request.ClientUserId == userId;
            var isCompany = request.CompanyId == user.CompanyId;

            if (!isClient && !isCompany)
            {
                throw new UnauthorizedAccessException("Access denied");
            }

            var reschedule = new InspectionRescheduleRequest
            {
                InspectionRequestId = inspectionId,
                RequestedByUserId = userId,
                ProposedDate = dto.ProposedDate,
                ProposedTimeStart = dto.ProposedTimeStart,
                ProposedTimeEnd = dto.ProposedTimeEnd,
                Reason = dto.Reason,
                Status = RescheduleStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.InspectionRescheduleRequests.Add(reschedule);
            await _context.SaveChangesAsync();

            // Notify the other party
            var notifyUserId = isClient ? (await _context.Users.FirstOrDefaultAsync(u => u.CompanyId == request.CompanyId && u.UserType == UserType.CompanyOwner))?.Id : request.ClientUserId;
            if (notifyUserId.HasValue)
            {
                await _pushNotification.SendNotificationAsync(
                    notifyUserId.Value,
                    "Reschedule Request",
                    "A reschedule request has been submitted for the inspection",
                    new Dictionary<string, string> { ["inspectionId"] = inspectionId.ToString() }
                );
            }

            return MapRescheduleToDto(reschedule);
        }

        public async Task<InspectionRescheduleRequestDto> RespondToRescheduleAsync(int inspectionId, int rescheduleId, int userId, RespondToRescheduleDto dto)
        {
            var reschedule = await _context.InspectionRescheduleRequests
                .Include(r => r.InspectionRequest)
                .FirstOrDefaultAsync(r => r.Id == rescheduleId && r.InspectionRequestId == inspectionId);

            if (reschedule == null)
            {
                throw new ArgumentException("Reschedule request not found");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }

            var request = reschedule.InspectionRequest;
            var isClient = request.ClientUserId == userId;
            var isCompany = request.CompanyId == user.CompanyId;

            // Only the other party can respond
            var canRespond = (reschedule.RequestedByUserId == userId) == false && (isClient || isCompany);
            if (!canRespond)
            {
                throw new UnauthorizedAccessException("Cannot respond to your own reschedule request");
            }

            reschedule.Status = dto.Accept ? RescheduleStatus.Accepted : RescheduleStatus.Rejected;
            reschedule.RespondedAt = DateTime.UtcNow;
            reschedule.RespondedByUserId = userId;
            reschedule.ResponseNotes = dto.Notes;

            if (dto.Accept)
            {
                request.ScheduledDate = reschedule.ProposedDate;
                request.ScheduledTimeStart = reschedule.ProposedTimeStart;
                request.ScheduledTimeEnd = reschedule.ProposedTimeEnd;
            }

            await _context.SaveChangesAsync();

            return MapRescheduleToDto(reschedule);
        }

        public async Task<List<InspectionRescheduleRequestDto>> GetRescheduleRequestsAsync(int inspectionId)
        {
            var requests = await _context.InspectionRescheduleRequests
                .Include(r => r.RequestedByUser)
                .Where(r => r.InspectionRequestId == inspectionId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return requests.Select(MapRescheduleToDto).ToList();
        }

        #endregion

        #region Chat

        public async Task<InspectionChatMessageDto> SendMessageAsync(int inspectionId, int userId, SendChatMessageDto dto)
        {
            var request = await _context.InspectionRequests.FindAsync(inspectionId);
            if (request == null)
            {
                throw new ArgumentException("Inspection request not found");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }

            var hasAccess = request.ClientUserId == userId || request.CompanyId == user.CompanyId;
            if (!hasAccess)
            {
                throw new UnauthorizedAccessException("Access denied");
            }

            var message = new InspectionChatMessage
            {
                InspectionRequestId = inspectionId,
                SenderUserId = userId,
                Message = dto.Message,
                CreatedAt = DateTime.UtcNow
            };

            _context.InspectionChatMessages.Add(message);
            await _context.SaveChangesAsync();

            return MapChatMessageToDto(message, user);
        }

        public async Task<List<InspectionChatMessageDto>> GetMessagesAsync(int inspectionId, int userId, int? afterId = null)
        {
            var request = await _context.InspectionRequests.FindAsync(inspectionId);
            if (request == null)
            {
                throw new ArgumentException("Inspection request not found");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }

            var hasAccess = request.ClientUserId == userId || request.CompanyId == user.CompanyId;
            if (!hasAccess)
            {
                throw new UnauthorizedAccessException("Access denied");
            }

            var query = _context.InspectionChatMessages
                .Include(m => m.SenderUser)
                .Where(m => m.InspectionRequestId == inspectionId);

            if (afterId.HasValue)
            {
                query = query.Where(m => m.Id > afterId.Value);
            }

            var messages = await query
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            return messages.Select(m => MapChatMessageToDto(m, m.SenderUser)).ToList();
        }

        public async Task<int> MarkMessagesAsReadAsync(int inspectionId, int userId)
        {
            var messages = await _context.InspectionChatMessages
                .Where(m => m.InspectionRequestId == inspectionId && m.SenderUserId != userId && !m.IsRead)
                .ToListAsync();

            foreach (var message in messages)
            {
                message.IsRead = true;
                message.ReadAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return messages.Count;
        }

        #endregion

        #region Checklists

        public async Task<List<InspectionChecklistTemplateDto>> GetChecklistTemplatesAsync(int companyId, int? propertyType = null)
        {
            var query = _context.InspectionChecklistTemplates
                .Include(t => t.Items)
                .Where(t => t.CompanyId == companyId && t.IsActive);

            if (propertyType.HasValue)
            {
                query = query.Where(t => t.PropertyType == null || t.PropertyType == (PropertyType)propertyType.Value);
            }

            var templates = await query.ToListAsync();

            return templates.Select(t => new InspectionChecklistTemplateDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                PropertyType = (int?)t.PropertyType,
                IsActive = t.IsActive,
                Items = t.Items.OrderBy(i => i.DisplayOrder).Select(i => new InspectionChecklistItemDto
                {
                    Id = i.Id,
                    Question = i.Question,
                    Description = i.Description,
                    ResponseType = i.ResponseType,
                    IsRequired = i.IsRequired,
                    DisplayOrder = i.DisplayOrder
                }).ToList()
            }).ToList();
        }

        public async Task<InspectionChecklistTemplateDto> CreateChecklistTemplateAsync(int companyUserId, InspectionChecklistTemplateDto dto)
        {
            var user = await _context.Users.FindAsync(companyUserId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }

            var template = new InspectionChecklistTemplate
            {
                CompanyId = user.CompanyId!.Value,
                Name = dto.Name,
                Description = dto.Description,
                PropertyType = dto.PropertyType.HasValue ? (PropertyType)dto.PropertyType.Value : null,
                IsActive = dto.IsActive,
                CreatedByUserId = companyUserId
            };

            _context.InspectionChecklistTemplates.Add(template);
            await _context.SaveChangesAsync();

            foreach (var item in dto.Items)
            {
                var checklistItem = new InspectionChecklistItem
                {
                    InspectionChecklistTemplateId = template.Id,
                    Question = item.Question,
                    Description = item.Description,
                    ResponseType = item.ResponseType,
                    IsRequired = item.IsRequired,
                    DisplayOrder = item.DisplayOrder
                };
                _context.InspectionChecklistItems.Add(checklistItem);
            }

            await _context.SaveChangesAsync();

            dto.Id = template.Id;
            return dto;
        }

        public async Task<bool> ApplyChecklistAsync(int inspectionId, int templateId, int companyUserId)
        {
            var template = await _context.InspectionChecklistTemplates
                .Include(t => t.Items)
                .FirstOrDefaultAsync(t => t.Id == templateId);

            if (template == null) return false;

            foreach (var item in template.Items)
            {
                var response = new InspectionChecklistResponse
                {
                    InspectionRequestId = inspectionId,
                    ChecklistItemId = item.Id,
                    RespondedByUserId = companyUserId
                };
                _context.InspectionChecklistResponses.Add(response);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<InspectionChecklistResponseDto> SubmitChecklistResponseAsync(int inspectionId, int companyUserId, SubmitChecklistResponseDto dto)
        {
            var checklistItem = await _context.InspectionChecklistItems.FindAsync(dto.ChecklistItemId);
            if (checklistItem == null)
            {
                throw new ArgumentException("Checklist item not found");
            }

            var response = await _context.InspectionChecklistResponses
                .FirstOrDefaultAsync(r => r.InspectionRequestId == inspectionId && r.ChecklistItemId == dto.ChecklistItemId);

            if (response == null)
            {
                response = new InspectionChecklistResponse
                {
                    InspectionRequestId = inspectionId,
                    ChecklistItemId = dto.ChecklistItemId,
                    RespondedByUserId = companyUserId
                };
                _context.InspectionChecklistResponses.Add(response);
            }

            response.ResponseValue = dto.ResponseValue;
            response.Notes = dto.Notes;
            response.RespondedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new InspectionChecklistResponseDto
            {
                Id = response.Id,
                ChecklistItemId = response.ChecklistItemId,
                Question = checklistItem.Question,
                ResponseValue = response.ResponseValue,
                Notes = response.Notes,
                PhotoPath = response.PhotoPath,
                RespondedAt = response.RespondedAt
            };
        }

        public async Task<List<InspectionChecklistResponseDto>> GetChecklistResponsesAsync(int inspectionId)
        {
            var responses = await _context.InspectionChecklistResponses
                .Include(r => r.ChecklistItem)
                .Where(r => r.InspectionRequestId == inspectionId)
                .ToListAsync();

            return responses.Select(r => new InspectionChecklistResponseDto
            {
                Id = r.Id,
                ChecklistItemId = r.ChecklistItemId,
                Question = r.ChecklistItem.Question,
                ResponseValue = r.ResponseValue,
                Notes = r.Notes,
                PhotoPath = r.PhotoPath,
                RespondedAt = r.RespondedAt
            }).ToList();
        }

        #endregion

        #region Team Management

        public async Task<InspectionTeamMemberDto> AssignTeamMemberAsync(int inspectionId, int companyUserId, AssignTeamMemberDto dto)
        {
            var request = await _context.InspectionRequests.FindAsync(inspectionId);
            if (request == null)
            {
                throw new ArgumentException("Inspection request not found");
            }

            var user = await _context.Users.FindAsync(companyUserId);
            if (user == null || user.CompanyId != request.CompanyId)
            {
                throw new UnauthorizedAccessException("Only company members can assign team");
            }

            var teamMember = new InspectionTeamMember
            {
                InspectionRequestId = inspectionId,
                UserId = dto.UserId,
                Role = dto.Role,
                IsPrimary = dto.IsPrimary,
                AssignedByUserId = companyUserId,
                AssignedAt = DateTime.UtcNow
            };

            _context.InspectionTeamMembers.Add(teamMember);
            await _context.SaveChangesAsync();

            var assignedUser = await _context.Users.FindAsync(dto.UserId);
            return new InspectionTeamMemberDto
            {
                Id = teamMember.Id,
                UserId = dto.UserId,
                UserName = assignedUser?.FullName ?? "",
                Role = teamMember.Role,
                IsPrimary = teamMember.IsPrimary,
                AssignedAt = teamMember.AssignedAt
            };
        }

        public async Task<bool> RemoveTeamMemberAsync(int inspectionId, int teamMemberId, int companyUserId)
        {
            var teamMember = await _context.InspectionTeamMembers
                .Include(t => t.InspectionRequest)
                .FirstOrDefaultAsync(t => t.Id == teamMemberId && t.InspectionRequestId == inspectionId);

            if (teamMember == null) return false;

            var user = await _context.Users.FindAsync(companyUserId);
            if (user == null || user.CompanyId != teamMember.InspectionRequest.CompanyId)
            {
                return false;
            }

            _context.InspectionTeamMembers.Remove(teamMember);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<InspectionTeamMemberDto>> GetTeamMembersAsync(int inspectionId)
        {
            var members = await _context.InspectionTeamMembers
                .Include(t => t.User)
                .Where(t => t.InspectionRequestId == inspectionId)
                .ToListAsync();

            return members.Select(t => new InspectionTeamMemberDto
            {
                Id = t.Id,
                UserId = t.UserId,
                UserName = t.User.FullName,
                Role = t.Role,
                IsPrimary = t.IsPrimary,
                AssignedAt = t.AssignedAt
            }).ToList();
        }

        #endregion

        #region Signatures

        public async Task<InspectionSignatureDto> SubmitSignatureAsync(int inspectionId, int userId, SubmitSignatureDto dto)
        {
            var request = await _context.InspectionRequests.FindAsync(inspectionId);
            if (request == null)
            {
                throw new ArgumentException("Inspection request not found");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }

            var hasAccess = request.ClientUserId == userId || request.CompanyId == user.CompanyId;
            if (!hasAccess)
            {
                throw new UnauthorizedAccessException("Access denied");
            }

            var signature = new InspectionSignature
            {
                InspectionRequestId = inspectionId,
                UserId = userId,
                SignatureData = dto.SignatureData,
                SignerName = dto.SignerName,
                SignerRole = dto.SignerRole,
                SignedAt = DateTime.UtcNow,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude
            };

            _context.InspectionSignatures.Add(signature);
            await _context.SaveChangesAsync();

            return new InspectionSignatureDto
            {
                Id = signature.Id,
                UserId = userId,
                UserName = user.FullName,
                SignerName = signature.SignerName,
                SignerRole = signature.SignerRole,
                SignedAt = signature.SignedAt
            };
        }

        public async Task<List<InspectionSignatureDto>> GetSignaturesAsync(int inspectionId)
        {
            var signatures = await _context.InspectionSignatures
                .Include(s => s.User)
                .Where(s => s.InspectionRequestId == inspectionId)
                .ToListAsync();

            return signatures.Select(s => new InspectionSignatureDto
            {
                Id = s.Id,
                UserId = s.UserId,
                UserName = s.User.FullName,
                SignerName = s.SignerName,
                SignerRole = s.SignerRole,
                SignedAt = s.SignedAt
            }).ToList();
        }

        #endregion

        #region Audio Notes

        public async Task<InspectionAudioNoteDto> UploadAudioNoteAsync(int inspectionId, int userId, byte[] audioData, int durationSeconds)
        {
            var request = await _context.InspectionRequests.FindAsync(inspectionId);
            if (request == null)
            {
                throw new ArgumentException("Inspection request not found");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.CompanyId != request.CompanyId)
            {
                throw new UnauthorizedAccessException("Only company members can upload audio notes");
            }

            var fileName = $"audio_{DateTime.UtcNow:yyyyMMddHHmmss}.m4a";
            var filePath = await _fileStorage.SaveFileAsync(audioData, $"inspections/{inspectionId}/audio", fileName);

            var audioNote = new InspectionAudioNote
            {
                InspectionRequestId = inspectionId,
                FilePath = filePath,
                DurationSeconds = durationSeconds,
                RecordedByUserId = userId,
                RecordedAt = DateTime.UtcNow
            };

            _context.InspectionAudioNotes.Add(audioNote);
            await _context.SaveChangesAsync();

            return new InspectionAudioNoteDto
            {
                Id = audioNote.Id,
                FilePath = audioNote.FilePath,
                DurationSeconds = audioNote.DurationSeconds,
                Transcription = audioNote.Transcription,
                RecordedByName = user.FullName,
                RecordedAt = audioNote.RecordedAt
            };
        }

        public async Task<List<InspectionAudioNoteDto>> GetAudioNotesAsync(int inspectionId)
        {
            var notes = await _context.InspectionAudioNotes
                .Include(n => n.RecordedByUser)
                .Where(n => n.InspectionRequestId == inspectionId)
                .ToListAsync();

            return notes.Select(n => new InspectionAudioNoteDto
            {
                Id = n.Id,
                FilePath = n.FilePath,
                DurationSeconds = n.DurationSeconds,
                Transcription = n.Transcription,
                RecordedByName = n.RecordedByUser.FullName,
                RecordedAt = n.RecordedAt
            }).ToList();
        }

        #endregion

        #region Reports

        public async Task<InspectionReportDto> GenerateReportAsync(int inspectionId, int companyUserId, GenerateReportDto dto)
        {
            var request = await _context.InspectionRequests
                .Include(r => r.Company)
                .Include(r => r.ClientUser)
                .Include(r => r.Documents)
                .Include(r => r.CostEstimate).ThenInclude(c => c.Items)
                .Include(r => r.ChecklistResponses).ThenInclude(c => c.ChecklistItem)
                .FirstOrDefaultAsync(r => r.Id == inspectionId);

            if (request == null)
            {
                throw new ArgumentException("Inspection request not found");
            }

            var user = await _context.Users.FindAsync(companyUserId);
            if (user == null || user.CompanyId != request.CompanyId)
            {
                throw new UnauthorizedAccessException("Only company members can generate reports");
            }

            var reportNumber = $"INS-{DateTime.UtcNow:yyyyMMdd}-{inspectionId:D6}";

            // Generate PDF report (placeholder - would use a PDF library in production)
            var reportContent = GenerateReportContent(request);
            var filePath = await _fileStorage.SaveFileAsync(
                System.Text.Encoding.UTF8.GetBytes(reportContent),
                $"inspections/{inspectionId}/reports",
                $"{reportNumber}.txt"
            );

            var report = new InspectionReport
            {
                InspectionRequestId = inspectionId,
                ReportNumber = reportNumber,
                FilePath = filePath,
                GeneratedByUserId = companyUserId,
                GeneratedAt = DateTime.UtcNow,
                IsSentToClient = dto.SendToClient,
                SentToClientAt = dto.SendToClient ? DateTime.UtcNow : null
            };

            _context.InspectionReports.Add(report);
            await _context.SaveChangesAsync();

            if (dto.SendToClient)
            {
                await _pushNotification.SendNotificationAsync(
                    request.ClientUserId,
                    "Inspection Report Ready",
                    "Your inspection report is ready for download",
                    new Dictionary<string, string> { ["inspectionId"] = inspectionId.ToString() }
                );
            }

            return new InspectionReportDto
            {
                Id = report.Id,
                ReportNumber = report.ReportNumber,
                FilePath = report.FilePath,
                GeneratedByName = user.FullName,
                GeneratedAt = report.GeneratedAt,
                IsSentToClient = report.IsSentToClient,
                SentToClientAt = report.SentToClientAt
            };
        }

        public async Task<InspectionReportDto?> GetReportAsync(int inspectionId)
        {
            var report = await _context.InspectionReports
                .Include(r => r.GeneratedByUser)
                .FirstOrDefaultAsync(r => r.InspectionRequestId == inspectionId);

            if (report == null) return null;

            return new InspectionReportDto
            {
                Id = report.Id,
                ReportNumber = report.ReportNumber,
                FilePath = report.FilePath,
                GeneratedByName = report.GeneratedByUser.FullName,
                GeneratedAt = report.GeneratedAt,
                IsSentToClient = report.IsSentToClient,
                SentToClientAt = report.SentToClientAt
            };
        }

        public async Task<bool> SendReportToClientAsync(int inspectionId, int companyUserId)
        {
            var report = await _context.InspectionReports
                .Include(r => r.InspectionRequest)
                .FirstOrDefaultAsync(r => r.InspectionRequestId == inspectionId);

            if (report == null) return false;

            var user = await _context.Users.FindAsync(companyUserId);
            if (user == null || user.CompanyId != report.InspectionRequest.CompanyId)
            {
                return false;
            }

            report.IsSentToClient = true;
            report.SentToClientAt = DateTime.UtcNow;

            await _pushNotification.SendNotificationAsync(
                report.InspectionRequest.ClientUserId,
                "Inspection Report Ready",
                "Your inspection report is ready for download",
                new Dictionary<string, string> { ["inspectionId"] = inspectionId.ToString() }
            );

            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Analytics

        public async Task<InspectionAnalyticsDto> GetAnalyticsAsync(int companyId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.InspectionRequests.Where(r => r.CompanyId == companyId);

            if (fromDate.HasValue)
            {
                query = query.Where(r => r.CreatedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(r => r.CreatedAt <= toDate.Value);
            }

            var inspections = await query.ToListAsync();

            var completedInspections = inspections.Where(i => i.Status == InspectionStatus.Completed).ToList();
            var totalRevenue = completedInspections.Where(i => i.Payment != null && i.Payment.Status == InspectionPaymentStatus.Completed)
                .Sum(i => i.Payment!.Amount);

            var reviews = await _context.InspectionReviews
                .Include(r => r.InspectionRequest)
                .Where(r => r.InspectionRequest.CompanyId == companyId)
                .ToListAsync();

            var workRequests = await _context.InspectionWorkRequests
                .Include(w => w.InspectionRequest)
                .Where(w => w.InspectionRequest.CompanyId == companyId)
                .ToListAsync();

            var monthlyStats = await _context.InspectionRequests
                .Where(r => r.CompanyId == companyId && r.Status == InspectionStatus.Completed)
                .GroupBy(r => new { r.ActualEndTime!.Value.Year, r.ActualEndTime!.Value.Month })
                .Select(g => new InspectionMonthlyStatsDto
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Count = g.Count(),
                    Revenue = g.Where(i => i.Payment != null && i.Payment.Status == InspectionPaymentStatus.Completed)
                        .Sum(i => i.Payment!.Amount)
                })
                .ToListAsync();

            return new InspectionAnalyticsDto
            {
                TotalInspections = inspections.Count,
                CompletedInspections = completedInspections.Count,
                PendingInspections = inspections.Count(i => i.Status == InspectionStatus.Pending || i.Status == InspectionStatus.Quoted),
                CancelledInspections = inspections.Count(i => i.Status == InspectionStatus.Cancelled),
                TotalRevenue = totalRevenue,
                AverageFee = completedInspections.Any() ? completedInspections.Average(i => i.InspectionFee ?? 0) : 0,
                CompletionRate = inspections.Any() ? (double)completedInspections.Count / inspections.Count * 100 : 0,
                ConversionRate = completedInspections.Any() ? (double)workRequests.Count(w => w.Status == WorkRequestStatus.Converted) / completedInspections.Count * 100 : 0,
                AverageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0,
                MonthlyStats = monthlyStats
            };
        }

        #endregion

        #region Notifications

        public async Task SendInspectionRemindersAsync()
        {
            var now = DateTime.UtcNow;
            var today = now.Date;

            // Get inspections scheduled for today
            var todayInspections = await _context.InspectionRequests
                .Include(r => r.ClientUser)
                .Where(r => r.ScheduledDate.HasValue && r.ScheduledDate.Value.Date == today && r.Status == InspectionStatus.ReadyForInspection)
                .ToListAsync();

            foreach (var inspection in todayInspections)
            {
                // Morning reminder
                if (now.Hour == 8)
                {
                    // Notify client
                    await _pushNotification.SendNotificationAsync(
                        inspection.ClientUserId,
                        "Inspection Today",
                        $"Your inspection is scheduled for today at {inspection.ScheduledTimeStart:hh\\:mm}",
                        new Dictionary<string, string> { ["inspectionId"] = inspection.Id.ToString() }
                    );

                    // Notify company
                    var companyOwner = await _context.Users.FirstOrDefaultAsync(u => u.CompanyId == inspection.CompanyId && u.UserType == UserType.CompanyOwner);
                    if (companyOwner != null)
                    {
                        await _pushNotification.SendNotificationAsync(
                            companyOwner.Id,
                            "Inspection Today",
                            $"Inspection scheduled for today at {inspection.ScheduledTimeStart:hh\\:mm}",
                            new Dictionary<string, string> { ["inspectionId"] = inspection.Id.ToString() }
                        );
                    }
                }

                // 4 hours before
                if (inspection.ScheduledTimeStart.HasValue)
                {
                    var scheduledDateTime = today.Add(inspection.ScheduledTimeStart.Value);
                    var hoursBefore = (scheduledDateTime - now).TotalHours;

                    if (hoursBefore >= 3.9 && hoursBefore <= 4.1)
                    {
                        await _pushNotification.SendNotificationAsync(
                            inspection.ClientUserId,
                            "Inspection in 4 Hours",
                            "Your inspection is in 4 hours",
                            new Dictionary<string, string> { ["inspectionId"] = inspection.Id.ToString() }
                        );
                    }

                    // 1 hour before
                    if (hoursBefore >= 0.9 && hoursBefore <= 1.1)
                    {
                        await _pushNotification.SendNotificationAsync(
                            inspection.ClientUserId,
                            "Inspection in 1 Hour",
                            "Your inspection is in 1 hour",
                            new Dictionary<string, string> { ["inspectionId"] = inspection.Id.ToString() }
                        );
                    }
                }
            }

            _logger.LogInformation("Inspection reminders sent for {Count} inspections", todayInspections.Count);
        }

        #endregion

        #region Private Helper Methods

        private IQueryable<InspectionRequest> ApplyFilter(IQueryable<InspectionRequest> query, InspectionFilterDto filter)
        {
            if (filter.Status.HasValue)
            {
                query = query.Where(r => r.Status == (InspectionStatus)filter.Status.Value);
            }

            if (filter.PropertyType.HasValue)
            {
                query = query.Where(r => r.PropertyType == (PropertyType)filter.PropertyType.Value);
            }

            if (filter.FromDate.HasValue)
            {
                query = query.Where(r => r.CreatedAt >= filter.FromDate.Value);
            }

            if (filter.ToDate.HasValue)
            {
                query = query.Where(r => r.CreatedAt <= filter.ToDate.Value);
            }

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                query = query.Where(r => r.Title.Contains(filter.SearchTerm) || r.Address.Contains(filter.SearchTerm));
            }

            return query;
        }

        private string GenerateVerificationCode()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[6];
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes).Replace("+", "").Replace("/", "").Replace("=", "").Substring(0, 8).ToUpper();
        }

        private string GenerateReportContent(InspectionRequest request)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"Inspection Report - {request.Title}");
            sb.AppendLine($"Report Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm}");
            sb.AppendLine();
            sb.AppendLine($"Property Type: {request.PropertyType}");
            sb.AppendLine($"Address: {request.Address}");
            sb.AppendLine($"Area: {request.ApproximateArea} m²");
            sb.AppendLine();
            sb.AppendLine($"Status: {request.Status}");
            sb.AppendLine($"Scheduled: {request.ScheduledDate:yyyy-MM-dd} {request.ScheduledTimeStart:hh\\:mm} - {request.ScheduledTimeEnd:hh\\:mm}");
            sb.AppendLine();
            sb.AppendLine("Description:");
            sb.AppendLine(request.Description);
            sb.AppendLine();

            if (request.CostEstimate != null)
            {
                sb.AppendLine("Cost Estimate:");
                foreach (var item in request.CostEstimate.Items)
                {
                    sb.AppendLine($"- {item.Description}: {item.TotalPrice:C}");
                }
                sb.AppendLine($"Total: {request.CostEstimate.TotalEstimatedCost:C}");
            }

            return sb.ToString();
        }

        #endregion

        #region Mapping Methods

        private InspectionRequestDto MapToDto(InspectionRequest r)
        {
            return new InspectionRequestDto
            {
                Id = r.Id,
                CompanyId = r.CompanyId,
                CompanyName = r.Company?.Name ?? "",
                ClientUserId = r.ClientUserId,
                ClientName = r.ClientUser?.FullName ?? "",
                PropertyType = (int)r.PropertyType,
                PropertyTypeName = r.PropertyTypeName ?? r.PropertyType.ToString(),
                Title = r.Title,
                Description = r.Description,
                ApproximateArea = r.ApproximateArea,
                Address = r.Address,
                Latitude = r.Latitude,
                Longitude = r.Longitude,
                Status = (int)r.Status,
                StatusName = r.Status.ToString(),
                InspectionFee = r.InspectionFee,
                Currency = r.Currency,
                ScheduledDate = r.ScheduledDate,
                ScheduledTimeStart = r.ScheduledTimeStart,
                ScheduledTimeEnd = r.ScheduledTimeEnd,
                ActualStartTime = r.ActualStartTime,
                ActualEndTime = r.ActualEndTime,
                Notes = r.Notes,
                CreatedAt = r.CreatedAt,
                TimeSlots = r.TimeSlots?.Select(MapTimeSlotToDto).ToList() ?? new List<InspectionTimeSlotDto>(),
                Quotes = r.Quotes?.Select(MapQuoteToDto).ToList() ?? new List<InspectionQuoteDto>(),
                Session = r.Session != null ? MapSessionToDto(r.Session) : null,
                Documents = r.Documents?.Select(MapDocumentToDto).ToList() ?? new List<InspectionDocumentDto>(),
                Payment = r.Payment != null ? MapPaymentToDto(r.Payment) : null,
                WorkRequest = r.WorkRequest != null ? MapWorkRequestToDto(r.WorkRequest) : null,
                Review = r.Review != null ? MapReviewToDto(r.Review) : null,
                CostEstimate = r.CostEstimate != null ? new InspectionCostEstimateDto
                {
                    Id = r.CostEstimate.Id,
                    InspectionRequestId = r.CostEstimate.InspectionRequestId,
                    TotalEstimatedCost = r.CostEstimate.TotalEstimatedCost,
                    Currency = r.CostEstimate.Currency,
                    Summary = r.CostEstimate.Summary,
                    Terms = r.CostEstimate.Terms,
                    CreatedAt = r.CostEstimate.CreatedAt,
                    ValidUntil = r.CostEstimate.ValidUntil,
                    Items = r.CostEstimate.Items?.Select(i => new CostEstimateItemDto
                    {
                        Id = i.Id,
                        Category = i.Category,
                        Description = i.Description,
                        Quantity = i.Quantity,
                        Unit = i.Unit,
                        UnitPrice = i.UnitPrice,
                        TotalPrice = i.TotalPrice,
                        Notes = i.Notes
                    }).ToList() ?? new List<CostEstimateItemDto>()
                } : null,
                TeamMembers = r.TeamMembers?.Select(t => new InspectionTeamMemberDto
                {
                    Id = t.Id,
                    UserId = t.UserId,
                    UserName = t.User?.FullName ?? "",
                    Role = t.Role,
                    IsPrimary = t.IsPrimary,
                    AssignedAt = t.AssignedAt
                }).ToList() ?? new List<InspectionTeamMemberDto>()
            };
        }

        private InspectionRequestListDto MapToListDto(InspectionRequest r)
        {
            return new InspectionRequestListDto
            {
                Id = r.Id,
                CompanyId = r.CompanyId,
                CompanyName = r.Company?.Name ?? "",
                ClientName = r.ClientUser?.FullName ?? "",
                PropertyType = (int)r.PropertyType,
                PropertyTypeName = r.PropertyTypeName ?? r.PropertyType.ToString(),
                Title = r.Title,
                Address = r.Address,
                Status = (int)r.Status,
                StatusName = r.Status.ToString(),
                InspectionFee = r.InspectionFee,
                ScheduledDate = r.ScheduledDate,
                CreatedAt = r.CreatedAt
            };
        }

        private InspectionTimeSlotDto MapTimeSlotToDto(InspectionTimeSlot t)
        {
            return new InspectionTimeSlotDto
            {
                Id = t.Id,
                ProposedBy = (int)t.ProposedBy,
                ProposedByName = t.ProposedBy.ToString(),
                Date = t.Date,
                TimeStart = t.TimeStart,
                TimeEnd = t.TimeEnd,
                IsSelected = t.IsSelected,
                IsAvailable = t.IsAvailable,
                Notes = t.Notes
            };
        }

        private InspectionQuoteDto MapQuoteToDto(InspectionQuote q)
        {
            return new InspectionQuoteDto
            {
                Id = q.Id,
                InspectionRequestId = q.InspectionRequestId,
                CompanyUserId = q.CompanyUserId,
                CompanyUserName = q.CompanyUser?.FullName ?? "",
                InspectionFee = q.InspectionFee,
                Currency = q.Currency,
                ValidUntil = q.ValidUntil,
                Terms = q.Terms,
                Status = (int)q.Status,
                StatusName = q.Status.ToString(),
                CreatedAt = q.CreatedAt,
                RespondedAt = q.RespondedAt,
                RejectionReason = q.RejectionReason
            };
        }

        private InspectionSessionDto MapSessionToDto(InspectionSession s)
        {
            return new InspectionSessionDto
            {
                Id = s.Id,
                VerificationCode = s.VerificationCode,
                CodeGeneratedAt = s.CodeGeneratedAt,
                CodeExpiresAt = s.CodeExpiresAt,
                StartedAt = s.StartedAt,
                EndedAt = s.EndedAt,
                StartMethod = (int)s.StartMethod,
                StartMethodName = s.StartMethod.ToString(),
                StartVerifiedByClient = s.StartVerifiedByClient,
                CompanyUserId = s.CompanyUserId,
                CompanyUserName = s.CompanyUser?.FullName ?? "",
                ClientLocationVerified = s.ClientLocationVerified,
                SessionNotes = s.SessionNotes
            };
        }

        private InspectionDocumentDto MapDocumentToDto(InspectionDocument d)
        {
            return new InspectionDocumentDto
            {
                Id = d.Id,
                Type = (int)d.Type,
                TypeName = d.Type.ToString(),
                FileName = d.FileName,
                FilePath = d.FilePath,
                FileSize = d.FileSize,
                MimeType = d.MimeType,
                Description = d.Description,
                DisplayOrder = d.DisplayOrder,
                UploadedByName = d.UploadedByUser?.FullName ?? "",
                UploadedAt = d.UploadedAt
            };
        }

        private InspectionPaymentDto MapPaymentToDto(InspectionPayment p)
        {
            return new InspectionPaymentDto
            {
                Id = p.Id,
                Amount = p.Amount,
                Currency = p.Currency,
                PaymentMethod = p.PaymentMethod,
                TransactionReference = p.TransactionReference,
                Status = (int)p.Status,
                StatusName = p.Status.ToString(),
                PaidAt = p.PaidAt,
                PaidByName = p.PaidByUser?.FullName ?? ""
            };
        }

        private InspectionWorkRequestDto MapWorkRequestToDto(InspectionWorkRequest w)
        {
            return new InspectionWorkRequestDto
            {
                Id = w.Id,
                InspectionRequestId = w.InspectionRequestId,
                ClientUserId = w.ClientUserId,
                ClientName = w.ClientUser?.FullName ?? "",
                Status = (int)w.Status,
                StatusName = w.Status.ToString(),
                Message = w.Message,
                CompanyResponse = w.CompanyResponse,
                CreatedAt = w.CreatedAt,
                RespondedAt = w.RespondedAt,
                ConvertedToProjectId = w.ConvertedToProjectId
            };
        }

        private InspectionReviewDto MapReviewToDto(InspectionReview r)
        {
            return new InspectionReviewDto
            {
                Id = r.Id,
                InspectionRequestId = r.InspectionRequestId,
                ClientUserId = r.ClientUserId,
                ClientName = r.ClientUser?.FullName ?? "",
                Rating = r.Rating,
                Comment = r.Comment,
                IsPublic = r.IsPublic,
                CreatedAt = r.CreatedAt,
                CompanyResponse = r.CompanyResponse,
                CompanyRespondedAt = r.CompanyRespondedAt
            };
        }

        private InspectionRescheduleRequestDto MapRescheduleToDto(InspectionRescheduleRequest r)
        {
            return new InspectionRescheduleRequestDto
            {
                Id = r.Id,
                InspectionRequestId = r.InspectionRequestId,
                RequestedByUserId = r.RequestedByUserId,
                RequestedByName = r.RequestedByUser?.FullName ?? "",
                ProposedDate = r.ProposedDate,
                ProposedTimeStart = r.ProposedTimeStart,
                ProposedTimeEnd = r.ProposedTimeEnd,
                Reason = r.Reason,
                Status = (int)r.Status,
                StatusName = r.Status.ToString(),
                CreatedAt = r.CreatedAt,
                RespondedAt = r.RespondedAt,
                ResponseNotes = r.ResponseNotes
            };
        }

        private InspectionChatMessageDto MapChatMessageToDto(InspectionChatMessage m, User sender)
        {
            return new InspectionChatMessageDto
            {
                Id = m.Id,
                InspectionRequestId = m.InspectionRequestId,
                SenderUserId = m.SenderUserId,
                SenderName = sender?.FullName ?? "",
                SenderRole = sender?.UserType.ToString() ?? "",
                Message = m.Message,
                AttachmentPath = m.AttachmentPath,
                AttachmentName = m.AttachmentName,
                IsRead = m.IsRead,
                ReadAt = m.ReadAt,
                CreatedAt = m.CreatedAt
            };
        }

        #endregion
    }
}