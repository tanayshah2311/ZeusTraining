//using InfoCSV.Data;
// using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using MySql.Data.MySqlClient;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

string? connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddSingleton<MySqlConnection>(new MySqlConnection(connectionString));

// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"),
//     new MySqlServerVersion(new Version(8, 0, 25))));


builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
});


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}



app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
});



app.Run();
