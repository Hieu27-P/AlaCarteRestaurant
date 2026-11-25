using MenuService.Models;
using MenuService.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MenuService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuItemsController : Controller
    {
        private readonly AppDbContext _db;
        public MenuItemsController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await GetMenuItemResponses(includeOptionGroups: false).ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await GetMenuItemResponses(includeOptionGroups: true).FirstOrDefaultAsync(m => m.Id == id);

            return result is null
                ? NotFound(new { message = $"Không tìm thấy món ăn có ID = {id}" })
                : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(MenuItemDto dto)
        {
            var now = DateTime.Now;
            var optionGroups = await _db.MenuOptionGroups
                .Where(g => dto.OptionGroupIds.Contains(g.Id))
                .ToListAsync();

            var entity = new MenuItem
            {
                CategoryId = dto.CategoryId,
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                ImageUrl = dto.ImageUrl,
                IsAvailable = dto.IsAvailable,
                OptionGroups = optionGroups,
                CreatedAt = now,
                UpdatedAt = now
            };

            _db.MenuItems.Add(entity);
            await _db.SaveChangesAsync();

            var response = await GetMenuItemResponses().FirstAsync(m => m.Id == entity.Id);
            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _db.MenuItems.FindAsync(id);

            if (entity is null) return NotFound(new { message = $"Không tìm thấy món ăn có ID = {id}" });

            _db.MenuItems.Remove(entity);
            await _db.SaveChangesAsync();

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, MenuItemDto dto)
        {
            var entity = await _db.MenuItems
                .Include(m => m.OptionGroups)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (entity is null)
            {
                return NotFound(new { message = $"Không tìm thấy món ăn có ID = {id}" });
            }

            entity.CategoryId = dto.CategoryId;
            entity.Name = dto.Name;
            entity.Description = dto.Description;
            entity.Price = dto.Price;
            entity.ImageUrl = dto.ImageUrl;
            entity.IsAvailable = dto.IsAvailable;

            var optionGroups = await _db.MenuOptionGroups
                .Where(g => dto.OptionGroupIds.Contains(g.Id))
                .ToListAsync();

            entity.OptionGroups.Clear();
            foreach (var group in optionGroups)
            {
                entity.OptionGroups.Add(group);
            }

            entity.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();

            var response = await GetMenuItemResponses().FirstAsync(m => m.Id == entity.Id);
            return Ok(response);
        }

        private IQueryable<MenuItemResponseDto> GetMenuItemResponses(bool includeOptionGroups = true) =>
            _db.MenuItems
                .AsNoTracking()
                .Select(m => new MenuItemResponseDto
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
                    OptionGroups = includeOptionGroups
                        ? m.OptionGroups.Select(g => new OptionGroupResponseDto
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
                        : null
                });
    }
}
