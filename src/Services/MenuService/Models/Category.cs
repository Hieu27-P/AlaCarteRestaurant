using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MenuService.Models
{
    [Table("categories")]
    public partial class Category
    {
        public Category()
        {
            MenuItems = new HashSet<MenuItem>();
        }

        [Key]
        [Column("id", TypeName = "int(11)")]
        public int Id { get; set; }
        [Column("name")]
        [StringLength(100)]
        public string Name { get; set; } = null!;
        [Required]
        [Column("is_active")]
        public bool? IsActive { get; set; }
        [Column("created_at", TypeName = "datetime")]
        public DateTime CreatedAt { get; set; }
        [Column("updated_at", TypeName = "datetime")]
        public DateTime UpdatedAt { get; set; }

        [InverseProperty("Category")]
        public virtual ICollection<MenuItem> MenuItems { get; set; }
    }
}
