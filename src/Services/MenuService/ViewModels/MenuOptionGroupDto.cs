using System.ComponentModel.DataAnnotations;

namespace MenuService.ViewModels
{
    public class MenuOptionGroupDto
    {
        [Required(ErrorMessage = "Tên nhóm tùy chọn là bắt buộc")]
        [MaxLength(100, ErrorMessage = "Tên nhóm tùy chọn tối đa 100 ký tự")]
        public string Name { get; set; } = string.Empty;
    }
}
