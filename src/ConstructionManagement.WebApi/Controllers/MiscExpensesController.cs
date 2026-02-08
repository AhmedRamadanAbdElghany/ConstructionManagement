using ConstructionManagement.Application.DTOs.MiscExpense;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MiscExpensesController : ControllerBase
    {
        private readonly IMiscExpenseService _miscExpenseService;

        public MiscExpensesController(IMiscExpenseService miscExpenseService)
        {
            _miscExpenseService = miscExpenseService;
        }

        private int GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(userId, out int id) ? id : 0;
        }

        // GET: api/miscexpenses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MiscExpenseDto>>> GetExpenses()
        {
            var expenses = await _miscExpenseService.GetExpensesAsync();
            return Ok(expenses);
        }

        // GET: api/miscexpenses/summary
        [HttpGet("summary")]
        public async Task<ActionResult<MiscExpenseSummary>> GetSummary()
        {
            var summary = await _miscExpenseService.GetSummaryAsync();
            return Ok(summary);
        }

        // GET: api/miscexpenses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MiscExpenseDto>> GetExpense(int id)
        {
            var expense = await _miscExpenseService.GetExpenseByIdAsync(id);
            if (expense == null)
                return NotFound();
            return Ok(expense);
        }

        // GET: api/miscexpenses/pending
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<MiscExpenseDto>>> GetPendingExpenses()
        {
            var expenses = await _miscExpenseService.GetPendingExpensesAsync();
            return Ok(expenses);
        }

        // GET: api/miscexpenses/by-category
        [HttpGet("by-category")]
        public async Task<ActionResult<Dictionary<string, decimal>>> GetByCategory()
        {
            var expenses = await _miscExpenseService.GetExpensesByCategoryAsync();
            return Ok(expenses);
        }

        // POST: api/miscexpenses
        [HttpPost]
        public async Task<ActionResult<MiscExpenseDto>> CreateExpense([FromForm] CreateMiscExpenseRequest request)
        {
            request.CreatedByUserId = GetCurrentUserId();
            var expense = await _miscExpenseService.CreateExpenseAsync(request);
            return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
        }

        // POST: api/miscexpenses/5/review
        [HttpPost("{id}/review")]
        public async Task<ActionResult<MiscExpenseDto>> ReviewExpense(int id, [FromBody] ReviewMiscExpenseRequest request)
        {
            var reviewerId = GetCurrentUserId();
            var expense = await _miscExpenseService.ReviewExpenseAsync(id, request, reviewerId);
            return Ok(expense);
        }
    }
}
