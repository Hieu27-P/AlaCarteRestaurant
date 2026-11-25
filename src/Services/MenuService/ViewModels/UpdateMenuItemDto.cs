using System.ComponentModel.DataAnnotations;

namespace MenuService.ViewModels
{
    public class UpdateMenuItemDto
    {
        public int? CategoryId { get; set; }
        [Required(ErrorMessage = "Tên món ăn là bắt buộc")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Range(0, double.MaxValue, ErrorMessage = "Giá phải là một số dương")]
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; } = true;
    }
}
