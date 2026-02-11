using Microsoft.Extensions.DependencyInjection;
using TradingDashboardApi.Models;
using TradingDashboardApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<IOfferService, OfferService>();
builder.Services.AddSingleton<IOfferGeneratorService, OfferGeneratorService>();
builder.Services.AddHostedService<OfferGenerationBackgroundService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

var offerService = app.Services.GetRequiredService<IOfferService>();
var initialOffers = new List<Offer>
{
    new Offer { Id = 1, TradingSessionId = 1, Product = "Grain", Price = 150.50m, Volume = 1000, UpdatedAt = "2026-02-11T09:15:00Z" },
    new Offer { Id = 2, TradingSessionId = 1, Product = "Oil", Price = 75.25m, Volume = 500, UpdatedAt = "2026-02-11T09:20:00Z" },
    new Offer { Id = 3, TradingSessionId = 1, Product = "Gold", Price = 2000.00m, Volume = 100, UpdatedAt = "2026-02-11T09:25:00Z" },
    new Offer { Id = 4, TradingSessionId = 2, Product = "Silver", Price = 25.75m, Volume = 2000, UpdatedAt = "2026-02-11T13:10:00Z" },
    new Offer { Id = 5, TradingSessionId = 2, Product = "Copper", Price = 4.50m, Volume = 5000, UpdatedAt = "2026-02-11T13:15:00Z" },
    new Offer { Id = 6, TradingSessionId = 3, Product = "Platinum", Price = 950.00m, Volume = 50, UpdatedAt = "2026-02-10T18:30:00Z" }
};
offerService.InitializeOffers(initialOffers);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAngular");

app.MapControllers();

app.Run();
