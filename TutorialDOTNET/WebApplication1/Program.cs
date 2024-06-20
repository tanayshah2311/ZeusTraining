using Microsoft.AspNetCore.Http.HttpResults;

var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

var todos = new List<Todo>(); 

app.MapGet("/todos", ()=>todos);

app.MapGet("/todos/{id}", Results<Ok<Todo>, NotFound> (int id)=>
{
    var targetTodo = todos.SingleOrDefault(t => id == t.Id);
    return targetTodo is null
        ? TypedResults.NotFound()
        : TypedResults.Ok(targetTodo);
});


app.MapPost("/todos", (Todo task)=>
{
    todos.Add(task);
    return TypedResults.Created("/todos/{id}", task);
});

app.MapDelete("/todos/{id}", (int id)=>
{
    todos.RemoveAll(t => id == t.Id);
    return TypedResults.NoContent();
});

app.MapPost("/upload", async (HttpRequest request) =>
{
    if (!request.HasFormContentType)
    {
        return Results.BadRequest("Expected a multipart/form-data request");
    }

    var form = await request.ReadFormAsync();

    var file = form.Files.GetFile("file");

    if (file == null || file.Length == 0)
    {
        return Results.BadRequest("No file uploaded");
    }

    using (var streamReader = new StreamReader(file.OpenReadStream()))
    {
        string? headerLine = await streamReader.ReadLineAsync();
        
        if (headerLine == null)
        {
            return Results.BadRequest("Empty file");
        }

        while (!streamReader.EndOfStream)
        {
            var line = await streamReader.ReadLineAsync();
            if (line != null)
            {
                var values = line.Split(',');

                if (values.Length != 2 || !int.TryParse(values[0], out int id))
                {
                    continue; 
                }

                var todoItem = new Todo(id, values[1]);
                todos.Add(todoItem);
            }
        }
    }

    return Results.Ok(todos);
});




app.Run();


public record Todo(int Id, string Name);