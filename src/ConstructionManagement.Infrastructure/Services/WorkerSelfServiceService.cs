using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services
{
    public class WorkerSelfServiceService : IWorkerSelfServiceService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<WorkerSelfServiceService> _logger;

        public WorkerSelfServiceService(
            ApplicationDbContext context,
            ILogger<WorkerSelfServiceService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Profile

        public async Task<WorkerProfileDto> GetProfileAsync(int userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return null!;

            var emergencyContacts = await GetEmergencyContactsAsync(userId);
            var bankAccounts = await GetBankAccountsAsync(userId);
            var pendingRequests = await _context.WorkerProfileUpdateRequests
                .Where(r => r.WorkerId == userId && r.Status == "Pending")
                .Select(r => new WorkerProfileUpdateRequestDto
                {
                    Id = r.Id,
                    CompanyId = r.CompanyId,
                    WorkerId = r.WorkerId,
                    WorkerName = user.FullName,
                    FieldName = r.FieldName,
                    OldValue = r.OldValue,
                    NewValue = r.NewValue,
                    Status = r.Status,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return new WorkerProfileDto
            {
                UserId = user.Id,
                Name = user.FullName,
                Email = user.Email ?? "",
                PhoneNumber = user.Phone,
                Address = user.Address,
                ProfilePicture = user.ProfileImageUrl,
                EmergencyContacts = emergencyContacts,
                BankAccounts = bankAccounts,
                PendingRequests = pendingRequests
            };
        }

        public async Task<WorkerProfileUpdateRequestDto> RequestProfileUpdateAsync(int userId, CreateProfileUpdateRequest request, int? companyId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null!;

            // Get old value based on field name
            string? oldValue = request.FieldName switch
            {
                "PhoneNumber" => user.Phone,
                "Address" => user.Address,
                _ => null
            };

            var updateRequest = new WorkerProfileUpdateRequest
            {
                CompanyId = companyId,
                WorkerId = userId,
                FieldName = request.FieldName,
                OldValue = oldValue,
                NewValue = request.NewValue,
                Status = "Pending"
            };

            _context.WorkerProfileUpdateRequests.Add(updateRequest);
            await _context.SaveChangesAsync();

            return new WorkerProfileUpdateRequestDto
            {
                Id = updateRequest.Id,
                CompanyId = updateRequest.CompanyId,
                WorkerId = updateRequest.WorkerId,
                WorkerName = user.FullName,
                FieldName = updateRequest.FieldName,
                OldValue = updateRequest.OldValue,
                NewValue = updateRequest.NewValue,
                Status = updateRequest.Status,
                CreatedAt = updateRequest.CreatedAt
            };
        }

        public async Task<List<WorkerProfileUpdateRequestDto>> GetPendingProfileUpdatesAsync(int? companyId)
        {
            var requests = await _context.WorkerProfileUpdateRequests
                .Include(r => r.Worker)
                .Where(r => r.CompanyId == companyId && r.Status == "Pending")
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return requests.Select(r => new WorkerProfileUpdateRequestDto
            {
                Id = r.Id,
                CompanyId = r.CompanyId,
                WorkerId = r.WorkerId,
                WorkerName = r.Worker?.FullName ?? "",
                FieldName = r.FieldName,
                OldValue = r.OldValue,
                NewValue = r.NewValue,
                Status = r.Status,
                CreatedAt = r.CreatedAt
            }).ToList();
        }

        public async Task<WorkerProfileUpdateRequestDto> ReviewProfileUpdateAsync(int id, ReviewProfileUpdateRequest request, int reviewerId)
        {
            var updateRequest = await _context.WorkerProfileUpdateRequests
                .Include(r => r.Worker)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (updateRequest == null) return null!;

            updateRequest.Status = request.Approve ? "Approved" : "Rejected";
            updateRequest.ReviewedByUserId = reviewerId;
            updateRequest.ReviewedAt = DateTime.UtcNow;
            updateRequest.ReviewNotes = request.Notes;

            // If approved, update the user's profile
            if (request.Approve)
            {
                var user = await _context.Users.FindAsync(updateRequest.WorkerId);
                if (user != null)
                {
                    switch (updateRequest.FieldName)
                    {
                        case "PhoneNumber":
                            user.Phone = updateRequest.NewValue;
                            break;
                        case "Address":
                            user.Address = updateRequest.NewValue;
                            break;
                    }
                }
            }

            await _context.SaveChangesAsync();

            return new WorkerProfileUpdateRequestDto
            {
                Id = updateRequest.Id,
                CompanyId = updateRequest.CompanyId,
                WorkerId = updateRequest.WorkerId,
                WorkerName = updateRequest.Worker?.FullName ?? "",
                FieldName = updateRequest.FieldName,
                OldValue = updateRequest.OldValue,
                NewValue = updateRequest.NewValue,
                Status = updateRequest.Status,
                ReviewedByUserId = updateRequest.ReviewedByUserId,
                ReviewedByName = (await _context.Users.FindAsync(reviewerId))?.FullName,
                ReviewedAt = updateRequest.ReviewedAt,
                ReviewNotes = updateRequest.ReviewNotes,
                CreatedAt = updateRequest.CreatedAt
            };
        }

        #endregion

        #region Emergency Contacts

        public async Task<List<EmergencyContactDto>> GetEmergencyContactsAsync(int userId)
        {
            var contacts = await _context.EmergencyContacts
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.IsPrimary)
                .ThenBy(c => c.Name)
                .ToListAsync();

            return contacts.Select(c => new EmergencyContactDto
            {
                Id = c.Id,
                CompanyId = c.CompanyId,
                UserId = c.UserId,
                Name = c.Name,
                Relationship = c.Relationship,
                PhoneNumber = c.PhoneNumber,
                AlternativePhone = c.AlternativePhone,
                Email = c.Email,
                Address = c.Address,
                IsPrimary = c.IsPrimary
            }).ToList();
        }

        public async Task<EmergencyContactDto> AddEmergencyContactAsync(int userId, CreateEmergencyContactRequest request, int? companyId)
        {
            // If this is primary, unset other primary contacts
            if (request.IsPrimary)
            {
                var existingPrimary = await _context.EmergencyContacts
                    .Where(c => c.UserId == userId && c.IsPrimary)
                    .ToListAsync();

                foreach (var contact in existingPrimary)
                {
                    contact.IsPrimary = false;
                }
            }

            var emergencyContact = new EmergencyContact
            {
                CompanyId = companyId,
                UserId = userId,
                Name = request.Name,
                Relationship = request.Relationship,
                PhoneNumber = request.PhoneNumber,
                AlternativePhone = request.AlternativePhone,
                Email = request.Email,
                Address = request.Address,
                IsPrimary = request.IsPrimary
            };

            _context.EmergencyContacts.Add(emergencyContact);
            await _context.SaveChangesAsync();

            return new EmergencyContactDto
            {
                Id = emergencyContact.Id,
                CompanyId = emergencyContact.CompanyId,
                UserId = emergencyContact.UserId,
                Name = emergencyContact.Name,
                Relationship = emergencyContact.Relationship,
                PhoneNumber = emergencyContact.PhoneNumber,
                AlternativePhone = emergencyContact.AlternativePhone,
                Email = emergencyContact.Email,
                Address = emergencyContact.Address,
                IsPrimary = emergencyContact.IsPrimary
            };
        }

        public async Task<EmergencyContactDto> UpdateEmergencyContactAsync(int id, UpdateEmergencyContactRequest request)
        {
            var contact = await _context.EmergencyContacts.FindAsync(id);
            if (contact == null) return null!;

            // If this is primary, unset other primary contacts
            if (request.IsPrimary)
            {
                var existingPrimary = await _context.EmergencyContacts
                    .Where(c => c.UserId == contact.UserId && c.IsPrimary && c.Id != id)
                    .ToListAsync();

                foreach (var c in existingPrimary)
                {
                    c.IsPrimary = false;
                }
            }

            contact.Name = request.Name;
            contact.Relationship = request.Relationship;
            contact.PhoneNumber = request.PhoneNumber;
            contact.AlternativePhone = request.AlternativePhone;
            contact.Email = request.Email;
            contact.Address = request.Address;
            contact.IsPrimary = request.IsPrimary;

            await _context.SaveChangesAsync();

            return new EmergencyContactDto
            {
                Id = contact.Id,
                CompanyId = contact.CompanyId,
                UserId = contact.UserId,
                Name = contact.Name,
                Relationship = contact.Relationship,
                PhoneNumber = contact.PhoneNumber,
                AlternativePhone = contact.AlternativePhone,
                Email = contact.Email,
                Address = contact.Address,
                IsPrimary = contact.IsPrimary
            };
        }

        public async Task DeleteEmergencyContactAsync(int id, int userId)
        {
            var contact = await _context.EmergencyContacts.FindAsync(id);
            if (contact == null || contact.UserId != userId) return;

            _context.EmergencyContacts.Remove(contact);
            await _context.SaveChangesAsync();
        }

        public async Task SetPrimaryEmergencyContactAsync(int id, int userId)
        {
            var contact = await _context.EmergencyContacts.FindAsync(id);
            if (contact == null || contact.UserId != userId) return;

            // Unset other primary contacts
            var existingPrimary = await _context.EmergencyContacts
                .Where(c => c.UserId == userId && c.IsPrimary)
                .ToListAsync();

            foreach (var c in existingPrimary)
            {
                c.IsPrimary = false;
            }

            contact.IsPrimary = true;
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Bank Accounts

        public async Task<List<BankAccountDto>> GetBankAccountsAsync(int userId)
        {
            var accounts = await _context.BankAccounts
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsActive)
                .ThenBy(a => a.BankName)
                .ToListAsync();

            return accounts.Select(a => new BankAccountDto
            {
                Id = a.Id,
                CompanyId = a.CompanyId,
                UserId = a.UserId,
                BankName = a.BankName,
                AccountNumber = a.AccountNumber,
                AccountHolderName = a.AccountHolderName,
                IBAN = a.IBAN,
                BranchCode = a.BranchCode,
                IsActive = a.IsActive
            }).ToList();
        }

        public async Task<BankAccountDto> AddBankAccountAsync(int userId, CreateBankAccountRequest request, int? companyId)
        {
            // If this is the first account, make it active
            var hasExistingAccounts = await _context.BankAccounts.AnyAsync(a => a.UserId == userId);

            var bankAccount = new BankAccount
            {
                CompanyId = companyId,
                UserId = userId,
                BankName = request.BankName,
                AccountNumber = request.AccountNumber,
                AccountHolderName = request.AccountHolderName,
                IBAN = request.IBAN,
                BranchCode = request.BranchCode,
                IsActive = !hasExistingAccounts // First account is active by default
            };

            _context.BankAccounts.Add(bankAccount);
            await _context.SaveChangesAsync();

            return new BankAccountDto
            {
                Id = bankAccount.Id,
                CompanyId = bankAccount.CompanyId,
                UserId = bankAccount.UserId,
                BankName = bankAccount.BankName,
                AccountNumber = bankAccount.AccountNumber,
                AccountHolderName = bankAccount.AccountHolderName,
                IBAN = bankAccount.IBAN,
                BranchCode = bankAccount.BranchCode,
                IsActive = bankAccount.IsActive
            };
        }

        public async Task<BankAccountDto> UpdateBankAccountAsync(int id, UpdateBankAccountRequest request)
        {
            var account = await _context.BankAccounts.FindAsync(id);
            if (account == null) return null!;

            account.BankName = request.BankName;
            account.AccountNumber = request.AccountNumber;
            account.AccountHolderName = request.AccountHolderName;
            account.IBAN = request.IBAN;
            account.BranchCode = request.BranchCode;
            account.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return new BankAccountDto
            {
                Id = account.Id,
                CompanyId = account.CompanyId,
                UserId = account.UserId,
                BankName = account.BankName,
                AccountNumber = account.AccountNumber,
                AccountHolderName = account.AccountHolderName,
                IBAN = account.IBAN,
                BranchCode = account.BranchCode,
                IsActive = account.IsActive
            };
        }

        public async Task DeleteBankAccountAsync(int id, int userId)
        {
            var account = await _context.BankAccounts.FindAsync(id);
            if (account == null || account.UserId != userId) return;

            _context.BankAccounts.Remove(account);
            await _context.SaveChangesAsync();
        }

        public async Task SetActiveBankAccountAsync(int id, int userId)
        {
            var account = await _context.BankAccounts.FindAsync(id);
            if (account == null || account.UserId != userId) return;

            // Deactivate all other accounts
            var allAccounts = await _context.BankAccounts
                .Where(a => a.UserId == userId)
                .ToListAsync();

            foreach (var a in allAccounts)
            {
                a.IsActive = a.Id == id;
            }

            await _context.SaveChangesAsync();
        }

        #endregion
    }
}
