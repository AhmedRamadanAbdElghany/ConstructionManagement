using ConstructionManagement.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IProjectSettingsService
    {
        Task<ProjectSettingsDto> GetSettingsAsync(int projectId);
        Task UpdateSettingsAsync(int projectId, UpdateProjectSettingsRequest request, int userId);
    }
}
