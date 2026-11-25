using System.Text.Json.Serialization;

namespace MenuService.ViewModels
{
    public class OptionGroupResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public List<OptionResponseDto>? Options { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public List<MenuItemResponseDto>? MenuItems { get; set; }
    }
}
