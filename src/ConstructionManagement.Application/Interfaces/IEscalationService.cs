namespace ConstructionManagement.Application.Interfaces
{
    public interface IProjectDelayEscalationService
    {
        // NOTE: Add tests for schedule triggers + settings effects.
        Task CheckProjectAndItemDelaysAsync();
    }
}
