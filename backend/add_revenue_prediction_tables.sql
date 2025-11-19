-- ========== UPDATE REVENUE FORECASTS TABLE ==========
-- Add new columns to existing revenue_forecasts table
ALTER TABLE revenue_forecasts 
ADD COLUMN IF NOT EXISTS actual_revenue DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 100),
ADD COLUMN IF NOT EXISTS model_version VARCHAR(50),
ADD COLUMN IF NOT EXISTS prediction_type VARCHAR(50) DEFAULT 'daily' CHECK (prediction_type IN ('daily', 'weekly', 'monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS features_used TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- ========== REVENUE METRICS TABLE ==========
-- Track actual revenue metrics for analysis and comparison
CREATE TABLE IF NOT EXISTS revenue_metrics (
    metric_id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    actual_revenue DECIMAL(12, 2) NOT NULL,
    booking_count INT DEFAULT 0,
    passenger_count INT DEFAULT 0,
    average_ticket_price DECIMAL(10, 2),
    flight_count INT DEFAULT 0,
    cancellation_count INT DEFAULT 0,
    refund_amount DECIMAL(12, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_revenue_forecasts_date ON revenue_forecasts(forecast_date);
CREATE INDEX IF NOT EXISTS idx_revenue_forecasts_type ON revenue_forecasts(prediction_type);
CREATE INDEX IF NOT EXISTS idx_revenue_forecasts_model ON revenue_forecasts(model_used);
CREATE INDEX IF NOT EXISTS idx_revenue_forecasts_confidence ON revenue_forecasts(confidence_score);

CREATE INDEX IF NOT EXISTS idx_revenue_metrics_date ON revenue_metrics(date);
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_revenue ON revenue_metrics(actual_revenue);

-- ========== COMMENTS ==========
COMMENT ON TABLE revenue_forecasts IS 'Stores revenue predictions with model information and confidence scores';
COMMENT ON TABLE revenue_metrics IS 'Stores actual daily revenue metrics for analysis and model training';

COMMENT ON COLUMN revenue_forecasts.confidence_score IS 'Prediction confidence percentage (0-100)';
COMMENT ON COLUMN revenue_forecasts.actual_revenue IS 'Actual revenue for comparison and accuracy tracking';
COMMENT ON COLUMN revenue_forecasts.features_used IS 'JSON string of features used in prediction';
COMMENT ON COLUMN revenue_forecasts.prediction_type IS 'Type of prediction: daily, weekly, monthly, yearly';

COMMENT ON COLUMN revenue_metrics.actual_revenue IS 'Total revenue collected on this date';
COMMENT ON COLUMN revenue_metrics.booking_count IS 'Number of confirmed bookings';
COMMENT ON COLUMN revenue_metrics.passenger_count IS 'Total number of passengers';
COMMENT ON COLUMN revenue_metrics.average_ticket_price IS 'Average price per ticket';
COMMENT ON COLUMN revenue_metrics.cancellation_count IS 'Number of cancellations';
COMMENT ON COLUMN revenue_metrics.refund_amount IS 'Total refunds processed';
