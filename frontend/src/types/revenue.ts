export interface RevenueForecast {
  forecast_id: number;
  forecast_date: string;
  predicted_revenue: string | number;
  model_used: string | null;
  created_at: string | null;
}
