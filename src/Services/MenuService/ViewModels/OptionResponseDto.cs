namespace MenuService.ViewModels
{
    public class OptionResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal ExtraPrice { get; set; }
        public bool? IsAvailable { get; set; }
    }
}
