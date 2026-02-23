using System.Threading.Tasks;

namespace ConstructionManagement.Application.Interfaces
{
    /// <summary>
    /// Service interface for checking project and item delays and sending escalation notifications
    /// </summary>
    public interface IProjectDelayEscalationService
    {
        /// <summary>
        /// Checks all active projects for delays and sends appropriate notifications
        /// </summary>
        Task CheckProjectAndItemDelaysAsync();
    }
}
