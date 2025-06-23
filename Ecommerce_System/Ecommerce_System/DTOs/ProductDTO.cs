using Ecommerce_System.Models;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Ecommerce_System.DTOs
{
    public class ProductCreateDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public string? Description { get; set; }

        [Required]
        public string Category { get; set; } = string.Empty;

        public List<ProductSize> Sizes { get; set; } = new();

        public IFormFile? ImageFile { get; set; }

        public double Rate { get; set; }

        public int Count { get; set; }
    }

    public class ProductResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? Category { get; set; }
        public string? Image { get; set; }
        public double Rate { get; set; }
        public int Count { get; set; }

        public List<ProductSizeDto> Sizes { get; set; } = new();
    }

    public class ProductSizeDto
    {
        public string Size { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }
}
