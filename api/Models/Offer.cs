namespace TradingDashboardApi.Models;

public class Offer
{
    public int Id { get; set; }
    public int TradingSessionId { get; set; }
    public string Product { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal Volume { get; set; }
    public string UpdatedAt { get; set; } = string.Empty;
}
