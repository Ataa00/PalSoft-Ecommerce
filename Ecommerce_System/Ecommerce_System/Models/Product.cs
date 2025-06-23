using System.ComponentModel.DataAnnotations;

namespace Ecommerce_System.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public string? Description { get; set; }

        [Required]
        public string Category { get; set; } = string.Empty;

        public List<ProductSize> Sizes { get; set; } = new();

        // This will hold the path or filename of the uploaded image
        public string? Image { get; set; }

        public double Rate { get; set; }

        public int Count { get; set; }
    }

    public class ProductSize
    {
        public int Id { get; set; }

        [Required]
        public string Size { get; set; } = string.Empty;

        public int Quantity { get; set; }
    }
}
