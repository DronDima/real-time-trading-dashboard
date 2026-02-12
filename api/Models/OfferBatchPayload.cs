namespace TradingDashboardApi.Models;

public class OfferBatchPayload
{
    public List<Offer> Created { get; set; } = new();
    public List<Offer> Updated { get; set; } = new();
    public List<int> Deleted { get; set; } = new();
}
