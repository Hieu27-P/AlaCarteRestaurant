var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình CORS cho phép React (Frontend) gọi vào
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 2. Nạp cấu hình YARP
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// 3. Kích hoạt CORS
app.UseCors("AllowFrontend");

// 4. Kích hoạt Gateway
app.MapReverseProxy();

app.Run();