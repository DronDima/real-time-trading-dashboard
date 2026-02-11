using TradingDashboardApi.Models;

namespace TradingDashboardApi.Services;

public class OfferGenerationBackgroundService : BackgroundService
{
    private readonly IOfferService _offerService;
    private readonly IOfferGeneratorService _offerGeneratorService;
    private readonly Random _random = new();
    private readonly ILogger<OfferGenerationBackgroundService> _logger;

    public OfferGenerationBackgroundService(
        IOfferService offerService,
        IOfferGeneratorService offerGeneratorService,
        ILogger<OfferGenerationBackgroundService> logger)
    {
        _offerService = offerService;
        _offerGeneratorService = offerGeneratorService;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var allOffers = _offerService.GetAllOffers();

                if (allOffers.Count > 0 && _random.Next(2) == 0)
                {
                    var updatedOffer = _offerGeneratorService.GenerateUpdateForExistingOffer(allOffers);
                    _offerService.UpdateOffer(updatedOffer);
                    _logger.LogInformation("Updated offer {OfferId} for trading session {TradingSessionId}",
                        updatedOffer.Id, updatedOffer.TradingSessionId);
                }
                else
                {
                    var newOffer = _offerGeneratorService.GenerateRandomOffer();
                    _offerService.AddOffer(newOffer);
                    _logger.LogInformation("Generated new offer for trading session {TradingSessionId}, product {Product}",
                        newOffer.TradingSessionId, newOffer.Product);
                }

                var delaySeconds = _random.Next(5, 11);
                await Task.Delay(TimeSpan.FromSeconds(delaySeconds), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while generating offers");
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }
}
