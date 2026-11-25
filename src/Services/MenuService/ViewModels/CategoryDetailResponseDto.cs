using System.Text.Json.Serialization;

namespace MenuService.ViewModels
{
    public class CategoryDetailResponseDto : CategoryResponseDto
    {
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public List<MenuItemResponseDto>? MenuItems { get; set; }
    }
}
