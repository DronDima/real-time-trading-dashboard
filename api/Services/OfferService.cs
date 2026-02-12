using Microsoft.AspNetCore.SignalR;
using TradingDashboardApi.Hubs;
using TradingDashboardApi.Models;
using System.Text.Json;

namespace TradingDashboardApi.Services;

public class OfferService : IOfferService
{
    private readonly List<Offer> _offers = new();
    private readonly IHubContext<OffersHub> _hubContext;
    private int _nextId = 1;

    public OfferService(IHubContext<OffersHub> hubContext)
    {
        _hubContext = hubContext;
    }

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

        _ = Task.Run(async () =>
        {
            var socketEvent = new
            {
                type = "OFFER_CREATED",
                payload = offer
            };
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            await _hubContext.Clients.All.SendAsync("OfferEvent", JsonSerializer.Serialize(socketEvent, options));
        });

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

        _ = Task.Run(async () =>
        {
            var socketEvent = new
            {
                type = "OFFER_UPDATED",
                payload = existingOffer
            };
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            await _hubContext.Clients.All.SendAsync("OfferEvent", JsonSerializer.Serialize(socketEvent, options));
        });

        return existingOffer;
    }

    public bool DeleteOffer(int id)
    {
        var offerToRemove = _offers.FirstOrDefault(o => o.Id == id);
        if (offerToRemove == null)
        {
            return false;
        }

        _offers.Remove(offerToRemove);

        _ = Task.Run(async () =>
        {
            var socketEvent = new
            {
                type = "OFFER_DELETED",
                payload = new { id }
            };
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            await _hubContext.Clients.All.SendAsync("OfferEvent", JsonSerializer.Serialize(socketEvent, options));
        });

        return true;
    }

    public void ApplyOfferBatch(OfferBatchPayload batch)
    {
        var deletedSet = batch.Deleted.ToHashSet();
        foreach (var id in batch.Deleted)
        {
            var offer = _offers.FirstOrDefault(o => o.Id == id);
            if (offer != null)
            {
                _offers.Remove(offer);
            }
        }

        foreach (var offer in batch.Updated)
        {
            if (deletedSet.Contains(offer.Id))
            {
                continue;
            }

            var existing = _offers.FirstOrDefault(o => o.Id == offer.Id);
            if (existing != null)
            {
                existing.TradingSessionId = offer.TradingSessionId;
                existing.Product = offer.Product;
                existing.Price = offer.Price;
                existing.Volume = offer.Volume;
                existing.UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
            }
        }

        var created = new List<Offer>();
        foreach (var offer in batch.Created)
        {
            offer.Id = _nextId++;
            offer.UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
            _offers.Add(offer);
            created.Add(offer);
        }

        var updatedIds = batch.Updated.Where(o => !deletedSet.Contains(o.Id)).Select(o => o.Id).ToHashSet();
        var updatedToSend = _offers.Where(o => updatedIds.Contains(o.Id)).ToList();

        _ = Task.Run(async () =>
        {
            var socketEvent = new
            {
                type = "OFFER_BATCH",
                payload = new
                {
                    created,
                    updated = updatedToSend,
                    deleted = batch.Deleted
                }
            };
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            await _hubContext.Clients.All.SendAsync("OfferEvent", JsonSerializer.Serialize(socketEvent, options));
        });
    }
}
