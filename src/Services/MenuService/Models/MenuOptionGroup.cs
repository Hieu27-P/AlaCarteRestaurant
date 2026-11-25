using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MenuService.Models
{
    [Table("menu_option_groups")]
    public partial class MenuOptionGroup
    {
        public MenuOptionGroup()
        {
            MenuOptions = new HashSet<MenuOption>();
            MenuItems = new HashSet<MenuItem>();
        }

        [Key]
        [Column("id", TypeName = "int(11)")]
        public int Id { get; set; }
        [Column("name")]
        [StringLength(100)]
        public string Name { get; set; } = null!;

        [InverseProperty("OptionGroup")]
        public virtual ICollection<MenuOption> MenuOptions { get; set; }

        [ForeignKey("OptionGroupId")]
        [InverseProperty("OptionGroups")]
        public virtual ICollection<MenuItem> MenuItems { get; set; }
    }
}
