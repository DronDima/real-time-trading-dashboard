using TradingDashboardApi.Models;

namespace TradingDashboardApi.Services;

public class OfferGenerationBackgroundService : BackgroundService
{
    private static readonly int[] SessionIds = { 1, 2, 3 };

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
                var batch = new OfferBatchPayload();

                foreach (var sessionId in SessionIds)
                {
                    var sessionOffers = _offerService.GetOffersByTradingSessionId(sessionId);
                    var changeCount = _random.Next(0, 4);

                    for (var i = 0; i < changeCount; i++)
                    {
                        var action = sessionOffers.Count > 0 ? _random.Next(3) : 0;

                        if (action == 0)
                        {
                            var newOffer = _offerGeneratorService.GenerateRandomOffer();
                            newOffer.TradingSessionId = sessionId;
                            batch.Created.Add(newOffer);
                        }
                        else if (action == 1)
                        {
                            var updated = _offerGeneratorService.GenerateUpdateForExistingOffer(sessionOffers);
                            batch.Updated.Add(updated);
                        }
                        else
                        {
                            var toDelete = sessionOffers[_random.Next(sessionOffers.Count)];
                            batch.Deleted.Add(toDelete.Id);
                            sessionOffers = sessionOffers.Where(o => o.Id != toDelete.Id).ToList();
                        }
                    }
                }

                if (batch.Created.Count > 0 || batch.Updated.Count > 0 || batch.Deleted.Count > 0)
                {
                    _offerService.ApplyOfferBatch(batch);
                }

                var delayMs = _random.Next(500, 1501);
                await Task.Delay(delayMs, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while generating offers");
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }
}
