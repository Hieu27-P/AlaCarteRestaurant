using MenuService.Models;
using MenuService.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MenuService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuOptionGroupsController : Controller
    {
        private readonly AppDbContext _db;
        public MenuOptionGroupsController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await GetOptionGroupResponses().ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await GetOptionGroupResponses(includeRelations: true).FirstOrDefaultAsync(g => g.Id == id);

            return result is null ? NotFound(new { message = $"Không tìm thấy nhóm tùy chọn có ID = {id}" }) : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(MenuOptionGroupDto dto)
        {
            var entity = new MenuOptionGroup
            {
                Name = dto.Name
            };

            _db.MenuOptionGroups.Add(entity);
            await _db.SaveChangesAsync();

            var response = await GetOptionGroupResponses().FirstAsync(g => g.Id == entity.Id);
            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, MenuOptionGroupDto dto)
        {
            var entity = await _db.MenuOptionGroups.FindAsync(id);
            if (entity is null)
            {
                return NotFound(new { message = $"Không tìm thấy nhóm tùy chọn có ID = {id}" });
            }

            entity.Name = dto.Name;

            await _db.SaveChangesAsync();

            var response = await GetOptionGroupResponses().FirstAsync(g => g.Id == entity.Id);
            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _db.MenuOptionGroups.FindAsync(id);
            if (entity is null)
            {
                return NotFound(new { message = $"Không tìm thấy nhóm tùy chọn có ID = {id}" });
            }

            _db.MenuOptionGroups.Remove(entity);
            await _db.SaveChangesAsync();

            return Ok();
        }

        private IQueryable<OptionGroupResponseDto> GetOptionGroupResponses(bool includeRelations = false) =>
            _db.MenuOptionGroups
                .AsNoTracking()
                .Select(g => new OptionGroupResponseDto
                {
                    Id = g.Id,
                    Name = g.Name,
                    Options = includeRelations
                        ? g.MenuOptions.Select(o => new OptionResponseDto
                        {
                            Id = o.Id,
                            Name = o.Name,
                            ExtraPrice = o.ExtraPrice,
                            IsAvailable = o.IsAvailable
                        }).ToList()
                        : null,
                    MenuItems = includeRelations
                        ? g.MenuItems.Select(m => new MenuItemResponseDto
                        {
                            Id = m.Id,
                            CategoryId = m.CategoryId,
                            Name = m.Name,
                            Description = m.Description,
                            Price = m.Price,
                            ImageUrl = m.ImageUrl,
                            IsAvailable = m.IsAvailable,
                            CreatedAt = m.CreatedAt,
                            UpdatedAt = m.UpdatedAt
                        }).ToList()
                        : null
                });
    }
}
