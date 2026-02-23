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
    public class TrainingService : ITrainingService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TrainingService> _logger;

        public TrainingService(
            ApplicationDbContext context,
            ILogger<TrainingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Training Programs

        public async Task<List<TrainingProgramDto>> GetProgramsAsync(int? categoryId = null, bool? mandatory = null, int? companyId = null)
        {
            var query = _context.TrainingPrograms
                .Include(p => p.Category)
                .Include(p => p.Enrollments)
                .Where(p => p.IsActive)
                .Where(p => p.CompanyId == null || p.CompanyId == companyId)
                .AsQueryable();

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);
            if (mandatory.HasValue)
                query = query.Where(p => p.IsMandatory == mandatory.Value);

            var programs = await query.OrderBy(p => p.Title).ToListAsync();

            return programs.Select(p => new TrainingProgramDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                Code = p.Code,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.Name ?? string.Empty,
                Type = p.Type.ToString(),
                DeliveryMethod = p.DeliveryMethod.ToString(),
                DurationHours = p.DurationHours,
                DurationMinutes = p.DurationMinutes,
                ContentUrl = p.ContentUrl,
                Provider = p.Provider,
                Instructor = p.Instructor,
                IsMandatory = p.IsMandatory,
                IsCertification = p.IsCertification,
                CertificationValidityMonths = p.CertificationValidityMonths,
                PassingScore = p.PassingScore,
                MaxAttempts = p.MaxAttempts,
                Cost = p.Cost,
                IsActive = p.IsActive,
                CompanyId = p.CompanyId,
                EnrollmentCount = p.Enrollments.Count,
                CompletionCount = p.Enrollments.Count(e => e.Status == EnrollmentStatus.Completed)
            }).ToList();
        }

        public async Task<TrainingProgramDto> GetProgramAsync(int id)
        {
            var program = await _context.TrainingPrograms
                .Include(p => p.Category)
                .Include(p => p.Materials)
                .Include(p => p.Sessions)
                .Include(p => p.Enrollments)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (program == null)
                throw new InvalidOperationException($"Training program with ID {id} not found");

            return new TrainingProgramDto
            {
                Id = program.Id,
                Title = program.Title,
                Description = program.Description,
                Code = program.Code,
                CategoryId = program.CategoryId,
                CategoryName = program.Category?.Name ?? string.Empty,
                Type = program.Type.ToString(),
                DeliveryMethod = program.DeliveryMethod.ToString(),
                DurationHours = program.DurationHours,
                DurationMinutes = program.DurationMinutes,
                ContentUrl = program.ContentUrl,
                Provider = program.Provider,
                Instructor = program.Instructor,
                IsMandatory = program.IsMandatory,
                IsCertification = program.IsCertification,
                CertificationValidityMonths = program.CertificationValidityMonths,
                PassingScore = program.PassingScore,
                MaxAttempts = program.MaxAttempts,
                Cost = program.Cost,
                IsActive = program.IsActive,
                CompanyId = program.CompanyId,
                EnrollmentCount = program.Enrollments.Count,
                CompletionCount = program.Enrollments.Count(e => e.Status == EnrollmentStatus.Completed),
                Materials = program.Materials.Where(m => m.IsActive).Select(m => new TrainingMaterialDto
                {
                    Id = m.Id,
                    TrainingProgramId = m.TrainingProgramId,
                    Title = m.Title,
                    Description = m.Description,
                    Type = m.Type.ToString(),
                    FilePath = m.FilePath,
                    ContentUrl = m.ContentUrl,
                    DurationMinutes = m.DurationMinutes,
                    Order = m.Order,
                    IsRequired = m.IsRequired,
                    IsActive = m.IsActive
                }).OrderBy(m => m.Order).ToList(),
                UpcomingSessions = program.Sessions
                    .Where(s => s.StartDate > DateTime.UtcNow && s.Status == SessionStatus.Scheduled)
                    .Select(s => new TrainingSessionDto
                    {
                        Id = s.Id,
                        TrainingProgramId = s.TrainingProgramId,
                        Title = s.Title,
                        StartDate = s.StartDate,
                        EndDate = s.EndDate,
                        Location = s.Location,
                        VirtualMeetingUrl = s.VirtualMeetingUrl,
                        MaxParticipants = s.MaxParticipants,
                        CurrentParticipants = s.CurrentParticipants,
                        AvailableSpots = s.MaxParticipants - s.CurrentParticipants,
                        Instructor = s.Instructor,
                        Status = s.Status.ToString()
                    }).OrderBy(s => s.StartDate).Take(5).ToList()
            };
        }

        public async Task<TrainingProgramDto> CreateProgramAsync(CreateTrainingProgramRequest request, int? companyId = null)
        {
            // Validate enum values
            if (!Enum.TryParse<TrainingType>(request.Type, true, out var trainingType))
            {
                throw new ArgumentException($"Invalid training type: '{request.Type}'. Valid values are: {string.Join(", ", Enum.GetNames<TrainingType>())}");
            }
            
            if (!Enum.TryParse<TrainingDeliveryMethod>(request.DeliveryMethod, true, out var deliveryMethod))
            {
                throw new ArgumentException($"Invalid delivery method: '{request.DeliveryMethod}'. Valid values are: {string.Join(", ", Enum.GetNames<TrainingDeliveryMethod>())}");
            }

            var program = new TrainingProgram
            {
                Title = request.Title,
                Description = request.Description,
                Code = request.Code,
                CategoryId = request.CategoryId,
                Type = trainingType,
                DeliveryMethod = deliveryMethod,
                DurationHours = request.DurationHours,
                DurationMinutes = request.DurationMinutes,
                ContentUrl = request.ContentUrl,
                Provider = request.Provider,
                Instructor = request.Instructor,
                IsMandatory = request.IsMandatory,
                IsCertification = request.IsCertification,
                CertificationValidityMonths = request.CertificationValidityMonths,
                PassingScore = request.PassingScore,
                MaxAttempts = request.MaxAttempts,
                Cost = request.Cost,
                IsActive = true,
                CompanyId = companyId
            };

            _context.TrainingPrograms.Add(program);
            await _context.SaveChangesAsync();

            return await GetProgramAsync(program.Id);
        }

        public async Task<TrainingProgramDto> UpdateProgramAsync(int id, UpdateTrainingProgramRequest request)
        {
            var program = await _context.TrainingPrograms.FindAsync(id);
            if (program == null)
                throw new InvalidOperationException($"Training program with ID {id} not found");

            // Validate enum values
            if (!Enum.TryParse<TrainingType>(request.Type, true, out var trainingType))
            {
                throw new ArgumentException($"Invalid training type: '{request.Type}'. Valid values are: {string.Join(", ", Enum.GetNames<TrainingType>())}");
            }
            
            if (!Enum.TryParse<TrainingDeliveryMethod>(request.DeliveryMethod, true, out var deliveryMethod))
            {
                throw new ArgumentException($"Invalid delivery method: '{request.DeliveryMethod}'. Valid values are: {string.Join(", ", Enum.GetNames<TrainingDeliveryMethod>())}");
            }

            program.Title = request.Title;
            program.Description = request.Description;
            program.Code = request.Code;
            program.CategoryId = request.CategoryId;
            program.Type = trainingType;
            program.DeliveryMethod = deliveryMethod;
            program.DurationHours = request.DurationHours;
            program.DurationMinutes = request.DurationMinutes;
            program.ContentUrl = request.ContentUrl;
            program.Provider = request.Provider;
            program.Instructor = request.Instructor;
            program.IsMandatory = request.IsMandatory;
            program.IsCertification = request.IsCertification;
            program.CertificationValidityMonths = request.CertificationValidityMonths;
            program.PassingScore = request.PassingScore;
            program.MaxAttempts = request.MaxAttempts;
            program.Cost = request.Cost;
            program.IsActive = request.IsActive;

            await _context.SaveChangesAsync();
            return await GetProgramAsync(id);
        }

        public async Task DeleteProgramAsync(int id)
        {
            var program = await _context.TrainingPrograms.FindAsync(id);
            if (program == null)
                throw new InvalidOperationException($"Training program with ID {id} not found");

            program.IsActive = false;
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Training Categories

        public async Task<List<TrainingCategoryDto>> GetCategoriesAsync(int? companyId = null)
        {
            var categories = await _context.TrainingCategories
                .Include(c => c.SubCategories)
                .Include(c => c.Programs)
                .Where(c => c.CompanyId == null || c.CompanyId == companyId)
                .Where(c => c.ParentCategoryId == null)
                .OrderBy(c => c.Name)
                .ToListAsync();

            return categories.Select(c => MapCategoryToDto(c)).ToList();
        }

        public async Task<TrainingCategoryDto> GetCategoryAsync(int id)
        {
            var category = await _context.TrainingCategories
                .Include(c => c.SubCategories)
                .Include(c => c.Programs)
                .Include(c => c.ParentCategory)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                throw new InvalidOperationException($"Category with ID {id} not found");

            return MapCategoryToDto(category);
        }

        public async Task<TrainingCategoryDto> CreateCategoryAsync(CreateTrainingCategoryRequest request, int? companyId = null)
        {
            var category = new TrainingCategory
            {
                Name = request.Name,
                Description = request.Description,
                Color = request.Color,
                Icon = request.Icon,
                ParentCategoryId = request.ParentCategoryId,
                CompanyId = companyId
            };

            _context.TrainingCategories.Add(category);
            await _context.SaveChangesAsync();

            return await GetCategoryAsync(category.Id);
        }

        public async Task<TrainingCategoryDto> UpdateCategoryAsync(int id, UpdateTrainingCategoryRequest request)
        {
            var category = await _context.TrainingCategories.FindAsync(id);
            if (category == null)
                throw new InvalidOperationException($"Category with ID {id} not found");

            category.Name = request.Name;
            category.Description = request.Description;
            category.Color = request.Color;
            category.Icon = request.Icon;
            category.ParentCategoryId = request.ParentCategoryId;

            await _context.SaveChangesAsync();
            return await GetCategoryAsync(id);
        }

        public async Task DeleteCategoryAsync(int id)
        {
            var category = await _context.TrainingCategories
                .Include(c => c.Programs)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                throw new InvalidOperationException($"Category with ID {id} not found");

            if (category.Programs?.Any() == true)
                throw new InvalidOperationException("Cannot delete category with existing programs");

            _context.TrainingCategories.Remove(category);
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Training Sessions

        public async Task<List<TrainingSessionDto>> GetSessionsAsync(int? programId = null, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.TrainingSessions
                .Include(s => s.TrainingProgram)
                .Include(s => s.Enrollments)
                .AsQueryable();

            if (programId.HasValue)
                query = query.Where(s => s.TrainingProgramId == programId.Value);
            if (fromDate.HasValue)
                query = query.Where(s => s.StartDate >= fromDate.Value);
            if (toDate.HasValue)
                query = query.Where(s => s.EndDate <= toDate.Value);

            var sessions = await query.OrderBy(s => s.StartDate).ToListAsync();

            return sessions.Select(s => new TrainingSessionDto
            {
                Id = s.Id,
                TrainingProgramId = s.TrainingProgramId,
                TrainingTitle = s.TrainingProgram?.Title ?? string.Empty,
                Title = s.Title,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                Location = s.Location,
                VirtualMeetingUrl = s.VirtualMeetingUrl,
                MaxParticipants = s.MaxParticipants,
                CurrentParticipants = s.CurrentParticipants,
                AvailableSpots = s.MaxParticipants - s.CurrentParticipants,
                Instructor = s.Instructor,
                Status = s.Status.ToString(),
                Notes = s.Notes
            }).ToList();
        }

        public async Task<TrainingSessionDto> GetSessionAsync(int id)
        {
            var session = await _context.TrainingSessions
                .Include(s => s.TrainingProgram)
                .Include(s => s.Enrollments)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (session == null)
                throw new InvalidOperationException($"Session with ID {id} not found");

            return new TrainingSessionDto
            {
                Id = session.Id,
                TrainingProgramId = session.TrainingProgramId,
                TrainingTitle = session.TrainingProgram?.Title ?? string.Empty,
                Title = session.Title,
                StartDate = session.StartDate,
                EndDate = session.EndDate,
                Location = session.Location,
                VirtualMeetingUrl = session.VirtualMeetingUrl,
                MaxParticipants = session.MaxParticipants,
                CurrentParticipants = session.CurrentParticipants,
                AvailableSpots = session.MaxParticipants - session.CurrentParticipants,
                Instructor = session.Instructor,
                Status = session.Status.ToString(),
                Notes = session.Notes
            };
        }

        public async Task<TrainingSessionDto> CreateSessionAsync(CreateTrainingSessionRequest request)
        {
            var session = new TrainingSession
            {
                TrainingProgramId = request.TrainingProgramId,
                Title = request.Title,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Location = request.Location,
                VirtualMeetingUrl = request.VirtualMeetingUrl,
                MaxParticipants = request.MaxParticipants,
                CurrentParticipants = 0,
                Instructor = request.Instructor,
                Status = SessionStatus.Scheduled,
                Notes = request.Notes
            };

            _context.TrainingSessions.Add(session);
            await _context.SaveChangesAsync();

            return await GetSessionAsync(session.Id);
        }

        public async Task<TrainingSessionDto> UpdateSessionAsync(int id, UpdateTrainingSessionRequest request)
        {
            var session = await _context.TrainingSessions.FindAsync(id);
            if (session == null)
                throw new InvalidOperationException($"Session with ID {id} not found");

            session.Title = request.Title;
            session.StartDate = request.StartDate;
            session.EndDate = request.EndDate;
            session.Location = request.Location;
            session.VirtualMeetingUrl = request.VirtualMeetingUrl;
            session.MaxParticipants = request.MaxParticipants;
            session.Instructor = request.Instructor;
            session.Status = Enum.Parse<SessionStatus>(request.Status);
            session.Notes = request.Notes;

            await _context.SaveChangesAsync();
            return await GetSessionAsync(id);
        }

        public async Task DeleteSessionAsync(int id)
        {
            var session = await _context.TrainingSessions.FindAsync(id);
            if (session == null)
                throw new InvalidOperationException($"Session with ID {id} not found");

            _context.TrainingSessions.Remove(session);
            await _context.SaveChangesAsync();
        }

        public async Task<TrainingSessionDto> EnrollInSessionAsync(int sessionId, int userId)
        {
            var session = await _context.TrainingSessions
                .Include(s => s.TrainingProgram)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null)
                throw new InvalidOperationException($"Session with ID {sessionId} not found");

            if (session.CurrentParticipants >= session.MaxParticipants)
                throw new InvalidOperationException("Session is full");

            var existingEnrollment = await _context.TrainingEnrollments
                .AnyAsync(e => e.SessionId == sessionId && e.UserId == userId);

            if (existingEnrollment)
                throw new InvalidOperationException("User already enrolled in this session");

            var enrollment = new TrainingEnrollment
            {
                TrainingProgramId = session.TrainingProgramId,
                UserId = userId,
                SessionId = sessionId,
                Status = EnrollmentStatus.Enrolled,
                EnrolledAt = DateTime.UtcNow
            };

            _context.TrainingEnrollments.Add(enrollment);
            session.CurrentParticipants++;

            await _context.SaveChangesAsync();
            return await GetSessionAsync(sessionId);
        }

        #endregion

        #region Enrollments

        public async Task<List<TrainingEnrollmentDto>> GetEnrollmentsAsync(int? userId = null, int? programId = null, string? status = null)
        {
            var query = _context.TrainingEnrollments
                .Include(e => e.TrainingProgram).ThenInclude(p => p!.Category)
                .Include(e => e.User)
                .Include(e => e.Session)
                .Include(e => e.ProgressRecords)
                .AsQueryable();

            if (userId.HasValue)
                query = query.Where(e => e.UserId == userId.Value);
            if (programId.HasValue)
                query = query.Where(e => e.TrainingProgramId == programId.Value);
            if (!string.IsNullOrEmpty(status) && Enum.TryParse<EnrollmentStatus>(status, out var enrollmentStatus))
                query = query.Where(e => e.Status == enrollmentStatus);

            var enrollments = await query.OrderByDescending(e => e.EnrolledAt).ToListAsync();

            return enrollments.Select(MapEnrollmentToDto).ToList();
        }

        public async Task<TrainingEnrollmentDto> GetEnrollmentAsync(int id)
        {
            var enrollment = await _context.TrainingEnrollments
                .Include(e => e.TrainingProgram).ThenInclude(p => p!.Category)
                .Include(e => e.User)
                .Include(e => e.Session)
                .Include(e => e.ProgressRecords)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (enrollment == null)
                throw new InvalidOperationException($"Enrollment with ID {id} not found");

            return MapEnrollmentToDto(enrollment);
        }

        public async Task<TrainingEnrollmentDto> EnrollUserAsync(EnrollUserRequest request, int enrolledByUserId)
        {
            var existingEnrollment = await _context.TrainingEnrollments
                .AnyAsync(e => e.TrainingProgramId == request.TrainingProgramId && e.UserId == request.UserId);

            if (existingEnrollment)
                throw new InvalidOperationException("User already enrolled in this training");

            var enrollment = new TrainingEnrollment
            {
                TrainingProgramId = request.TrainingProgramId,
                UserId = request.UserId,
                SessionId = request.SessionId,
                Status = EnrollmentStatus.Enrolled,
                EnrolledAt = DateTime.UtcNow,
                EnrolledByUserId = enrolledByUserId,
                DueDate = request.DueDate,
                Notes = request.Notes
            };

            _context.TrainingEnrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return await GetEnrollmentAsync(enrollment.Id);
        }

        public async Task<List<TrainingEnrollmentDto>> BulkEnrollAsync(BulkEnrollRequest request, int enrolledByUserId)
        {
            var results = new List<TrainingEnrollmentDto>();

            foreach (var userId in request.UserIds.Distinct())
            {
                try
                {
                    var enrollRequest = new EnrollUserRequest
                    {
                        TrainingProgramId = request.TrainingProgramId,
                        UserId = userId,
                        SessionId = request.SessionId,
                        DueDate = request.DueDate
                    };
                    var enrollment = await EnrollUserAsync(enrollRequest, enrolledByUserId);
                    results.Add(enrollment);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to enroll user {UserId}", userId);
                }
            }

            return results;
        }

        public async Task<TrainingEnrollmentDto> UpdateEnrollmentAsync(int id, UpdateEnrollmentRequest request)
        {
            var enrollment = await _context.TrainingEnrollments.FindAsync(id);
            if (enrollment == null)
                throw new InvalidOperationException($"Enrollment with ID {id} not found");

            enrollment.DueDate = request.DueDate;
            enrollment.Notes = request.Notes;

            await _context.SaveChangesAsync();
            return await GetEnrollmentAsync(id);
        }

        public async Task CancelEnrollmentAsync(int id)
        {
            var enrollment = await _context.TrainingEnrollments.FindAsync(id);
            if (enrollment == null)
                throw new InvalidOperationException($"Enrollment with ID {id} not found");

            enrollment.Status = EnrollmentStatus.Cancelled;
            await _context.SaveChangesAsync();
        }

        public async Task<TrainingEnrollmentDto> StartTrainingAsync(int enrollmentId)
        {
            var enrollment = await _context.TrainingEnrollments.FindAsync(enrollmentId);
            if (enrollment == null)
                throw new InvalidOperationException($"Enrollment with ID {enrollmentId} not found");

            enrollment.Status = EnrollmentStatus.InProgress;
            enrollment.StartedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetEnrollmentAsync(enrollmentId);
        }

        public async Task<TrainingEnrollmentDto> RecordProgressAsync(RecordProgressRequest request)
        {
            var enrollment = await _context.TrainingEnrollments
                .Include(e => e.ProgressRecords)
                .FirstOrDefaultAsync(e => e.Id == request.EnrollmentId);

            if (enrollment == null)
                throw new InvalidOperationException($"Enrollment with ID {request.EnrollmentId} not found");

            var progress = new TrainingProgress
            {
                EnrollmentId = request.EnrollmentId,
                ModuleName = request.ModuleName,
                ModuleOrder = request.ModuleOrder,
                ProgressPercentage = request.ProgressPercentage,
                TimeSpent = request.TimeSpentMinutes.HasValue ? TimeSpan.FromMinutes(request.TimeSpentMinutes.Value) : null,
                CompletedAt = request.ProgressPercentage >= 100 ? DateTime.UtcNow : null
            };

            _context.TrainingProgresses.Add(progress);

            // Update overall progress
            enrollment.TimeSpentMinutes = (enrollment.TimeSpentMinutes ?? 0) + (request.TimeSpentMinutes ?? 0);

            await _context.SaveChangesAsync();
            return await GetEnrollmentAsync(request.EnrollmentId);
        }

        public async Task<TrainingEnrollmentDto> CompleteTrainingAsync(CompleteTrainingEnrollmentRequest request)
        {
            var enrollment = await _context.TrainingEnrollments
                .Include(e => e.TrainingProgram)
                .FirstOrDefaultAsync(e => e.Id == request.EnrollmentId);

            if (enrollment == null)
                throw new InvalidOperationException($"Enrollment with ID {request.EnrollmentId} not found");

            enrollment.Status = request.Passed ? EnrollmentStatus.Completed : EnrollmentStatus.Failed;
            enrollment.Score = request.Score;
            enrollment.Passed = request.Passed;
            enrollment.CompletedAt = DateTime.UtcNow;
            enrollment.Notes = request.Notes;

            // Generate certificate if applicable
            if (request.Passed && enrollment.TrainingProgram?.IsCertification == true)
            {
                enrollment.CertificateNumber = GenerateCertificateNumber();
                enrollment.CertificateIssuedAt = DateTime.UtcNow;

                if (enrollment.TrainingProgram.CertificationValidityMonths.HasValue)
                {
                    enrollment.CertificateExpiresAt = DateTime.UtcNow.AddMonths(enrollment.TrainingProgram.CertificationValidityMonths.Value);
                }
            }

            await _context.SaveChangesAsync();
            return await GetEnrollmentAsync(request.EnrollmentId);
        }

        public async Task<List<TrainingEnrollmentDto>> GetUserEnrollmentsAsync(int userId)
        {
            return await GetEnrollmentsAsync(userId: userId);
        }

        #endregion

        #region Materials

        public async Task<List<TrainingMaterialDto>> GetMaterialsAsync(int programId)
        {
            var materials = await _context.TrainingMaterials
                .Where(m => m.TrainingProgramId == programId && m.IsActive)
                .OrderBy(m => m.Order)
                .ToListAsync();

            return materials.Select(m => new TrainingMaterialDto
            {
                Id = m.Id,
                TrainingProgramId = m.TrainingProgramId,
                Title = m.Title,
                Description = m.Description,
                Type = m.Type.ToString(),
                FilePath = m.FilePath,
                ContentUrl = m.ContentUrl,
                DurationMinutes = m.DurationMinutes,
                Order = m.Order,
                IsRequired = m.IsRequired,
                IsActive = m.IsActive
            }).ToList();
        }

        public async Task<TrainingMaterialDto> CreateMaterialAsync(CreateTrainingMaterialRequest request)
        {
            var material = new TrainingMaterial
            {
                TrainingProgramId = request.TrainingProgramId,
                Title = request.Title,
                Description = request.Description,
                Type = Enum.Parse<MaterialType>(request.Type),
                FilePath = request.FilePath,
                ContentUrl = request.ContentUrl,
                DurationMinutes = request.DurationMinutes,
                Order = request.Order,
                IsRequired = request.IsRequired,
                IsActive = true
            };

            _context.TrainingMaterials.Add(material);
            await _context.SaveChangesAsync();

            return new TrainingMaterialDto
            {
                Id = material.Id,
                TrainingProgramId = material.TrainingProgramId,
                Title = material.Title,
                Description = material.Description,
                Type = material.Type.ToString(),
                FilePath = material.FilePath,
                ContentUrl = material.ContentUrl,
                DurationMinutes = material.DurationMinutes,
                Order = material.Order,
                IsRequired = material.IsRequired,
                IsActive = material.IsActive
            };
        }

        public async Task DeleteMaterialAsync(int id)
        {
            var material = await _context.TrainingMaterials.FindAsync(id);
            if (material == null)
                throw new InvalidOperationException($"Material with ID {id} not found");

            material.IsActive = false;
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Quizzes

        public async Task<TrainingQuizDto> GetQuizAsync(int quizId)
        {
            var quiz = await _context.TrainingQuizzes
                .Include(q => q.Questions).ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == quizId);

            if (quiz == null)
                throw new InvalidOperationException($"Quiz with ID {quizId} not found");

            return MapQuizToDto(quiz);
        }

        public async Task<TrainingQuizDto> CreateQuizAsync(CreateQuizRequest request)
        {
            var quiz = new TrainingQuiz
            {
                TrainingProgramId = request.TrainingProgramId,
                Title = request.Title,
                Description = request.Description,
                PassingScore = request.PassingScore,
                TimeLimitMinutes = request.TimeLimitMinutes,
                MaxAttempts = request.MaxAttempts,
                ShuffleQuestions = request.ShuffleQuestions,
                ShowCorrectAnswers = request.ShowCorrectAnswers,
                IsActive = true
            };

            foreach (var questionRequest in request.Questions)
            {
                var question = new QuizQuestion
                {
                    QuestionText = questionRequest.QuestionText,
                    QuestionType = Enum.Parse<QuestionType>(questionRequest.QuestionType),
                    Explanation = questionRequest.Explanation,
                    Points = questionRequest.Points,
                    Order = questionRequest.Order
                };

                foreach (var answerRequest in questionRequest.Answers)
                {
                    question.Answers.Add(new QuizAnswer
                    {
                        AnswerText = answerRequest.AnswerText,
                        IsCorrect = answerRequest.IsCorrect,
                        Order = answerRequest.Order
                    });
                }

                quiz.Questions.Add(question);
            }

            _context.TrainingQuizzes.Add(quiz);
            await _context.SaveChangesAsync();

            return await GetQuizAsync(quiz.Id);
        }

        public async Task<QuizAttemptResultDto> SubmitQuizAsync(int userId, SubmitQuizRequest request)
        {
            var quiz = await _context.TrainingQuizzes
                .Include(q => q.Questions).ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == request.QuizId);

            if (quiz == null)
                throw new InvalidOperationException($"Quiz with ID {request.QuizId} not found");

            var enrollment = await _context.TrainingEnrollments
                .Include(e => e.QuizAttempts)
                .FirstOrDefaultAsync(e => e.Id == request.EnrollmentId);

            if (enrollment == null)
                throw new InvalidOperationException($"Enrollment with ID {request.EnrollmentId} not found");

            var attemptNumber = enrollment.QuizAttempts.Count(a => a.QuizId == request.QuizId) + 1;

            if (attemptNumber > quiz.MaxAttempts)
                throw new InvalidOperationException("Maximum attempts exceeded");

            var attempt = new QuizAttempt
            {
                QuizId = request.QuizId,
                EnrollmentId = request.EnrollmentId,
                UserId = userId,
                StartedAt = DateTime.UtcNow.AddMinutes(-5), // Approximate
                SubmittedAt = DateTime.UtcNow,
                AttemptNumber = attemptNumber
            };

            int totalPoints = 0;
            int earnedPoints = 0;
            var questionResults = new List<QuestionResultDto>();

            foreach (var question in quiz.Questions)
            {
                var response = request.Responses.FirstOrDefault(r => r.QuestionId == question.Id);
                var correctAnswer = question.Answers.FirstOrDefault(a => a.IsCorrect);
                var selectedAnswer = response?.SelectedAnswerId.HasValue == true
                    ? question.Answers.FirstOrDefault(a => a.Id == response.SelectedAnswerId.Value)
                    : null;

                var isCorrect = selectedAnswer?.IsCorrect ?? false;
                var pointsEarned = isCorrect ? question.Points : 0;

                totalPoints += question.Points;
                earnedPoints += pointsEarned;

                attempt.Responses.Add(new QuizResponse
                {
                    QuestionId = question.Id,
                    SelectedAnswerId = response?.SelectedAnswerId,
                    TextResponse = response?.TextResponse,
                    IsCorrect = isCorrect,
                    PointsEarned = pointsEarned
                });

                questionResults.Add(new QuestionResultDto
                {
                    QuestionId = question.Id,
                    QuestionText = question.QuestionText,
                    SelectedAnswerId = selectedAnswer?.Id,
                    SelectedAnswerText = selectedAnswer?.AnswerText,
                    CorrectAnswerId = correctAnswer?.Id ?? 0,
                    CorrectAnswerText = correctAnswer?.AnswerText ?? string.Empty,
                    IsCorrect = isCorrect,
                    PointsEarned = pointsEarned,
                    PointsPossible = question.Points,
                    Explanation = quiz.ShowCorrectAnswers ? question.Explanation : null
                });
            }

            var score = totalPoints > 0 ? (int)Math.Round((double)earnedPoints / totalPoints * 100) : 0;
            attempt.Score = score;
            attempt.Passed = score >= quiz.PassingScore;

            _context.QuizAttempts.Add(attempt);
            await _context.SaveChangesAsync();

            return new QuizAttemptResultDto
            {
                AttemptId = attempt.Id,
                Score = score,
                Passed = attempt.Passed,
                AttemptNumber = attemptNumber,
                RemainingAttempts = quiz.MaxAttempts - attemptNumber,
                QuestionResults = quiz.ShowCorrectAnswers ? questionResults : new List<QuestionResultDto>()
            };
        }

        public async Task<List<QuizAttemptResultDto>> GetQuizAttemptsAsync(int enrollmentId, int quizId)
        {
            var attempts = await _context.QuizAttempts
                .Where(a => a.EnrollmentId == enrollmentId && a.QuizId == quizId)
                .OrderBy(a => a.AttemptNumber)
                .ToListAsync();

            return attempts.Select(a => new QuizAttemptResultDto
            {
                AttemptId = a.Id,
                Score = a.Score ?? 0,
                Passed = a.Passed,
                AttemptNumber = a.AttemptNumber,
                RemainingAttempts = 0
            }).ToList();
        }

        #endregion

        #region Certificates

        public async Task<string> GenerateCertificateAsync(int enrollmentId)
        {
            var enrollment = await _context.TrainingEnrollments
                .Include(e => e.TrainingProgram)
                .FirstOrDefaultAsync(e => e.Id == enrollmentId);

            if (enrollment == null)
                throw new InvalidOperationException($"Enrollment with ID {enrollmentId} not found");

            if (enrollment.Status != EnrollmentStatus.Completed)
                throw new InvalidOperationException("Training not completed");

            if (string.IsNullOrEmpty(enrollment.CertificateNumber))
            {
                enrollment.CertificateNumber = GenerateCertificateNumber();
                enrollment.CertificateIssuedAt = DateTime.UtcNow;

                if (enrollment.TrainingProgram?.CertificationValidityMonths.HasValue == true)
                {
                    enrollment.CertificateExpiresAt = DateTime.UtcNow.AddMonths(enrollment.TrainingProgram.CertificationValidityMonths.Value);
                }

                await _context.SaveChangesAsync();
            }

            return $"/certificates/{enrollment.CertificateNumber}.pdf";
        }

        public async Task<bool> ValidateCertificateAsync(string certificateNumber)
        {
            var enrollment = await _context.TrainingEnrollments
                .FirstOrDefaultAsync(e => e.CertificateNumber == certificateNumber);

            if (enrollment == null)
                return false;

            if (enrollment.CertificateExpiresAt.HasValue && enrollment.CertificateExpiresAt.Value < DateTime.UtcNow)
                return false;

            return enrollment.Status == EnrollmentStatus.Completed;
        }

        public async Task<List<CertificationDto>> GetUserCertificationsAsync(int userId)
        {
            var enrollments = await _context.TrainingEnrollments
                .Include(e => e.TrainingProgram)
                .Where(e => e.UserId == userId)
                .Where(e => e.Status == EnrollmentStatus.Completed)
                .Where(e => e.CertificateNumber != null)
                .ToListAsync();

            return enrollments.Select(e => new CertificationDto
            {
                Id = e.Id,
                TrainingTitle = e.TrainingProgram?.Title ?? string.Empty,
                CertificateNumber = e.CertificateNumber!,
                IssuedAt = e.CertificateIssuedAt!.Value,
                ExpiresAt = e.CertificateExpiresAt,
                IsValid = !e.CertificateExpiresAt.HasValue || e.CertificateExpiresAt.Value > DateTime.UtcNow,
                CertificateUrl = e.CertificateUrl
            }).ToList();
        }

        #endregion

        #region Reports

        public async Task<TrainingDashboardDto> GetDashboardAsync(int? companyId = null)
        {
            var programs = await _context.TrainingPrograms
                .Where(p => p.CompanyId == null || p.CompanyId == companyId)
                .Where(p => p.IsActive)
                .ToListAsync();

            var enrollments = await _context.TrainingEnrollments
                .Include(e => e.TrainingProgram)
                .Where(e => e.TrainingProgram!.CompanyId == null || e.TrainingProgram.CompanyId == companyId)
                .ToListAsync();

            var sessions = await _context.TrainingSessions
                .Include(s => s.TrainingProgram)
                .Where(s => s.StartDate > DateTime.UtcNow)
                .Where(s => s.TrainingProgram!.CompanyId == null || s.TrainingProgram.CompanyId == companyId)
                .OrderBy(s => s.StartDate)
                .Take(5)
                .ToListAsync();

            var mandatoryPrograms = programs.Where(p => p.IsMandatory).Take(5).ToList();

            return new TrainingDashboardDto
            {
                TotalPrograms = programs.Count,
                ActiveEnrollments = enrollments.Count(e => e.Status == EnrollmentStatus.InProgress || e.Status == EnrollmentStatus.Enrolled),
                CompletedThisMonth = enrollments.Count(e => e.CompletedAt?.Month == DateTime.UtcNow.Month && e.CompletedAt?.Year == DateTime.UtcNow.Year),
                OverdueTrainings = enrollments.Count(e => e.DueDate.HasValue && e.DueDate.Value < DateTime.UtcNow && e.Status != EnrollmentStatus.Completed),
                UpcomingSessions = sessions.Count,
                AverageCompletionRate = programs.Any() ? (decimal)enrollments.Count(e => e.Status == EnrollmentStatus.Completed) / programs.Count : 0,
                MandatoryTrainings = mandatoryPrograms.Select(p => new TrainingProgramDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    IsMandatory = p.IsMandatory
                }).ToList(),
                UpcomingSessionList = sessions.Select(s => new TrainingSessionDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    Location = s.Location
                }).ToList()
            };
        }

        public async Task<UserTrainingSummaryDto> GetUserSummaryAsync(int userId)
        {
            var enrollments = await _context.TrainingEnrollments
                .Include(e => e.TrainingProgram)
                .Where(e => e.UserId == userId)
                .ToListAsync();

            var certifications = await GetUserCertificationsAsync(userId);

            return new UserTrainingSummaryDto
            {
                UserId = userId,
                TotalEnrollments = enrollments.Count,
                CompletedCount = enrollments.Count(e => e.Status == EnrollmentStatus.Completed),
                InProgressCount = enrollments.Count(e => e.Status == EnrollmentStatus.InProgress || e.Status == EnrollmentStatus.Enrolled),
                OverdueCount = enrollments.Count(e => e.DueDate.HasValue && e.DueDate.Value < DateTime.UtcNow && e.Status != EnrollmentStatus.Completed),
                CompletionRate = enrollments.Any() ? (decimal)enrollments.Count(e => e.Status == EnrollmentStatus.Completed) / enrollments.Count : 0,
                Certifications = certifications
            };
        }

        public async Task<TrainingComplianceReportDto> GetComplianceReportAsync(int? companyId = null, int? roleId = null)
        {
            // Simplified implementation
            var enrollments = await _context.TrainingEnrollments
                .Include(e => e.User)
                .Include(e => e.TrainingProgram)
                .Where(e => e.TrainingProgram!.IsMandatory)
                .Where(e => e.TrainingProgram!.CompanyId == null || e.TrainingProgram.CompanyId == companyId)
                .ToListAsync();

            var totalRequired = enrollments.Count;
            var completed = enrollments.Count(e => e.Status == EnrollmentStatus.Completed);
            var overdue = enrollments.Count(e => e.DueDate.HasValue && e.DueDate.Value < DateTime.UtcNow && e.Status != EnrollmentStatus.Completed);

            return new TrainingComplianceReportDto
            {
                TotalRequired = totalRequired,
                Completed = completed,
                Pending = totalRequired - completed,
                Overdue = overdue,
                ComplianceRate = totalRequired > 0 ? (decimal)completed / totalRequired : 0
            };
        }

        public async Task<List<UserComplianceDto>> GetOverdueUsersAsync(int? companyId = null)
        {
            var overdueEnrollments = await _context.TrainingEnrollments
                .Include(e => e.User)
                .Include(e => e.TrainingProgram)
                .Where(e => e.DueDate.HasValue && e.DueDate.Value < DateTime.UtcNow)
                .Where(e => e.Status != EnrollmentStatus.Completed)
                .Where(e => e.TrainingProgram!.CompanyId == null || e.TrainingProgram.CompanyId == companyId)
                .GroupBy(e => e.UserId)
                .ToListAsync();

            return overdueEnrollments.Select(g => new UserComplianceDto
            {
                UserId = g.Key,
                UserName = g.First().User?.FullName ?? g.First().User?.Email ?? "Unknown",
                OverdueTrainings = g.Count(),
                OverdueDetails = g.Select(e => MapEnrollmentToDto(e)).ToList()
            }).ToList();
        }

        #endregion

        #region Private Helpers

        private static TrainingCategoryDto MapCategoryToDto(TrainingCategory c) => new()
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            Color = c.Color,
            Icon = c.Icon,
            ParentCategoryId = c.ParentCategoryId,
            ParentCategoryName = c.ParentCategory?.Name,
            ProgramCount = c.Programs?.Count ?? 0,
            SubCategories = c.SubCategories?.Select(MapCategoryToDto).ToList() ?? new List<TrainingCategoryDto>()
        };

        private static TrainingEnrollmentDto MapEnrollmentToDto(TrainingEnrollment e) => new()
        {
            Id = e.Id,
            TrainingProgramId = e.TrainingProgramId,
            TrainingTitle = e.TrainingProgram?.Title ?? string.Empty,
            TrainingCode = e.TrainingProgram?.Code ?? string.Empty,
            CategoryName = e.TrainingProgram?.Category?.Name ?? string.Empty,
            UserId = e.UserId,
            UserName = e.User?.FullName ?? e.User?.Email ?? "Unknown",
            UserAvatar = e.User?.ProfileImageUrl,
            SessionId = e.SessionId,
            SessionTitle = e.Session?.Title,
            Status = e.Status.ToString(),
            EnrolledAt = e.EnrolledAt,
            StartedAt = e.StartedAt,
            CompletedAt = e.CompletedAt,
            DueDate = e.DueDate,
            Score = e.Score,
            Passed = e.Passed,
            Attempts = e.Attempts,
            TimeSpentMinutes = e.TimeSpentMinutes,
            Notes = e.Notes,
            CertificateNumber = e.CertificateNumber,
            CertificateIssuedAt = e.CertificateIssuedAt,
            CertificateExpiresAt = e.CertificateExpiresAt,
            CertificateUrl = e.CertificateUrl,
            ProgressPercentage = e.ProgressRecords?.Any() == true
                ? e.ProgressRecords.Average(p => p.ProgressPercentage)
                : 0
        };

        private static TrainingQuizDto MapQuizToDto(TrainingQuiz q) => new()
        {
            Id = q.Id,
            TrainingProgramId = q.TrainingProgramId,
            Title = q.Title,
            Description = q.Description,
            PassingScore = q.PassingScore,
            TimeLimitMinutes = q.TimeLimitMinutes,
            MaxAttempts = q.MaxAttempts,
            ShuffleQuestions = q.ShuffleQuestions,
            ShowCorrectAnswers = q.ShowCorrectAnswers,
            IsActive = q.IsActive,
            QuestionCount = q.Questions?.Count ?? 0,
            Questions = q.Questions?.Select(question => new QuizQuestionDto
            {
                Id = question.Id,
                QuizId = question.QuizId,
                QuestionText = question.QuestionText,
                QuestionType = question.QuestionType.ToString(),
                Explanation = question.Explanation,
                Points = question.Points,
                Order = question.Order,
                Answers = question.Answers?.Select(a => new QuizAnswerDto
                {
                    Id = a.Id,
                    QuestionId = a.QuestionId,
                    AnswerText = a.AnswerText,
                    IsCorrect = a.IsCorrect,
                    Order = a.Order
                }).OrderBy(a => a.Order).ToList() ?? new List<QuizAnswerDto>()
            }).OrderBy(q => q.Order).ToList() ?? new List<QuizQuestionDto>()
        };

        private static string GenerateCertificateNumber()
        {
            return $"CERT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }

        #endregion
    }
}
