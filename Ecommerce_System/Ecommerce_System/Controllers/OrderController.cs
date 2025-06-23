using Ecommerce_System.Data;
using Ecommerce_System.DTOs;
using Ecommerce_System.Models;
using Ecommerce_System.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Ecommerce_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Requires authentication for all actions
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRepository _repository;
        private readonly ApplicationDbContext _context;


        public OrdersController(IOrderRepository repository, ApplicationDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        // GET: api/orders
        [HttpGet]
        [Authorize(Roles = "Admin")] // Only admin can get all orders
        public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetAll()
        {
            var orders = await _repository.GetAllAsyncWithDetails();

            var result = orders.Select(MapToResponseDto).ToList();
            return Ok(result);
        }


        // GET: api/orders/myorders
        [HttpGet("myorders")]
        public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetMyOrders()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdString == null || !int.TryParse(userIdString, out int userId))
                return Unauthorized();

            var orders = await _repository.GetByUserIdAsyncWithDetails(userId);
            var result = orders.Select(MapToResponseDto).ToList();
            return Ok(result);
        }


        // GET: api/orders/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,User")] // Admin or user can get specific order
        public async Task<ActionResult<OrderResponseDto>> GetById(int id)
        {
            var order = await _repository.GetByIdAsyncWithDetails(id);
            if (order == null) return NotFound();

            if (!User.IsInRole("Admin"))
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (!int.TryParse(userIdString, out int userId) || order.UserId != userId)
                    return Forbid();
            }

            return Ok(MapToResponseDto(order));
        }


        // POST: api/orders
        [HttpPost]
        [Authorize(Roles = "Admin,User")] // Admin or user can create order
        public async Task<IActionResult> Create([FromBody] OrderCreateDto dto)
        {
            // ✅ Extract user ID from JWT claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized("Invalid or missing user ID");

            // ✅ Calculate total price
            decimal totalPrice = dto.Items.Sum(i => i.Price * i.Quantity);

            // ✅ Create Order entity
            var order = new Order
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                TotalPrice = totalPrice,
                OrderItems = dto.Items.Select(i => new OrderItem
                {
                    ProductId = i.ProductId,
                    Quantity = i.Quantity,
                    PriceAtPurchase = i.Price
                }).ToList()
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Order created successfully",
                orderId = order.Id,
                total = order.TotalPrice
            });
        }

        //// PUT: api/orders/5
        //[HttpPut("{id}")]
        //[Authorize(Roles = "Admin")] // Only admin can update
        //public async Task<IActionResult> Update(int id, Order order)
        //{
        //    if (id != order.Id) return BadRequest();

        //    var existingOrder = await _repository.GetByIdAsync(id);
        //    if (existingOrder == null) return NotFound();

        //    await _repository.UpdateAsync(order);
        //    return NoContent();
        //}

        // DELETE: api/orders/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Only admin can delete
        public async Task<IActionResult> Delete(int id)
        {
            var existingOrder = await _repository.GetByIdAsync(id);
            if (existingOrder == null) return NotFound();

            await _repository.DeleteAsync(id);
            return NoContent();
        }

        private OrderResponseDto MapToResponseDto(Order order)
        {
            return new OrderResponseDto
            {
                Id = order.Id,
                CreatedAt = order.CreatedAt,
                TotalPrice = order.TotalPrice,
                Items = order.OrderItems.Select(item => new OrderItemResponseDto
                {
                    ProductId = item.ProductId,
                    ProductTitle = item.Product?.Title ?? "",
                    Quantity = item.Quantity,
                    PriceAtPurchase = item.PriceAtPurchase
                }).ToList()
            };
        }
    }
}
