using MenuService.Models;
using MenuService.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MenuService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenuOptionsController : Controller
    {
        private readonly AppDbContext _db;
        public MenuOptionsController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await GetMenuOptionResponses().ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await GetMenuOptionResponses(includeOptionGroup: true).FirstOrDefaultAsync(o => o.Id == id);
            return result is null ? NotFound(new { message = $"Không tìm thấy tùy chọn có ID = {id}" }) : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(MenuOptionDto dto)
        {
            var groupExists = await _db.MenuOptionGroups.AnyAsync(g => g.Id == dto.OptionGroupId);
            if (!groupExists)
            {
                return BadRequest(new { message = $"Nhóm tùy chọn có ID = {dto.OptionGroupId} không tồn tại" });
            }

            var entity = new MenuOption
            {
                OptionGroupId = dto.OptionGroupId,
                Name = dto.Name,
                ExtraPrice = dto.ExtraPrice,
                IsAvailable = dto.IsAvailable
            };

            _db.MenuOptions.Add(entity);
            await _db.SaveChangesAsync();

            var response = await GetMenuOptionResponses().FirstAsync(o => o.Id == entity.Id);
            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, MenuOptionDto dto)
        {
            var entity = await _db.MenuOptions.FindAsync(id);
            if (entity is null)
            {
                return NotFound(new { message = $"Không tìm thấy tùy chọn có ID = {id}" });
            }

            var groupExists = await _db.MenuOptionGroups.AnyAsync(g => g.Id == dto.OptionGroupId);
            if (!groupExists)
            {
                return BadRequest(new { message = $"Nhóm tùy chọn có ID = {dto.OptionGroupId} không tồn tại" });
            }

            entity.OptionGroupId = dto.OptionGroupId;
            entity.Name = dto.Name;
            entity.ExtraPrice = dto.ExtraPrice;
            entity.IsAvailable = dto.IsAvailable;

            await _db.SaveChangesAsync();

            var response = await GetMenuOptionResponses().FirstAsync(o => o.Id == entity.Id);
            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _db.MenuOptions.FindAsync(id);
            if (entity is null)
            {
                return NotFound(new { message = $"Không tìm thấy tùy chọn có ID = {id}" });
            }

            _db.MenuOptions.Remove(entity);
            await _db.SaveChangesAsync();

            return Ok();
        }

        private IQueryable<MenuOptionResponseDto> GetMenuOptionResponses(bool includeOptionGroup = false) =>
            _db.MenuOptions
                .AsNoTracking()
                .Select(o => new MenuOptionResponseDto
                {
                    Id = o.Id,
                    OptionGroupId = o.OptionGroupId,
                    Name = o.Name,
                    ExtraPrice = o.ExtraPrice,
                    IsAvailable = o.IsAvailable,
                    OptionGroup = includeOptionGroup
                        ? new OptionGroupResponseDto
                        {
                            Id = o.OptionGroup.Id,
                            Name = o.OptionGroup.Name,
                            Options = o.OptionGroup.MenuOptions.Select(sibling => new OptionResponseDto
                            {
                                Id = sibling.Id,
                                Name = sibling.Name,
                                ExtraPrice = sibling.ExtraPrice,
                                IsAvailable = sibling.IsAvailable
                            }).ToList(),
                            MenuItems = o.OptionGroup.MenuItems.Select(m => new MenuItemResponseDto
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
                        }
                        : null
                });
    }
}
