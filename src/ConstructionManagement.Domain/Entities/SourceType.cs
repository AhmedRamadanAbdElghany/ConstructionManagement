using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionManagement.Domain.Entities
{
    public enum SourceType
    {
        OnlineUpload,     // Engineer uploads photo from site
        PhysicalVisit     // Note / report created during physical site visit
    }
}
