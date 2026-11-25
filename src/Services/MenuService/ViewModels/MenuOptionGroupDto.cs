using System.ComponentModel.DataAnnotations;

namespace MenuService.ViewModels
{
    public class MenuOptionGroupDto
    {
        public int? MenuItemId { get; set; }

        [Required(ErrorMessage = "Tên nhóm tùy chọn không được để trống")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
    }
}
