using TradingDashboardApi.Models;

namespace TradingDashboardApi.Services;

public interface IOfferGeneratorService
{
    Offer GenerateRandomOffer();
    Offer GenerateUpdateForExistingOffer(List<Offer> existingOffers);
}
