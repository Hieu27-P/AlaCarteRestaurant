using MenuService.Models;
using MenuService.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MenuService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenuOptionGroupsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public MenuOptionGroupsController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _db.MenuOptionGroups.AsNoTracking().ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var entity = await _db.MenuOptionGroups.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);

            return entity is null ? NotFound(new { message = "Không tìm thấy nhóm tùy chọn" }) : Ok(entity);
        }

        [HttpPost]
        public async Task<IActionResult> Create(MenuOptionGroupDto dto)
        {
            var entity = new MenuOptionGroup
            {
                MenuItemId = dto.MenuItemId,
                Name = dto.Name
            };

            _db.MenuOptionGroups.Add(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _db.MenuOptionGroups.FindAsync(id);
            if (entity is null)
                return NotFound(new { message = "Không tìm thấy nhóm tùy chọn" });

            _db.MenuOptionGroups.Remove(entity);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, MenuOptionGroupDto dto)
        {
            var entity = await _db.MenuOptionGroups.FindAsync(id);
            if (entity is null)
                return NotFound(new { message = "Không tìm thấy nhóm tùy chọn" });

            entity.MenuItemId = dto.MenuItemId;
            entity.Name = dto.Name;

            await _db.SaveChangesAsync();
            return Ok(entity);
        }
    }
}
