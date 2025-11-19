import appAxios from "@/services/AxiosClient";
import type { 
  RevenueForecast, 
  RevenueMetrics, 
  PredictionRequest,
  RevenuePredictionResult,
  RevenueAnalytics 
} from "@/types/revenue";

// ============ FORECAST APIs ============
export const getAllForecasts = async (): Promise<RevenueForecast[]> => {
  const response = await appAxios.get<RevenueForecast[]>('/revenue/forecasts');
  if (!response.data) {
    throw new Error("Failed to fetch revenue forecasts");
  }
  return response.data;
};

export const getForecastsByDateRange = async (
  startDate: string, 
  endDate: string
): Promise<RevenueForecast[]> => {
  const response = await appAxios.get<RevenueForecast[]>('/revenue/forecasts', {
    params: { start_date: startDate, end_date: endDate }
  });
  if (!response.data) {
    throw new Error("Failed to fetch forecasts");
  }
  return response.data;
};

export const getLatestForecasts = async (limit: number = 10): Promise<RevenueForecast[]> => {
  const response = await appAxios.get<RevenueForecast[]>('/revenue/forecasts/latest', {
    params: { limit }
  });
  if (!response.data) {
    throw new Error("Failed to fetch latest forecasts");
  }
  return response.data;
};

export const createForecast = async (forecast: Partial<RevenueForecast>): Promise<RevenueForecast> => {
  const response = await appAxios.post<RevenueForecast>('/revenue/forecasts', forecast);
  if (!response.data) {
    throw new Error("Failed to create forecast");
  }
  return response.data;
};

// ============ PREDICTION APIs ============
export const generatePredictions = async (
  request: PredictionRequest
): Promise<RevenuePredictionResult> => {
  const response = await appAxios.post<RevenuePredictionResult>('/revenue/predict', request);
  if (!response.data) {
    throw new Error("Failed to generate predictions");
  }
  return response.data;
};

export const quickPrediction = async (
  days: number = 30,
  model: string = "linear_regression"
): Promise<RevenueForecast[]> => {
  const response = await appAxios.post<RevenueForecast[]>('/revenue/predict/quick', null, {
    params: { days, model }
  });
  if (!response.data) {
    throw new Error("Failed to generate quick prediction");
  }
  return response.data;
};

// ============ METRICS APIs ============
export const getAllMetrics = async (): Promise<RevenueMetrics[]> => {
  const response = await appAxios.get<RevenueMetrics[]>('/revenue/metrics');
  if (!response.data) {
    throw new Error("Failed to fetch metrics");
  }
  return response.data;
};

export const getMetricsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<RevenueMetrics[]> => {
  const response = await appAxios.get<RevenueMetrics[]>('/revenue/metrics', {
    params: { start_date: startDate, end_date: endDate }
  });
  if (!response.data) {
    throw new Error("Failed to fetch metrics");
  }
  return response.data;
};

export const createMetric = async (metric: Partial<RevenueMetrics>): Promise<RevenueMetrics> => {
  const response = await appAxios.post<RevenueMetrics>('/revenue/metrics', metric);
  if (!response.data) {
    throw new Error("Failed to create metric");
  }
  return response.data;
};

export const collectMetricsForDate = async (targetDate: string): Promise<RevenueMetrics> => {
  const response = await appAxios.post<RevenueMetrics>(`/revenue/metrics/collect/${targetDate}`);
  if (!response.data) {
    throw new Error("Failed to collect metrics");
  }
  return response.data;
};

export const collectMetricsRange = async (
  startDate: string,
  endDate: string
): Promise<RevenueMetrics[]> => {
  const response = await appAxios.post<RevenueMetrics[]>('/revenue/metrics/collect-range', null, {
    params: { start_date: startDate, end_date: endDate }
  });
  if (!response.data) {
    throw new Error("Failed to collect metrics range");
  }
  return response.data;
};

// ============ ANALYTICS APIs ============
export const getRevenueAnalytics = async (
  startDate?: string,
  endDate?: string
): Promise<RevenueAnalytics> => {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  const response = await appAxios.get<RevenueAnalytics>('/revenue/analytics', { params });
  if (!response.data) {
    throw new Error("Failed to fetch analytics");
  }
  return response.data;
};
