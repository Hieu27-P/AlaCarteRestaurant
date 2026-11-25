using MenuService.Models;
using MenuService.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MenuService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenuOptionsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public MenuOptionsController(AppDbContext db) =>_db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _db.MenuOptions.AsNoTracking().ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var entity = await _db.MenuOptions.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);

            return entity is null ? NotFound(new { message = "Không tìm thấy tùy chọn món ăn" }) : Ok(entity);
        }

        [HttpPost]
        public async Task<IActionResult> Create(MenuOptionDto dto)
        { 
            var entity = new MenuOption
            {
                OptionGroupId = dto.OptionGroupId,
                Name = dto.Name,
                ExtraPrice = dto.ExtraPrice,
                IsAvailable = dto.IsAvailable
            };

            _db.MenuOptions.Add(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _db.MenuOptions.FindAsync(id);
            if (entity is null)
                return NotFound(new { message = "Không tìm thấy tùy chọn món ăn" });

            _db.MenuOptions.Remove(entity);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, MenuOptionDto dto)
        {
            var entity = await _db.MenuOptions.FindAsync(id);
            if (entity is null)
                return NotFound(new { message = "Không tìm thấy tùy chọn món ăn" });

            entity.OptionGroupId = dto.OptionGroupId;
            entity.Name = dto.Name;
            entity.ExtraPrice = dto.ExtraPrice;
            entity.IsAvailable = dto.IsAvailable;

            await _db.SaveChangesAsync();
            return Ok(entity);
        }
    }
}
