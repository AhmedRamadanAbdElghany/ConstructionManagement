namespace ConstructionManagement.Application.Interfaces
{
    public interface IEscalationService
    {
        Task CheckAndSendDelayEscalationsAsync();
    }
}
