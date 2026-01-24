namespace ConstructionManagement.Application.Interfaces
{
    public interface IProjectDelayEscalationService
    {
        Task CheckProjectAndItemDelaysAsync();
    }
}
