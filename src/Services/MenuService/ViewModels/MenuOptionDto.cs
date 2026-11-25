using System.ComponentModel.DataAnnotations;

namespace MenuService.ViewModels
{
    public class MenuOptionDto
    {
        [Required(ErrorMessage = "Nhóm tùy chọn là bắt buộc")]
        public int OptionGroupId { get; set; }

        [Required(ErrorMessage = "Tên tùy chọn là bắt buộc")]
        [MaxLength(100, ErrorMessage = "Tên tùy chọn tối đa 100 ký tự")]
        public string Name { get; set; } = string.Empty;

        [Range(0, double.MaxValue, ErrorMessage = "Giá thêm phải là một số dương")]
        public decimal ExtraPrice { get; set; }

        public bool IsAvailable { get; set; } = true;
    }
}
