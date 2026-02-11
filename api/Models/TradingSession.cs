namespace TradingDashboardApi.Models;

public class TradingSession
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public TradingSessionStatus Status { get; set; }
    public List<string> Products { get; set; } = new();
    public string CreatedAt { get; set; } = string.Empty;
    public List<Offer> Offers { get; set; } = new();
}
