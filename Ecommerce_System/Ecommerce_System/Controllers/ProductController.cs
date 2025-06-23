using Ecommerce_System.DTOs;
using Ecommerce_System.Models;
using Ecommerce_System.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductRepository _productRepository;
        private readonly IWebHostEnvironment _env;

        public ProductController(IProductRepository productRepository, IWebHostEnvironment env)
        {
            _productRepository = productRepository;
            _env = env;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ProductResponseDto>>> Get()
        {
            var products = await _productRepository.GetAllAsync();

            var result = products.Select(p => new ProductResponseDto
            {
                Id = p.Id,
                Title = p.Title,
                Price = p.Price,
                Category = p.Category,
                Image = string.IsNullOrEmpty(p.Image) ? null : $"{Request.Scheme}://{Request.Host}/{p.Image}",
                Rate = p.Rate,
                Count = p.Count,
                Sizes = p.Sizes.Select(s => new ProductSizeDto
                {
                    Size = s.Size,
                    Quantity = s.Quantity
                }).ToList()
            });

            return Ok(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Product>> Get(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound();

            var result = new ProductResponseDto
            {
                Id = product.Id,
                Title = product.Title,
                Price = product.Price,
                Category = product.Category,
                Image = string.IsNullOrEmpty(product.Image) ? null : $"{Request.Scheme}://{Request.Host}/{product.Image}",
                Rate = product.Rate,
                Count = product.Count,
                Sizes = product.Sizes.Select(s => new ProductSizeDto
                {
                    Size = s.Size,
                    Quantity = s.Quantity
                }).ToList()
            };

            return Ok(result);

        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Product>> Post([FromForm] ProductCreateDto dto)
        {
            string? imagePath = null;

            if (dto.ImageFile != null)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                Directory.CreateDirectory(uploadsFolder);
                var fileName = Guid.NewGuid() + Path.GetExtension(dto.ImageFile.FileName);
                var fullPath = Path.Combine(uploadsFolder, fileName);

                using var stream = new FileStream(fullPath, FileMode.Create);
                await dto.ImageFile.CopyToAsync(stream);

                imagePath = Path.Combine("uploads", fileName).Replace("\\", "/");
            }

            var product = new Product
            {
                Title = dto.Title,
                Price = dto.Price,
                Description = dto.Description,
                Category = dto.Category,
                Sizes = dto.Sizes,
                Image = imagePath,
                Rate = dto.Rate,
                Count = dto.Count
            };

            var created = await _productRepository.CreateAsync(product);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Put(int id, [FromForm] ProductCreateDto dto)
        {
            var existing = await _productRepository.GetByIdAsync(id);
            if (existing == null) return NotFound();

            // Optionally replace image
            if (dto.ImageFile != null)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                Directory.CreateDirectory(uploadsFolder);
                var fileName = Guid.NewGuid() + Path.GetExtension(dto.ImageFile.FileName);
                var fullPath = Path.Combine(uploadsFolder, fileName);

                using var stream = new FileStream(fullPath, FileMode.Create);
                await dto.ImageFile.CopyToAsync(stream);

                existing.Image = Path.Combine("uploads", fileName).Replace("\\", "/");
            }

            existing.Title = dto.Title;
            existing.Price = dto.Price;
            existing.Description = dto.Description;
            existing.Category = dto.Category;
            existing.Sizes = dto.Sizes;
            existing.Rate = dto.Rate;
            existing.Count = dto.Count;

            await _productRepository.UpdateAsync(existing);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _productRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
