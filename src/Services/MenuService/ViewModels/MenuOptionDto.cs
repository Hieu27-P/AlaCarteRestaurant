using System.ComponentModel.DataAnnotations;

namespace MenuService.ViewModels
{
    public class MenuOptionDto
    {
        [Required]
        public int OptionGroupId { get; set; }

        [Required(ErrorMessage = "Tên tùy chọn không được để trống")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Range(0, double.MaxValue, ErrorMessage = "Giá thêm không được âm")]
        public decimal ExtraPrice { get; set; } = 0;

        public bool IsAvailable { get; set; } = true;
    }
}
