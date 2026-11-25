using System.Text.Json.Serialization;

namespace MenuService.ViewModels
{
    public class MenuItemResponseDto
    {
        public int Id { get; set; }
        public int? CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public bool? IsAvailable { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public List<OptionGroupResponseDto>? OptionGroups { get; set; }
    }
}
