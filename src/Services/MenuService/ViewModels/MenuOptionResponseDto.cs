using System.Text.Json.Serialization;

namespace MenuService.ViewModels
{
    public class MenuOptionResponseDto
    {
        public int Id { get; set; }
        public int OptionGroupId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal ExtraPrice { get; set; }
        public bool? IsAvailable { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public OptionGroupResponseDto? OptionGroup { get; set; }
    }
}
