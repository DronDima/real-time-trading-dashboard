using TradingDashboardApi.Models;

namespace TradingDashboardApi.Services;

public interface IOfferService
{
    List<Offer> GetAllOffers();
    List<Offer> GetOffersByTradingSessionId(int tradingSessionId);
    Offer? GetOfferById(int id);
    Offer AddOffer(Offer offer);
    Offer UpdateOffer(Offer offer);
    void InitializeOffers(List<Offer> initialOffers);
}
