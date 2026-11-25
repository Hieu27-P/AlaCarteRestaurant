using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MenuService.Models
{
    [Table("menu_items")]
    [Index("CategoryId", Name = "category_id")]
    public partial class MenuItem
    {
        public MenuItem()
        {
            OptionGroups = new HashSet<MenuOptionGroup>();
        }

        [Key]
        [Column("id", TypeName = "int(11)")]
        public int Id { get; set; }
        [Column("category_id", TypeName = "int(11)")]
        public int? CategoryId { get; set; }
        [Column("name")]
        [StringLength(150)]
        public string Name { get; set; } = null!;
        [Column("description")]
        [StringLength(500)]
        public string? Description { get; set; }
        [Column("price")]
        [Precision(10, 2)]
        public decimal Price { get; set; }
        [Column("image_url")]
        [StringLength(500)]
        public string? ImageUrl { get; set; }
        [Required]
        [Column("is_available")]
        public bool? IsAvailable { get; set; }
        [Column("created_at")]
        [MaxLength(6)]
        public DateTime CreatedAt { get; set; }
        [Column("updated_at")]
        [MaxLength(6)]
        public DateTime UpdatedAt { get; set; }

        [ForeignKey("CategoryId")]
        [InverseProperty("MenuItems")]
        public virtual Category? Category { get; set; }

        [ForeignKey("MenuItemId")]
        [InverseProperty("MenuItems")]
        public virtual ICollection<MenuOptionGroup> OptionGroups { get; set; }
    }
}
