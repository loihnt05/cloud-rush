export interface RevenueForecast {
  forecast_id: number;
  forecast_date: string;
  predicted_revenue: string | number;
  actual_revenue?: string | number | null;
  confidence_score?: number | null;
  model_used?: string | null;
  model_version?: string | null;
  prediction_type?: string | null;
  features_used?: string | null;
  notes?: string | null;
  created_at?: string | null;
}

export interface RevenueMetrics {
  metric_id: number;
  date: string;
  actual_revenue: string | number;
  booking_count: number;
  passenger_count: number;
  average_ticket_price?: string | number | null;
  flight_count: number;
  cancellation_count: number;
  refund_amount: string | number;
  notes?: string | null;
  created_at?: string | null;
}

export interface PredictionRequest {
  start_date: string;
  end_date: string;
  prediction_type?: string;
  model_type?: string;
}

export interface RevenuePredictionResult {
  predictions: RevenueForecast[];
  metrics: {
    total_predicted_revenue: number;
    average_daily_revenue: number;
    prediction_count: number;
    date_range: string;
  };
  model_info: {
    model_type: string;
    prediction_type: string;
    average_confidence: number;
  };
  accuracy?: number | null;
}

export interface RevenueAnalytics {
  total_revenue: string | number;
  average_daily_revenue: string | number;
  total_bookings: number;
  total_passengers: number;
  average_ticket_price: string | number;
  growth_rate?: number | null;
  trend?: string | null;
  best_day?: string | null;
  worst_day?: string | null;
}
