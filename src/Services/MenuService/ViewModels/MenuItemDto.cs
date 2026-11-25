using System.ComponentModel.DataAnnotations;

namespace MenuService.ViewModels
{
    public class MenuItemDto
    {
        public int? CategoryId { get; set; }
        [Required(ErrorMessage = "Tên món ăn là bắt buộc")]
        [MaxLength(150, ErrorMessage = "Tên món tối đa 150 ký tự")]
        public string Name { get; set; } = string.Empty;
        [MaxLength(500, ErrorMessage = "Mô tả tối đa 500 ký tự")]
        public string? Description { get; set; }
        [Range(0, double.MaxValue, ErrorMessage = "Giá phải là một số dương")]
        public decimal Price { get; set; }
        [MaxLength(500, ErrorMessage = "Đường dẫn ảnh tối đa 500 ký tự")]
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; } = true;
        public List<int> OptionGroupIds { get; set; } = new();
    }
}
