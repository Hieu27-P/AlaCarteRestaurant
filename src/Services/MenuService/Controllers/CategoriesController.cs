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
        public async Task<IActionResult> GetAll() => Ok(await GetCategoryResponses().ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await GetCategoryResponses(includeMenuItems: true)
                .FirstOrDefaultAsync(c => c.Id == id);
            return result is null ? NotFound(new { message = "Không tìm thấy danh mục" }) : Ok(result);
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

            var response = await GetCategoryResponses().FirstAsync(c => c.Id == entity.Id);

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, response);
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
            var response = await GetCategoryResponses().FirstAsync(c => c.Id == entity.Id);
            return Ok(response);
        }

        private IQueryable<CategoryDetailResponseDto> GetCategoryResponses(bool includeMenuItems = false) =>
            _db.Categories
                .AsNoTracking()
                .Select(c => new CategoryDetailResponseDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    IsActive = c.IsActive,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    MenuItems = includeMenuItems
                        ? c.MenuItems.Select(m => new MenuItemResponseDto
                        {
                            Id = m.Id,
                            CategoryId = m.CategoryId,
                            Name = m.Name,
                            Description = m.Description,
                            Price = m.Price,
                            ImageUrl = m.ImageUrl,
                            IsAvailable = m.IsAvailable,
                            CreatedAt = m.CreatedAt,
                            UpdatedAt = m.UpdatedAt,
                            OptionGroups = m.OptionGroups.Select(g => new OptionGroupResponseDto
                            {
                                Id = g.Id,
                                Name = g.Name,
                                Options = g.MenuOptions.Select(o => new OptionResponseDto
                                {
                                    Id = o.Id,
                                    Name = o.Name,
                                    ExtraPrice = o.ExtraPrice,
                                    IsAvailable = o.IsAvailable
                                }).ToList()
                            }).ToList()
                        }).ToList()
                        : null
                });
    }
}
