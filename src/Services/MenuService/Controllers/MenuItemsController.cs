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
        public async Task<IActionResult> GetAll()
        {
            var list = await _db.MenuItems.AsNoTracking().ToListAsync();
            return list is null ? NotFound(new { message = "Không tìm thấy danh sách món ăn" }) : Ok(list);
        }

        [HttpGet("id")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _db.MenuItems.FindAsync(id);
            return item is null ? NotFound(new { message = $"Không tìm thấy món ăn có ID = {id}" }) : Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateMenuItemDto dto)
        {
            var now = DateTime.Now;
            var entity = new MenuItem
            {
                CategoryId = dto.CategoryId,
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                ImageUrl = dto.ImageUrl,
                IsAvailable = dto.IsAvailable,
                CreatedAt = now,
                UpdatedAt = now
            };

            _db.MenuItems.Add(entity);
            await _db.SaveChangesAsync();

            return Ok(entity);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _db.MenuItems.FindAsync(id);

            if (item is null) return NotFound(new { message = $"Không tìm thấy món ăn có ID = {id}" });

            _db.MenuItems.Remove(item);
            await _db.SaveChangesAsync();

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateMenuItemDto dto)
        {
            var entity = await _db.MenuItems.FindAsync(id);
            if (entity == null)
            {
                return NotFound(new { message = $"Không tìm thấy món ăn có ID = {id}" });
            }

            entity.CategoryId = dto.CategoryId;
            entity.Name = dto.Name;
            entity.Description = dto.Description;
            entity.Price = dto.Price;
            entity.ImageUrl = dto.ImageUrl;
            entity.IsAvailable = dto.IsAvailable;

            entity.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();

            return Ok(entity);
        }
    }
}
