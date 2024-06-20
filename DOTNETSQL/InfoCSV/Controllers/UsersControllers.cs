using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InfoCSV.Data;
using InfoCSV.Models;

namespace InfoCSV.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("/api/users/upload")]
        public async Task<IActionResult> UploadUsers(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            if (!file.ContentType.Equals("text/csv") && !file.ContentType.Equals("application/vnd.ms-excel"))
            {
                return BadRequest("Unsupported file type. Expected CSV.");
            }

            int totalRecords = 0;
            int updatedRecords = 0;
            int insertedRecords = 0;
            int batchSize = 100000;

            try
            {
                using (var reader = new StreamReader(file.OpenReadStream()))
                {
                    var headerLine = await reader.ReadLineAsync();

                    var existingUsers = await _context.Users.ToDictionaryAsync(u => u.email_id); 

                    var usersToUpdate = new List<User>();
                    var usersToInsert = new List<User>();

                    while (reader.Peek() >= 0)
                    {
                        var line = await reader.ReadLineAsync();
                        if (!string.IsNullOrWhiteSpace(line))
                        {
                            var values = line.Split(',');

                            if (values.Length < 14)
                            {
                                continue;
                            }

                            DateOnly? dateOfBirth = null;
                            if (DateOnly.TryParse(values[8], out DateOnly parsedDate))
                            {
                                dateOfBirth = parsedDate;
                            }

                            var email = values[0];

                            if (existingUsers.TryGetValue(email, out var existingUser))
                            {
                                existingUser.name = values[1];
                                existingUser.country = values[2];
                                existingUser.state = values[3];
                                existingUser.city = values[4];
                                existingUser.telephone_number = values[5];
                                existingUser.address_line_1 = values[6];
                                existingUser.address_line_2 = values[7];
                                existingUser.date_of_birth = dateOfBirth;
                                existingUser.gross_salary_FY2019_20 = decimal.TryParse(values[9], out decimal gs2019_20) ? gs2019_20 : 0;
                                existingUser.gross_salary_FY2020_21 = decimal.TryParse(values[10], out decimal gs2020_21) ? gs2020_21 : 0;
                                existingUser.gross_salary_FY2021_22 = decimal.TryParse(values[11], out decimal gs2021_22) ? gs2021_22 : 0;
                                existingUser.gross_salary_FY2022_23 = decimal.TryParse(values[12], out decimal gs2022_23) ? gs2022_23 : 0;
                                existingUser.gross_salary_FY2023_24 = decimal.TryParse(values[13], out decimal gs2023_24) ? gs2023_24 : 0;

                                updatedRecords++;
                                usersToUpdate.Add(existingUser);
                            }
                            else
                            {
                                var newUser = new User
                                {
                                    email_id = email,
                                    name = values[1],
                                    country = values[2],
                                    state = values[3],
                                    city = values[4],
                                    telephone_number = values[5],
                                    address_line_1 = values[6],
                                    address_line_2 = values[7],
                                    date_of_birth = dateOfBirth,
                                    gross_salary_FY2019_20 = decimal.TryParse(values[9], out decimal gs2019_20) ? gs2019_20 : 0,
                                    gross_salary_FY2020_21 = decimal.TryParse(values[10], out decimal gs2020_21) ? gs2020_21 : 0,
                                    gross_salary_FY2021_22 = decimal.TryParse(values[11], out decimal gs2021_22) ? gs2021_22 : 0,
                                    gross_salary_FY2022_23 = decimal.TryParse(values[12], out decimal gs2022_23) ? gs2022_23 : 0,
                                    gross_salary_FY2023_24 = decimal.TryParse(values[13], out decimal gs2023_24) ? gs2023_24 : 0,
                                };

                                insertedRecords++;
                                usersToInsert.Add(newUser);
                            }

                            totalRecords++;

                            if (usersToUpdate.Count + usersToInsert.Count >= batchSize)
                            {
                                await SaveChangesBatch(usersToUpdate, usersToInsert);
                                usersToUpdate.Clear();
                                usersToInsert.Clear();
                            }
                        }
                    }

                    if (usersToUpdate.Any() || usersToInsert.Any())
                    {
                        await SaveChangesBatch(usersToUpdate, usersToInsert);
                    }
                }

                return Ok(new
                {
                    TotalRecords = totalRecords,
                    UpdatedRecords = updatedRecords,
                    InsertedRecords = insertedRecords
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Database error: {ex.Message}");
            }
        }

        private async Task SaveChangesBatch(List<User> usersToUpdate, List<User> usersToInsert)
        {
            if (usersToUpdate.Any())
            {
                _context.Users.UpdateRange(usersToUpdate);
            }

            if (usersToInsert.Any())
            {
                await _context.Users.BulkInsertOptimizedAsync(usersToInsert);
            }

            await _context.SaveChangesAsync();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
}
