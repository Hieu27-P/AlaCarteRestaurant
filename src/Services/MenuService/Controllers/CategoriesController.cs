using MenuService.Models;
using MenuService.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MenuService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _db;
        public CategoriesController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _db.Categories.AsNoTracking().ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var entity = await _db.Categories.FindAsync(id);
            return entity is null ? NotFound(new { message = "Không tìm thấy danh mục" }) : Ok(entity);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CategoryDto dto)
        {
            var entity = new Category
            {
                Name = dto.Name,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _db.Categories.Add(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _db.Categories.FindAsync(id);
            if (entity is null) return NotFound(new { message = "Không tìm thấy danh mục" });
            _db.Categories.Remove(entity);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CategoryDto dto)
        {
            var entity = await _db.Categories.FindAsync(id);
            if (entity is null)
                return NotFound(new { message = "Không tìm thấy danh mục" });

            entity.Name = dto.Name;
            entity.IsActive = dto.IsActive;
            entity.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();
            return Ok(entity);
        }
    }
}
