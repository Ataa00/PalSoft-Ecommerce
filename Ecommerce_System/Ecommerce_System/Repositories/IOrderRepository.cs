using Ecommerce_System.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ecommerce_System.Repositories
{
    public interface IOrderRepository
    {
        Task<IEnumerable<Order>> GetAllAsync();
        Task<Order?> GetByIdAsync(int id);
        Task<IEnumerable<Order>> GetByUserIdAsync(int userId);
        Task<Order> CreateAsync(Order order);
        Task UpdateAsync(Order order);
        Task DeleteAsync(int id);
        Task<IEnumerable<Order>> GetAllAsyncWithDetails();
        Task<IEnumerable<Order>> GetByUserIdAsyncWithDetails(int userId);
        Task<Order?> GetByIdAsyncWithDetails(int id);

    }
}
