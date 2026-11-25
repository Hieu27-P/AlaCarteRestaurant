using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MenuService.Models
{
    [Table("menu_option_groups")]
    [Index("MenuItemId", Name = "menu_item_id")]
    public partial class MenuOptionGroup
    {
        public MenuOptionGroup()
        {
            MenuOptions = new HashSet<MenuOption>();
        }

        [Key]
        [Column("id", TypeName = "int(11)")]
        public int Id { get; set; }
        [Column("menu_item_id", TypeName = "int(11)")]
        public int MenuItemId { get; set; }
        [Column("name")]
        [StringLength(100)]
        public string Name { get; set; } = null!;

        [ForeignKey("MenuItemId")]
        [InverseProperty("MenuOptionGroups")]
        public virtual MenuItem MenuItem { get; set; } = null!;
        [InverseProperty("OptionGroup")]
        public virtual ICollection<MenuOption> MenuOptions { get; set; }
    }
}
