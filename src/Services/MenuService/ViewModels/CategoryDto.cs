using System.ComponentModel.DataAnnotations;

namespace MenuService.ViewModels
{
    public class CategoryDto
    {
        [Required(ErrorMessage = "Tên danh mục không được để trống")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}
