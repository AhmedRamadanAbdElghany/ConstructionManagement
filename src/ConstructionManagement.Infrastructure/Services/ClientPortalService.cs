using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace ConstructionManagement.Infrastructure.Services
{
    public class ClientPortalService : IClientPortalService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ClientPortalService> _logger;

        public ClientPortalService(ApplicationDbContext context, ILogger<ClientPortalService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Client Portal Settings

        public async Task<ClientPortalSettingsDto?> GetClientPortalSettingsAsync(int companyId)
        {
            var settings = await _context.ClientPortalSettings
                .FirstOrDefaultAsync(s => s.CompanyId == companyId);

            if (settings == null)
            {
                return null;
            }

            return new ClientPortalSettingsDto
            {
                Id = settings.Id,
                CompanyId = settings.CompanyId ?? 0,
                EnableClientPortal = settings.EnableClientPortal,
                AllowProjectProgressView = settings.AllowProjectProgressView,
                AllowDocumentAccess = settings.AllowDocumentAccess,
                AllowPaymentHistoryView = settings.AllowPaymentHistoryView,
                AllowCommunicationHub = settings.AllowCommunicationHub,
                AllowChangeOrderRequests = settings.AllowChangeOrderRequests,
                RequireApprovalForChangeOrders = settings.RequireApprovalForChangeOrders,
                DefaultTheme = settings.DefaultTheme,
                LogoUrl = settings.LogoUrl,
                PrimaryColor = settings.PrimaryColor,
                SecondaryColor = settings.SecondaryColor
            };
        }

        public async Task<ClientPortalSettingsDto> UpdateClientPortalSettingsAsync(int companyId, UpdateClientPortalSettingsRequest request)
        {
            var settings = await _context.ClientPortalSettings
                .FirstOrDefaultAsync(s => s.CompanyId == companyId);

            if (settings == null)
            {
                settings = new ClientPortalSettings
                {
                    CompanyId = companyId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.ClientPortalSettings.Add(settings);
            }

            settings.EnableClientPortal = request.EnableClientPortal;
            settings.AllowProjectProgressView = request.AllowProjectProgressView;
            settings.AllowDocumentAccess = request.AllowDocumentAccess;
            settings.AllowPaymentHistoryView = request.AllowPaymentHistoryView;
            settings.AllowCommunicationHub = request.AllowCommunicationHub;
            settings.AllowChangeOrderRequests = request.AllowChangeOrderRequests;
            settings.RequireApprovalForChangeOrders = request.RequireApprovalForChangeOrders;
            settings.DefaultTheme = request.DefaultTheme;
            settings.LogoUrl = request.LogoUrl;
            settings.PrimaryColor = request.PrimaryColor;
            settings.SecondaryColor = request.SecondaryColor;
            settings.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var result = await GetClientPortalSettingsAsync(companyId);
            return result ?? new ClientPortalSettingsDto();
        }

        #endregion

        #region Client Users

        public async Task<List<ClientUserDto>> GetClientUsersAsync(int companyId)
        {
            var users = await _context.ClientUsers
                .Where(u => u.CompanyId == companyId)
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            return users.Select(u => new ClientUserDto
            {
                Id = u.Id,
                CompanyId = u.CompanyId ?? 0,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                FullName = $"{u.FirstName} {u.LastName}",
                Phone = u.Phone,
                CompanyName = u.CompanyName,
                JobTitle = u.JobTitle,
                IsActive = u.IsActive,
                LastLoginAt = u.LastLoginAt,
                CreatedAt = u.CreatedAt
            }).ToList();
        }

        public async Task<ClientUserDto?> GetClientUserAsync(int clientUserId)
        {
            var user = await _context.ClientUsers
                .FirstOrDefaultAsync(u => u.Id == clientUserId);

            if (user == null) return null;

            return new ClientUserDto
            {
                Id = user.Id,
                CompanyId = user.CompanyId ?? 0,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = $"{user.FirstName} {user.LastName}",
                Phone = user.Phone,
                CompanyName = user.CompanyName,
                JobTitle = user.JobTitle,
                IsActive = user.IsActive,
                LastLoginAt = user.LastLoginAt,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<ClientUserDto> CreateClientUserAsync(int companyId, CreateClientUserRequest request)
        {
            var existingUser = await _context.ClientUsers
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.CompanyId == companyId);

            if (existingUser != null)
            {
                throw new InvalidOperationException("A client user with this email already exists.");
            }

            var user = new ClientUser
            {
                CompanyId = companyId,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                CompanyName = request.CompanyName,
                JobTitle = request.JobTitle,
                PasswordHash = HashPassword(request.Password),
                IsActive = true,
                EmailVerified = false,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            };

            _context.ClientUsers.Add(user);
            await _context.SaveChangesAsync();

            return await GetClientUserAsync(user.Id) ?? throw new InvalidOperationException("Failed to create client user");
        }

        public async Task<ClientUserDto?> UpdateClientUserAsync(int clientUserId, UpdateClientUserRequest request)
        {
            var user = await _context.ClientUsers.FindAsync(clientUserId);
            if (user == null) return null;

            user.FirstName = request.FirstName ?? "";
            user.LastName = request.LastName ?? "";
            user.Phone = request.Phone ?? "";
            user.CompanyName = request.CompanyName ?? "";
            user.JobTitle = request.JobTitle;
            user.IsActive = request.IsActive ?? true;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetClientUserAsync(clientUserId);
        }

        public async Task<bool> DeleteClientUserAsync(int clientUserId)
        {
            var user = await _context.ClientUsers.FindAsync(clientUserId);
            if (user == null) return false;

            _context.ClientUsers.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Client Project Access

        public async Task<List<ClientProjectAccessDto>> GetClientProjectAccessAsync(int clientUserId)
        {
            var accessList = await _context.ClientProjectAccesses
                .Include(a => a.Project)
                .Where(a => a.ClientUserId == clientUserId)
                .OrderByDescending(a => a.GrantedAt)
                .ToListAsync();

            return accessList.Select(a => new ClientProjectAccessDto
            {
                Id = a.Id,
                CompanyId = a.CompanyId ?? 0,
                ProjectId = a.ProjectId ?? 0,
                ProjectName = a.Project?.ProjectName ?? "",
                ClientUserId = a.ClientUserId,
                CanViewProgress = a.CanViewProgress,
                CanViewDocuments = a.CanViewDocuments,
                CanViewPayments = a.CanViewPayments,
                CanSendMessages = a.CanSendMessages,
                CanRequestChanges = a.CanRequestChanges,
                GrantedAt = a.GrantedAt
            }).ToList();
        }

        public async Task<ClientProjectAccessDto> GrantProjectAccessAsync(int companyId, GrantClientProjectAccessRequest request)
        {
            var access = new ClientProjectAccess
            {
                CompanyId = companyId,
                ClientUserId = request.ClientUserId,
                ProjectId = request.ProjectId,
                CanViewProgress = request.CanViewProgress,
                CanViewDocuments = request.CanViewDocuments,
                CanViewPayments = request.CanViewPayments,
                CanSendMessages = request.CanSendMessages,
                CanRequestChanges = request.CanRequestChanges,
                GrantedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _context.ClientProjectAccesses.Add(access);
            await _context.SaveChangesAsync();

            return new ClientProjectAccessDto
            {
                Id = access.Id,
                CompanyId = access.CompanyId ?? 0,
                ProjectId = access.ProjectId ?? 0,
                ClientUserId = access.ClientUserId,
                CanViewProgress = access.CanViewProgress,
                CanViewDocuments = access.CanViewDocuments,
                CanViewPayments = access.CanViewPayments,
                CanSendMessages = access.CanSendMessages,
                CanRequestChanges = access.CanRequestChanges,
                GrantedAt = access.GrantedAt
            };
        }

        public async Task<ClientProjectAccessDto?> UpdateProjectAccessAsync(int accessId, UpdateClientProjectAccessRequest request)
        {
            var access = await _context.ClientProjectAccesses.FindAsync(accessId);
            if (access == null) return null;

            if (request.CanViewProgress.HasValue) access.CanViewProgress = request.CanViewProgress.Value;
            if (request.CanViewDocuments.HasValue) access.CanViewDocuments = request.CanViewDocuments.Value;
            if (request.CanViewPayments.HasValue) access.CanViewPayments = request.CanViewPayments.Value;
            if (request.CanSendMessages.HasValue) access.CanSendMessages = request.CanSendMessages.Value;
            if (request.CanRequestChanges.HasValue) access.CanRequestChanges = request.CanRequestChanges.Value;
            access.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new ClientProjectAccessDto
            {
                Id = access.Id,
                CompanyId = access.CompanyId ?? 0,
                ProjectId = access.ProjectId ?? 0,
                ClientUserId = access.ClientUserId,
                CanViewProgress = access.CanViewProgress,
                CanViewDocuments = access.CanViewDocuments,
                CanViewPayments = access.CanViewPayments,
                CanSendMessages = access.CanSendMessages,
                CanRequestChanges = access.CanRequestChanges,
                GrantedAt = access.GrantedAt
            };
        }

        public async Task<bool> RevokeProjectAccessAsync(int accessId)
        {
            var access = await _context.ClientProjectAccesses.FindAsync(accessId);
            if (access == null) return false;

            _context.ClientProjectAccesses.Remove(access);
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Client Authentication

        public async Task<ClientLoginResponse?> ClientLoginAsync(ClientLoginRequest request)
        {
            var user = await _context.ClientUsers
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                return null;
            }

            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = "jwt-token-placeholder";

            return new ClientLoginResponse
            {
                Token = token,
                ClientUser = new ClientUserDto
                {
                    Id = user.Id,
                    CompanyId = user.CompanyId ?? 0,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    FullName = $"{user.FirstName} {user.LastName}",
                    Phone = user.Phone,
                    CompanyName = user.CompanyName,
                    JobTitle = user.JobTitle,
                    IsActive = user.IsActive,
                    LastLoginAt = user.LastLoginAt,
                    CreatedAt = user.CreatedAt
                },
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };
        }

        public async Task<bool> ChangeClientPasswordAsync(int clientUserId, ChangeClientPasswordRequest request)
        {
            var user = await _context.ClientUsers.FindAsync(clientUserId);
            if (user == null || !VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                return false;
            }

            user.PasswordHash = HashPassword(request.NewPassword);
            user.PasswordChangedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ResetClientPasswordAsync(ResetClientPasswordRequest request)
        {
            var user = await _context.ClientUsers
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null) return true;

            user.ResetToken = Guid.NewGuid().ToString();
            user.ResetTokenExpiry = DateTime.UtcNow.AddHours(24);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Password reset token generated for {Email}", request.Email);

            return true;
        }

        public async Task<bool> SetClientPasswordAsync(SetClientPasswordRequest request)
        {
            var user = await _context.ClientUsers
                .FirstOrDefaultAsync(u => u.ResetToken == request.Token &&
                    u.ResetTokenExpiry > DateTime.UtcNow);

            if (user == null) return false;

            user.PasswordHash = HashPassword(request.NewPassword);
            user.ResetToken = null;
            user.ResetTokenExpiry = null;
            user.PasswordChangedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        #endregion

        #region Client Dashboard

        public async Task<ClientDashboardDto> GetClientDashboardAsync(int clientUserId)
        {
            var user = await _context.ClientUsers.FindAsync(clientUserId);
            string firstName = "";
            string lastName = "";
            string email = "";
            string companyName = "";
            int? companyId = null;

            if (user == null)
            {
                // Fallback to standard User table
                var standardUser = await _context.Users.FindAsync(clientUserId);
                if (standardUser == null)
                {
                     throw new InvalidOperationException("User not found");
                }
                firstName = standardUser.FirstName;
                lastName = standardUser.LastName;
                email = standardUser.Email;
                companyName = "Self Registered"; // Or some default
                companyId = standardUser.CompanyId;
            }
            else
            {
                firstName = user.FirstName;
                lastName = user.LastName;
                email = user.Email;
                companyName = user.CompanyName;
                companyId = user.CompanyId;
            }

            var accessList = await _context.ClientProjectAccesses
                .Include(a => a.Project)
                .Where(a => a.ClientUserId == clientUserId)
                .ToListAsync();

            var projectIds = accessList.Select(a => a.ProjectId ?? 0).ToList();

            var projects = await _context.Projects
                .Where(p => projectIds.Contains(p.Id))
                .ToListAsync();

            var projectSummaries = projects.Select(p => new ClientProjectSummaryDto
            {
                ProjectId = p.Id,
                ProjectName = p.ProjectName,
                Status = p.Status,
                ProgressPercentage = p.ProgressPercentage,
                HasUpdates = false
            }).ToList();

            var unreadMessagesCount = await _context.ClientMessages
                .CountAsync(m => m.ClientUserId == clientUserId && m.Status == "Open");

            var pendingChangeOrdersCount = await _context.ChangeOrderRequests
                .CountAsync(c => c.ClientUserId == clientUserId &&
                    (c.Status == "Submitted" || c.Status == "UnderReview"));

            var allProjectPayments = await _context.ClientPayments
                .Where(p => projectIds.Contains(p.ProjectId))
                .ToListAsync();

            var totalInvoiced = projects.Sum(p => p.TotalContractValue ?? 0);
            var totalPaid = allProjectPayments.Where(p => p.IsConfirmed).Sum(p => p.Amount);

            return new ClientDashboardDto
            {
                ClientUser = new ClientUserDto
                {
                    Id = clientUserId,
                    CompanyId = companyId ?? 0,
                    Email = email,
                    FirstName = firstName,
                    LastName = lastName,
                    FullName = $"{firstName} {lastName}",
                    CompanyName = companyName
                },
                Projects = projectSummaries,
                PaymentSummary = new ClientPaymentSummaryDto
                {
                    TotalInvoiced = totalInvoiced,
                    TotalPaid = totalPaid,
                    PendingAmount = totalInvoiced - totalPaid,
                    OverdueAmount = 0
                },
                UnreadMessagesCount = unreadMessagesCount,
                PendingChangeOrdersCount = pendingChangeOrdersCount
            };
        }

        #endregion

        #region Client Payments

        public async Task<List<ClientPaymentDto>> GetClientPaymentsAsync(int clientUserId, int? projectId)
        {
            var query = _context.ClientPayments.AsQueryable();

            if (projectId.HasValue)
            {
                query = query.Where(p => p.ProjectId == projectId.Value);
            }

            var payments = await query.ToListAsync();

            return payments.Select(p => new ClientPaymentDto
            {
                Id = p.Id,
                ProjectId = p.ProjectId,
                InvoiceNumber = p.PaymentNumber ?? "",
                Amount = p.Amount,
                PaidAmount = p.IsConfirmed ? p.Amount : 0,
                Currency = p.Currency ?? "USD",
                InvoiceDate = p.PaymentDate,
                DueDate = p.DueDate ?? p.PaymentDate.AddDays(30),
                Status = p.IsConfirmed ? "Paid" : "Pending",
                PaymentMethod = null
            }).ToList();
        }

        public async Task<ClientPaymentSummaryDto> GetClientPaymentSummaryAsync(int clientUserId)
        {
            var projectIds = await _context.ClientProjectAccesses
                .Where(a => a.ClientUserId == clientUserId)
                .Select(a => a.ProjectId ?? 0)
                .ToListAsync();

            var payments = await _context.ClientPayments
                .Where(p => projectIds.Contains(p.ProjectId))
                .ToListAsync();

            var projects = await _context.Projects
                .Where(p => projectIds.Contains(p.Id))
                .ToListAsync();

            var totalInvoiced = projects.Sum(p => p.TotalContractValue ?? 0);
            var totalPaid = payments.Where(p => p.IsConfirmed).Sum(p => p.Amount);

            return new ClientPaymentSummaryDto
            {
                TotalInvoiced = totalInvoiced,
                TotalPaid = totalPaid,
                PendingAmount = totalInvoiced - totalPaid,
                OverdueAmount = 0
            };
        }

        #endregion

        #region Client Messages

        public async Task<List<ClientMessageDto>> GetClientMessagesAsync(int clientUserId, string? status)
        {
            var query = _context.ClientMessages.Where(m => m.ClientUserId == clientUserId);

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(m => m.Status == status);
            }

            var messages = await query.OrderByDescending(m => m.CreatedAt).ToListAsync();

            return messages.Select(m => new ClientMessageDto
            {
                Id = m.Id,
                ProjectId = m.ProjectId ?? 0,
                Subject = m.Subject,
                Content = m.Content,
                MessageType = m.MessageType,
                Priority = m.Priority,
                Status = m.Status,
                CreatedAt = m.CreatedAt,
                AttachmentsCount = 0,
                RepliesCount = 0,
                IsUnread = m.Status == "Open"
            }).ToList();
        }

        public async Task<ClientMessageDto?> GetClientMessageAsync(int messageId)
        {
            var message = await _context.ClientMessages.FindAsync(messageId);
            if (message == null) return null;

            return new ClientMessageDto
            {
                Id = message.Id,
                ProjectId = message.ProjectId ?? 0,
                Subject = message.Subject,
                Content = message.Content,
                MessageType = message.MessageType,
                Priority = message.Priority,
                Status = message.Status,
                CreatedAt = message.CreatedAt,
                AttachmentsCount = 0,
                RepliesCount = 0
            };
        }

        public async Task<ClientMessageDto> CreateClientMessageAsync(int clientUserId, CreateClientMessageRequest request)
        {
            var message = new ClientMessage
            {
                ClientUserId = clientUserId,
                ProjectId = request.ProjectId,
                Subject = request.Subject,
                Content = request.Content,
                MessageType = request.MessageType,
                Priority = request.Priority,
                Status = "Open",
                CreatedAt = DateTime.UtcNow
            };

            _context.ClientMessages.Add(message);
            await _context.SaveChangesAsync();

            return await GetClientMessageAsync(message.Id) ?? throw new InvalidOperationException("Failed to create message");
        }

        public async Task<MessageReplyDto> ReplyToMessageAsync(int clientUserId, CreateMessageReplyRequest request)
        {
            var message = await _context.ClientMessages.FindAsync(request.MessageId);
            if (message == null)
            {
                throw new InvalidOperationException("Message not found");
            }

            var reply = new MessageReply
            {
                MessageId = request.MessageId,
                ClientUserId = clientUserId,
                Content = request.Content,
                IsInternal = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.MessageReplies.Add(reply);
            await _context.SaveChangesAsync();

            return new MessageReplyDto
            {
                Id = reply.Id,
                MessageId = reply.MessageId,
                Content = reply.Content,
                CreatedAt = reply.CreatedAt
            };
        }

        public async Task<List<MessageReplyDto>> GetMessageRepliesAsync(int messageId)
        {
            var replies = await _context.MessageReplies
                .Where(r => r.MessageId == messageId)
                .OrderBy(r => r.CreatedAt)
                .ToListAsync();

            return replies.Select(r => new MessageReplyDto
            {
                Id = r.Id,
                MessageId = r.MessageId,
                Content = r.Content,
                CreatedAt = r.CreatedAt
            }).ToList();
        }

        public async Task<bool> MarkMessageAsReadAsync(int messageId)
        {
            var message = await _context.ClientMessages.FindAsync(messageId);
            if (message == null) return false;

            message.Status = "Read";
            message.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Change Orders

        public async Task<List<ChangeOrderRequestDto>> GetChangeOrderRequestsAsync(int clientUserId, int? projectId)
        {
            var query = _context.ChangeOrderRequests.Where(c => c.ClientUserId == clientUserId);

            if (projectId.HasValue)
            {
                query = query.Where(c => c.ProjectId == projectId.Value);
            }

            var requests = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();

            return requests.Select(c => new ChangeOrderRequestDto
            {
                Id = c.Id,
                ProjectId = c.ProjectId ?? 0,
                RequestNumber = c.RequestNumber,
                Title = c.Title,
                Description = c.Description,
                Category = c.Category,
                Priority = c.Priority,
                EstimatedCost = c.EstimatedCost,
                EstimatedDays = c.EstimatedDays,
                Status = c.Status,
                CreatedAt = c.CreatedAt
            }).ToList();
        }

        public async Task<ChangeOrderRequestDto?> GetChangeOrderRequestAsync(int requestId)
        {
            var request = await _context.ChangeOrderRequests.FindAsync(requestId);
            if (request == null) return null;

            return new ChangeOrderRequestDto
            {
                Id = request.Id,
                ProjectId = request.ProjectId ?? 0,
                RequestNumber = request.RequestNumber,
                Title = request.Title,
                Description = request.Description,
                Category = request.Category,
                Priority = request.Priority,
                EstimatedCost = request.EstimatedCost,
                EstimatedDays = request.EstimatedDays,
                Status = request.Status,
                ReviewNotes = request.ReviewNotes,
                ApprovedBudget = decimal.TryParse(request.ApprovedBudget, out var budget) ? budget : null,
                ApprovedDays = request.ApprovedDays,
                CreatedAt = request.CreatedAt
            };
        }

        public async Task<ChangeOrderRequestDto> CreateChangeOrderRequestAsync(int clientUserId, CreateChangeOrderRequestRequest request)
        {
            var requestNumber = $"CO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";

            var changeOrder = new ChangeOrderRequest
            {
                ClientUserId = clientUserId,
                ProjectId = request.ProjectId,
                RequestNumber = requestNumber,
                Title = request.Title,
                Description = request.Description,
                Category = request.Category,
                Priority = request.Priority,
                EstimatedCost = request.EstimatedCost,
                EstimatedDays = request.EstimatedDays,
                Status = "Draft",
                CreatedAt = DateTime.UtcNow
            };

            _context.ChangeOrderRequests.Add(changeOrder);
            await _context.SaveChangesAsync();

            return await GetChangeOrderRequestAsync(changeOrder.Id) ?? throw new InvalidOperationException("Failed to create change order");
        }

        public async Task<ChangeOrderRequestDto?> UpdateChangeOrderRequestAsync(int requestId, UpdateChangeOrderRequestRequest request)
        {
            var changeOrder = await _context.ChangeOrderRequests.FindAsync(requestId);
            if (changeOrder == null || changeOrder.Status != "Draft")
            {
                return null;
            }

            changeOrder.Title = request.Title ?? "";
            changeOrder.Description = request.Description ?? "";
            changeOrder.Category = request.Category ?? "";
            changeOrder.Priority = request.Priority ?? "";
            changeOrder.EstimatedCost = request.EstimatedCost ?? 0;
            changeOrder.EstimatedDays = request.EstimatedDays ?? 0;
            changeOrder.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetChangeOrderRequestAsync(requestId);
        }

        public async Task<bool> CancelChangeOrderRequestAsync(int requestId)
        {
            var changeOrder = await _context.ChangeOrderRequests.FindAsync(requestId);
            if (changeOrder == null || changeOrder.Status != "Draft")
            {
                return false;
            }

            _context.ChangeOrderRequests.Remove(changeOrder);
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Client Project Progress

        public async Task<ClientProjectProgressDto?> GetClientProjectProgressAsync(int clientUserId, int projectId)
        {
            var hasAccess = await _context.ClientProjectAccesses
                .AnyAsync(a => a.ClientUserId == clientUserId && a.ProjectId == projectId && a.CanViewProgress);

            if (!hasAccess)
            {
                return null;
            }

            var project = await _context.Projects.FindAsync(projectId);
            if (project == null) return null;

            return new ClientProjectProgressDto
            {
                ProjectId = project.Id,
                ProjectName = project.ProjectName,
                Status = project.Status.ToString(),
                OverallProgress = 0,
                Description = project.Description ?? ""
            };
        }

        #endregion

        #region Client Activities

        public async Task<List<ClientActivityDto>> GetClientActivitiesAsync(int clientUserId, int count)
        {
            var activities = await _context.ClientActivityLogs
                .Where(a => a.ClientUserId == clientUserId)
                .OrderByDescending(a => a.CreatedAt)
                .Take(count)
                .ToListAsync();

            return activities.Select(a => new ClientActivityDto
            {
                Id = a.Id,
                ProjectId = a.ProjectId ?? 0,
                ActivityType = a.ActivityType,
                Description = a.Description,
                CreatedAt = a.CreatedAt
            }).ToList();
        }

        #endregion

        #region Admin Message Management

        public async Task<List<ClientMessageDto>> GetAllClientMessagesAsync(int companyId, string? status, int? assignedTo)
        {
            var query = _context.ClientMessages.Where(m => m.CompanyId == companyId);

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(m => m.Status == status);
            }

            if (assignedTo.HasValue)
            {
                query = query.Where(m => m.AssignedToUserId == assignedTo.Value);
            }

            var messages = await query.OrderByDescending(m => m.CreatedAt).ToListAsync();

            return messages.Select(m => new ClientMessageDto
            {
                Id = m.Id,
                ProjectId = m.ProjectId ?? 0,
                Subject = m.Subject,
                Content = m.Content,
                MessageType = m.MessageType,
                Priority = m.Priority,
                Status = m.Status,
                AssignedToName = m.AssignedToUser?.FirstName,
                CreatedAt = m.CreatedAt,
                AttachmentsCount = 0,
                RepliesCount = 0
            }).ToList();
        }

        public async Task<ClientMessageDto?> AssignMessageAsync(int messageId, int assignedToUserId)
        {
            var message = await _context.ClientMessages.FindAsync(messageId);
            if (message == null) return null;

            message.AssignedToUserId = assignedToUserId;
            message.Status = "InProgress";
            await _context.SaveChangesAsync();

            return await GetClientMessageAsync(messageId);
        }

        public async Task<ClientMessageDto?> UpdateMessageStatusAsync(int messageId, string status)
        {
            var message = await _context.ClientMessages.FindAsync(messageId);
            if (message == null) return null;

            message.Status = status;
            if (status == "Resolved")
            {
                message.ResolvedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return await GetClientMessageAsync(messageId);
        }

        public async Task<ClientMessageDto?> ResolveMessageAsync(int messageId, string resolution)
        {
            var message = await _context.ClientMessages.FindAsync(messageId);
            if (message == null) return null;

            message.Status = "Resolved";
            message.ResolvedAt = DateTime.UtcNow;
            message.Resolution = resolution;
            await _context.SaveChangesAsync();

            return await GetClientMessageAsync(messageId);
        }

        #endregion

        #region Admin Change Order Management

        public async Task<List<ChangeOrderRequestDto>> GetAllChangeOrdersAsync(int companyId, string? status, int? projectId)
        {
            var query = _context.ChangeOrderRequests.Where(c => c.CompanyId == companyId);

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(c => c.Status == status);
            }

            if (projectId.HasValue)
            {
                query = query.Where(c => c.ProjectId == projectId.Value);
            }

            var requests = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();

            return requests.Select(c => new ChangeOrderRequestDto
            {
                Id = c.Id,
                ProjectId = c.ProjectId ?? 0,
                RequestNumber = c.RequestNumber,
                Title = c.Title,
                Description = c.Description,
                Category = c.Category,
                Priority = c.Priority,
                EstimatedCost = c.EstimatedCost,
                EstimatedDays = c.EstimatedDays,
                Status = c.Status,
                ReviewedAt = c.ReviewedAt,
                ReviewNotes = c.ReviewNotes,
                ApprovedBudget = decimal.TryParse(c.ApprovedBudget, out var budget) ? budget : null,
                ApprovedDays = c.ApprovedDays,
                CreatedAt = c.CreatedAt
            }).ToList();
        }

        public async Task<ChangeOrderRequestDto?> ReviewChangeOrderAsync(int requestId, int reviewedByUserId, string status, string? notes, decimal? budget, int? days)
        {
            var request = await _context.ChangeOrderRequests.FindAsync(requestId);
            if (request == null) return null;

            request.Status = status;
            request.ReviewedByUserId = reviewedByUserId;
            request.ReviewedAt = DateTime.UtcNow;
            request.ReviewNotes = notes;

            if (budget.HasValue)
            {
                request.ApprovedBudget = budget.Value.ToString();
            }

            if (days.HasValue)
            {
                request.ApprovedDays = days.Value;
            }

            await _context.SaveChangesAsync();

            return await GetChangeOrderRequestAsync(requestId);
        }

        #endregion

        #region Daily Reports

        public async Task<List<DailyReportListDto>> GetDailyReportsAsync(int clientUserId, DailyReportFilterDto filter)
        {
            var projectIds = await _context.ClientProjectAccesses
                .Where(a => a.ClientUserId == clientUserId && a.CanViewProgress)
                .Select(a => a.ProjectId)
                .ToListAsync();

            if (!projectIds.Any()) return new List<DailyReportListDto>();

            var query = _context.ItemDailyLogs
                .Include(l => l.ProjectItem)
                .ThenInclude(i => i.Project)
                .ThenInclude(p => p.Company)
                .Where(l => projectIds.Contains(l.ProjectItem.ProjectId));

            if (filter.ProjectId.HasValue)
            {
                query = query.Where(l => l.ProjectItem.ProjectId == filter.ProjectId.Value);
            }

            if (filter.FromDate.HasValue)
            {
                query = query.Where(l => l.LogDate.Date >= filter.FromDate.Value.Date);
            }

            if (filter.ToDate.HasValue)
            {
                query = query.Where(l => l.LogDate.Date <= filter.ToDate.Value.Date);
            }

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                query = query.Where(l => l.ProjectItem.ItemName.Contains(filter.SearchTerm) || 
                                       (l.ProgressNotes != null && l.ProgressNotes.Contains(filter.SearchTerm)) ||
                                       (l.DailyWorkDescription != null && l.DailyWorkDescription.Contains(filter.SearchTerm)));
            }

            var logs = await query.ToListAsync();

            var groupedLogs = logs
                .GroupBy(l => new { 
                    l.ProjectItem.ProjectId, 
                    l.ProjectItem.Project.ProjectName, 
                    l.ProjectItem.Project.CompanyId,
                    CompanyName = l.ProjectItem.Project.Company?.Name,
                    LogDate = l.LogDate.Date 
                })
                .Select(g => new DailyReportListDto
                {
                    ProjectId = g.Key.ProjectId,
                    ProjectName = g.Key.ProjectName,
                    CompanyId = g.Key.CompanyId,
                    CompanyName = g.Key.CompanyName,
                    ReportDate = g.Key.LogDate,
                    ItemsCount = g.Count(),
                    AverageProgress = g.Average(l => l.DailyProgressPercentage ?? 0),
                    Summary = g.FirstOrDefault(l => !string.IsNullOrEmpty(l.DailyWorkDescription))?.DailyWorkDescription ?? 
                              g.FirstOrDefault(l => !string.IsNullOrEmpty(l.ProgressNotes))?.ProgressNotes,
                    HasPhotos = _context.SiteMedias.Any(m => m.ProjectId == g.Key.ProjectId && m.CreatedAt.Date == g.Key.LogDate)
                })
                .OrderByDescending(r => r.ReportDate)
                .ThenBy(r => r.ProjectName)
                .ToList();

            return groupedLogs;
        }

        public async Task<DailyReportDetailDto?> GetDailyReportDetailsAsync(int clientUserId, int projectId, DateTime reportDate)
        {
            var hasAccess = await _context.ClientProjectAccesses
                .AnyAsync(a => a.ClientUserId == clientUserId && a.ProjectId == projectId && a.CanViewProgress);

            if (!hasAccess) return null;

            var logs = await _context.ItemDailyLogs
                .Include(l => l.ProjectItem)
                .Where(l => l.ProjectItem.ProjectId == projectId && l.LogDate.Date == reportDate.Date)
                .ToListAsync();

            if (!logs.Any()) return null;

            var project = await _context.Projects
                .Include(p => p.Company)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            var photos = await _context.SiteMedias
                .Where(m => m.ProjectId == projectId && m.CreatedAt.Date == reportDate.Date)
                .ToListAsync();

            return new DailyReportDetailDto
            {
                ProjectId = projectId,
                ProjectName = project?.ProjectName ?? "Unknown Project",
                CompanyId = project?.CompanyId,
                CompanyName = project?.Company?.Name,
                ReportDate = reportDate,
                Logs = logs.Select(l => new DailyLogItemDto
                {
                    ItemId = l.ProjectItemId,
                    ItemName = l.ProjectItem.ItemName,
                    ProgressNotes = l.ProgressNotes ?? l.DailyWorkDescription,
                    Issues = l.ClosingNotes,
                    ProgressPercentage = l.DailyProgressPercentage ?? 0,
                    PhotoUrls = photos
                        .Where(m => m.ProjectItemId == l.ProjectItemId)
                        .Select(m => m.FilePath)
                        .ToList()
                }).ToList()
            };
        }

        #endregion

        public async Task<List<ClientCompanyDto>> GetMyCompaniesAsync(int userId)
        {
            var requests = await _context.JoinRequests
                .Include(r => r.Company)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return requests.Select(r => new ClientCompanyDto
            {
                CompanyId = r.CompanyId,
                CompanyName = r.Company.Name,
                Status = r.Status,
                JoinedAt = r.CreatedAt
            }).ToList();
        }

        #region Helper Methods

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var saltedPassword = password + "ClientPortalSalt";
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
            return Convert.ToBase64String(bytes);
        }

        private static bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }

        #endregion
    }
}
