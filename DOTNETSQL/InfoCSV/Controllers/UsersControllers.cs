using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Data;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;

namespace InfoCSV.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly string _connectionString;
        private const int BatchSize = 10000;

        public UsersController(MySqlConnection connection)
        {
            _connectionString = connection.ConnectionString;
        }

        [HttpGet]
        public IActionResult TestDatabaseConnection()
        {
            try
            {
                using (var connection = new MySqlConnection(_connectionString))
                {
                    connection.Open();
                    connection.Close();
                }
                return Ok("Database connection test successful.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database connection error: {ex.Message}");
            }
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadCsv(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            try
            {
                var dataTable = new DataTable();
                using (var reader = new StreamReader(file.OpenReadStream()))
                using (var csv = new CsvReader(reader, new CsvConfiguration(System.Globalization.CultureInfo.CurrentCulture)))
                {
                    using (var dr = new CsvDataReader(csv))
                    {
                        dataTable.Load(dr);
                    }
                }

                await BulkInsertAsync(dataTable);
                return Ok("Data uploaded successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private async Task BulkInsertAsync(DataTable dataTable)
        {
            using (var connection = new MySqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                using (var transaction = await connection.BeginTransactionAsync())
                {
                    try
                    {
                        var columns = string.Join(",", dataTable.Columns.Cast<DataColumn>().Select(c => c.ColumnName));
                        var updateColumns = string.Join(",", dataTable.Columns.Cast<DataColumn>().Select(c => $"{c.ColumnName}=VALUES({c.ColumnName})"));

                        var batchSize = BatchSize;
                        var totalRows = dataTable.Rows.Count;

                        for (int i = 0; i < totalRows; i += batchSize)
                        {
                            var batchRows = dataTable.AsEnumerable().Skip(i).Take(batchSize);
                            var valuesList = new StringBuilder();

                            foreach (var row in batchRows)
                            {
                                var values = string.Join(",", dataTable.Columns.Cast<DataColumn>().Select(c => $"'{MySqlHelper.EscapeString(row[c].ToString())}'"));
                                valuesList.Append($"({values}),");
                            }

                            if (valuesList.Length > 0)
                            {
                                valuesList.Length--;
                                var commandText = $"INSERT INTO users ({columns}) VALUES {valuesList} ON DUPLICATE KEY UPDATE {updateColumns};";

                                using (var cmd = new MySqlCommand(commandText, connection, (MySqlTransaction)transaction))
                                {
                                    await cmd.ExecuteNonQueryAsync();
                                }
                            }
                        }

                        await transaction.CommitAsync();
                    }
                    catch (Exception)
                    {
                        await transaction.RollbackAsync();
                        throw;
                    }
                }
            }
        }
    }
}






       

















/*
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
                _context.Users.BulkUpdate(usersToUpdate);
            }

            if (usersToInsert.Any())
            {
                await _context.Users.BulkInsertAsync(usersToInsert);
            }

            //await _context.BulkSaveChangesAsync();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
}
*/