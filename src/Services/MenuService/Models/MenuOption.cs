using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MenuService.Models
{
    [Table("menu_options")]
    [Index("OptionGroupId", Name = "option_group_id")]
    public partial class MenuOption
    {
        [Key]
        [Column("id", TypeName = "int(11)")]
        public int Id { get; set; }
        [Column("option_group_id", TypeName = "int(11)")]
        public int OptionGroupId { get; set; }
        [Column("name")]
        [StringLength(100)]
        public string Name { get; set; } = null!;
        [Column("extra_price")]
        [Precision(10, 2)]
        public decimal ExtraPrice { get; set; }
        [Required]
        [Column("is_available")]
        public bool? IsAvailable { get; set; }

        [ForeignKey("OptionGroupId")]
        [InverseProperty("MenuOptions")]
        public virtual MenuOptionGroup OptionGroup { get; set; } = null!;
    }
}
