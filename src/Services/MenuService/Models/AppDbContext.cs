using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace MenuService.Models
{
    public partial class AppDbContext : DbContext
    {
        public AppDbContext()
        {
        }

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Category> Categories { get; set; } = null!;
        public virtual DbSet<MenuItem> MenuItems { get; set; } = null!;
        public virtual DbSet<MenuOption> MenuOptions { get; set; } = null!;
        public virtual DbSet<MenuOptionGroup> MenuOptionGroups { get; set; } = null!;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
                optionsBuilder.UseMySql("server=localhost;database=menu_db;user=root", Microsoft.EntityFrameworkCore.ServerVersion.Parse("10.11.16-mariadb"));
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.UseCollation("utf8mb4_general_ci")
                .HasCharSet("utf8mb4");

            modelBuilder.Entity<Category>(entity =>
            {
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("current_timestamp()");

                entity.Property(e => e.IsActive).HasDefaultValueSql("'1'");

                entity.Property(e => e.UpdatedAt)
                    .ValueGeneratedOnAddOrUpdate()
                    .HasDefaultValueSql("current_timestamp()");
            });

            modelBuilder.Entity<MenuItem>(entity =>
            {
                entity.Property(e => e.IsAvailable).HasDefaultValueSql("'1'");

                entity.HasOne(d => d.Category)
                    .WithMany(p => p.MenuItems)
                    .HasForeignKey(d => d.CategoryId)
                    .OnDelete(DeleteBehavior.SetNull)
                    .HasConstraintName("menu_items_ibfk_1");
            });

            modelBuilder.Entity<MenuOption>(entity =>
            {
                entity.Property(e => e.IsAvailable).HasDefaultValueSql("'1'");

                entity.HasOne(d => d.OptionGroup)
                    .WithMany(p => p.MenuOptions)
                    .HasForeignKey(d => d.OptionGroupId)
                    .HasConstraintName("menu_options_ibfk_1");
            });

            modelBuilder.Entity<MenuOptionGroup>(entity =>
            {
                entity.HasOne(d => d.MenuItem)
                    .WithMany(p => p.MenuOptionGroups)
                    .HasForeignKey(d => d.MenuItemId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("menu_option_groups_ibfk_1");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
