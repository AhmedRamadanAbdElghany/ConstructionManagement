using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IEscalationService
    {
        Task CheckAndSendDelayEscalationsAsync();
    }
}
