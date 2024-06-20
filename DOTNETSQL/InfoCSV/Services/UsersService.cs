
using InfoCSV.Data; 
using InfoCSV.Models;

namespace InfoCSV.Services
{
    public class UsersService
    {
        private readonly AppDbContext _context;

        public UsersService(AppDbContext context)
        {
            _context = context;
        }

        public async Task BulkInsertUsersAsync(List<User> users)
        {
            if (users == null || users.Count == 0)
                return;

            await _context.BulkInsertAsync(users);
        }
    }




}
