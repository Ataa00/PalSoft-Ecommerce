using Ecommerce_System.Models;
using Ecommerce_System.Repositories;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading.Tasks;

namespace Ecommerce_System
{
    public static class AdminSeed
    {
        /// <summary>
        /// Seeds an admin user if one does not already exist.
        /// </summary>
        /// <param name="services">The IServiceProvider to create a scope and resolve IUserRepository.</param>
        public static async Task SeedAdminUserAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var userRepo = scope.ServiceProvider.GetRequiredService<IUserRepository>();

            const string adminEmail = "admin@mail.com";
            var existingAdmin = await userRepo.GetByEmailAsync(adminEmail);
            if (existingAdmin == null)
            {
                var adminUser = new User
                {
                    Name = "Admin User",
                    Email = adminEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("AdminPass123"),
                    Role = UserRole.Admin
                };

                await userRepo.CreateAsync(adminUser);
                Console.WriteLine("Admin user created.");
            }
            else
            {
                Console.WriteLine("Admin user already exists.");
            }
        }
    }
}
