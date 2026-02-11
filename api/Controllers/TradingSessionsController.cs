using Microsoft.AspNetCore.Mvc;
using TradingDashboardApi.Models;

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

    private static readonly List<Offer> Offers = new()
    {
        new Offer { Id = 1, TradingSessionId = 1, Product = "Grain", Price = 150.50m, Volume = 1000, UpdatedAt = "2026-02-11T09:15:00Z" },
        new Offer { Id = 2, TradingSessionId = 1, Product = "Oil", Price = 75.25m, Volume = 500, UpdatedAt = "2026-02-11T09:20:00Z" },
        new Offer { Id = 3, TradingSessionId = 1, Product = "Gold", Price = 2000.00m, Volume = 100, UpdatedAt = "2026-02-11T09:25:00Z" },
        new Offer { Id = 4, TradingSessionId = 2, Product = "Silver", Price = 25.75m, Volume = 2000, UpdatedAt = "2026-02-11T13:10:00Z" },
        new Offer { Id = 5, TradingSessionId = 2, Product = "Copper", Price = 4.50m, Volume = 5000, UpdatedAt = "2026-02-11T13:15:00Z" },
        new Offer { Id = 6, TradingSessionId = 3, Product = "Platinum", Price = 950.00m, Volume = 50, UpdatedAt = "2026-02-10T18:30:00Z" }
    };

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
        
        var sessionOffers = Offers.Where(o => o.TradingSessionId == id).ToList();
        session.Offers = sessionOffers;
        
        return Ok(session);
    }
}
