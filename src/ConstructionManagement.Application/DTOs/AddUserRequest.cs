using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionManagement.Application.DTOs
{
    public record AddUserRequest(string FullName, string Email, string Password);
}
