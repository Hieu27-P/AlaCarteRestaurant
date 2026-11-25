using System.ComponentModel.DataAnnotations;

namespace MenuService.ViewModels
{
    public class CreateCategoryDto
    {
        [Required(ErrorMessage = "Tên danh mục không được để trống")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}
