using TradingDashboardApi.Models;

namespace TradingDashboardApi.Services;

public class OfferService : IOfferService
{
    private readonly List<Offer> _offers = new();
    private int _nextId = 1;

    public void InitializeOffers(List<Offer> initialOffers)
    {
        _offers.Clear();
        _offers.AddRange(initialOffers);
        _nextId = initialOffers.Any() ? initialOffers.Max(o => o.Id) + 1 : 1;
    }

    public List<Offer> GetAllOffers()
    {
        return new List<Offer>(_offers);
    }

    public List<Offer> GetOffersByTradingSessionId(int tradingSessionId)
    {
        return _offers.Where(o => o.TradingSessionId == tradingSessionId).ToList();
    }

    public Offer? GetOfferById(int id)
    {
        return _offers.FirstOrDefault(o => o.Id == id);
    }

    public Offer AddOffer(Offer offer)
    {
        offer.Id = _nextId++;
        offer.UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
        _offers.Add(offer);
        return offer;
    }

    public Offer UpdateOffer(Offer offer)
    {
        var existingOffer = _offers.FirstOrDefault(o => o.Id == offer.Id);
        if (existingOffer == null)
        {
            throw new ArgumentException($"Offer with id {offer.Id} not found");
        }

        existingOffer.TradingSessionId = offer.TradingSessionId;
        existingOffer.Product = offer.Product;
        existingOffer.Price = offer.Price;
        existingOffer.Volume = offer.Volume;
        existingOffer.UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
        return existingOffer;
    }
}
