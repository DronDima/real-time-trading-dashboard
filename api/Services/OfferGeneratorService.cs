using TradingDashboardApi.Models;

namespace TradingDashboardApi.Services;

public class OfferGeneratorService : IOfferGeneratorService
{
    private static readonly string[] Products = new[]
    {
        "Grain", "Oil", "Gold", "Silver", "Copper", "Platinum", "Palladium",
        "Wheat", "Corn", "Soybeans", "Crude Oil", "Natural Gas", "Coal",
        "Aluminum", "Zinc", "Nickel", "Tin", "Lead", "Iron Ore"
    };

    private static readonly int[] TradingSessionIds = new[] { 1, 2, 3 };
    private readonly Random _random = new();

    public Offer GenerateRandomOffer()
    {
        return new Offer
        {
            TradingSessionId = TradingSessionIds[_random.Next(TradingSessionIds.Length)],
            Product = Products[_random.Next(Products.Length)],
            Price = Math.Round((decimal)(_random.NextDouble() * 5000 + 1), 2),
            Volume = Math.Round((decimal)(_random.NextDouble() * 10000 + 1), 2),
            UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
        };
    }

    public Offer GenerateUpdateForExistingOffer(List<Offer> existingOffers)
    {
        if (existingOffers == null || !existingOffers.Any())
        {
            return GenerateRandomOffer();
        }

        var randomOffer = existingOffers[_random.Next(existingOffers.Count)];
        
        var priceChange = (decimal)(_random.NextDouble() * 0.2 - 0.1);
        var volumeChange = (decimal)(_random.NextDouble() * 0.3 - 0.15);

        return new Offer
        {
            Id = randomOffer.Id,
            TradingSessionId = randomOffer.TradingSessionId,
            Product = randomOffer.Product,
            Price = Math.Round(randomOffer.Price * (1 + priceChange), 2),
            Volume = Math.Round(randomOffer.Volume * (1 + volumeChange), 2),
            UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
        };
    }
}
