using Microsoft.AspNetCore.Mvc;
using TradingDashboardApi.Models;
using TradingDashboardApi.Services;

namespace TradingDashboardApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TradingSessionsController : ControllerBase
{
    private static readonly List<TradingSession> Sessions = new()
    {
        new TradingSession
        {
            Id = 1,
            Name = "Morning Session",
            StartTime = "2026-02-11T09:00:00Z",
            EndTime = "2026-02-11T12:00:00Z",
            Status = TradingSessionStatus.Active,
            Products = new List<string> { "Grain", "Oil", "Gold" },
            CreatedAt = "2026-02-11T08:00:00Z"
        },
        new TradingSession
        {
            Id = 2,
            Name = "Afternoon Session",
            StartTime = "2026-02-11T13:00:00Z",
            EndTime = "2026-02-11T17:00:00Z",
            Status = TradingSessionStatus.Scheduled,
            Products = new List<string> { "Silver", "Copper" },
            CreatedAt = "2026-02-11T08:00:00Z"
        },
        new TradingSession
        {
            Id = 3,
            Name = "Evening Session",
            StartTime = "2026-02-10T18:00:00Z",
            EndTime = "2026-02-10T22:00:00Z",
            Status = TradingSessionStatus.Completed,
            Products = new List<string> { "Platinum", "Palladium" },
            CreatedAt = "2026-02-10T08:00:00Z"
        }
    };

    private readonly IOfferService _offerService;

    public TradingSessionsController(IOfferService offerService)
    {
        _offerService = offerService;
    }

    [HttpGet]
    public ActionResult<IEnumerable<TradingSession>> GetSessions()
    {
        return Ok(Sessions);
    }

    [HttpGet("{id}")]
    public ActionResult<TradingSession> GetSession(int id)
    {
        var session = Sessions.FirstOrDefault(s => s.Id == id);
        if (session == null)
        {
            return NotFound();
        }
        
        var sessionOffers = _offerService.GetOffersByTradingSessionId(id);
        session.Offers = sessionOffers;
        
        return Ok(session);
    }
}
