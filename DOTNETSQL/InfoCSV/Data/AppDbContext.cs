using Microsoft.EntityFrameworkCore;
using InfoCSV.Models;

namespace InfoCSV.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd(); 
                entity.HasIndex(e => e.email_id).IsUnique();
                entity.HasAlternateKey(e => e.email_id);
            });
        }
    }
}
