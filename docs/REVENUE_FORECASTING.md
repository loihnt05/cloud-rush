# Revenue Forecasting — CloudRush

This document describes the revenue forecasting subsystem implemented in this project: data sources, collection, prediction models, storage, API surface, evaluation, and recommended next steps.

## Purpose

Provide short-term (daily/weekly) revenue predictions to support operational planning, pricing, capacity decisions and reporting. Forecasts are persisted for historical comparison and model validation.

## Data sources

- Bookings (`Booking`) — confirmed bookings and statuses.
- Payments (`Payment`) — successful payments and amounts.
- Passengers (`Passenger`) — passenger counts per booking.
- Flights (`Flight`) — flight schedule context (optional for per-flight analytics).
- Refunds (`Refund`) — refunds and cancellations affecting net revenue.

These are aggregated into daily `revenue_metrics` records used as the historical training data.

## Data collection workflow

- Use the API endpoint `POST /revenue/metrics/collect/{target_date}` to create a `RevenueMetrics` record for a given date. This aggregates bookings, payments, passengers, cancellations and refunds for the date.
- A range-collector endpoint `POST /revenue/metrics/collect-range` can collect metrics for a date range.

Example (requires admin JWT):

```bash
curl -X POST "http://localhost:8000/revenue/metrics/collect/2025-12-01" \
  -H "Authorization: Bearer <admin-token>"
```

## Where data is stored

- Predictions: `revenue_forecasts` table (columns: `forecast_date`, `predicted_revenue`, `actual_revenue`, `confidence_score`, `model_used`, `model_version`, `prediction_type`, `features_used`, `created_at`). See `backend/add_revenue_prediction_tables.sql`.
- Actual metrics: `revenue_metrics` table (daily revenue, booking_count, passenger_count, average_ticket_price, cancellations, refunds).

## Prediction models implemented

All models are implemented in `RevenueService` (`backend/app/services/revenue_service.py`). Supported methods:

- Linear regression (`predict_revenue_linear_regression`)
  - Uses the last 90 days of `revenue_metrics` (falls back to moving average if <7 points).
  - Fits simple linear model (y = m*x + b), computes R² as a confidence proxy.
  - Adds small variance-driven adjustments and stores slope/intercept/R² in `features_used`.

- Moving average (`predict_revenue_moving_average`)
  - Uses a window (default 7 days) of recent actual revenue and predicts the same average for future days.
  - Confidence estimated from standard deviation vs mean.

- Growth-based (`predict_revenue_growth_based`)
  - Splits recent history into halves, computes growth rate between halves, projects revenue exponentially by applying the growth rate over time.

- Default fallback (`_create_default_predictions`)
  - When no historical data exists, returns constant default daily revenue values.

Model selection is exposed through API (`/revenue/predict` with `model_type`, and `/revenue/predict/quick?model=...`).

## API endpoints (summary)

- `POST /revenue/metrics/collect/{target_date}` — collect and store daily metrics.
- `POST /revenue/metrics/collect-range` — collect metrics over a range.
- `GET /revenue/forecasts` — list forecasts (admin only).
- `POST /revenue/forecasts` — create a forecast record manually.
- `POST /revenue/predict` — generate predictions for a date range (returns `RevenuePredictionResult` with per-day forecasts and summary metrics).
- `POST /revenue/predict/quick?days=N&model=...` — quick prediction for next N days.
- `GET /revenue/analytics` — aggregated analytics and trend detection for a period.

## Schemas and returned data

- `RevenueForecastResponse` contains `forecast_date`, `predicted_revenue`, optional `actual_revenue`, `confidence_score`, `model_used`, `features_used` (JSON), and timestamps. See `backend/app/schemas/revenue_schema.py`.
- `RevenuePredictionResult` includes predictions and summary metrics (total predicted revenue, average daily revenue, prediction_count, model_info).

## How forecasting is used in the app

- Frontend components call `POST /revenue/predict/quick` to display quick predictions and `GET /revenue/analytics` for historical statistics. See `frontend/src/components/revenue/prediction-panel.tsx`.
- Forecasts are persisted so the UI can list previous predictions and compare them with actual `revenue_metrics` when available.

## Evaluation & monitoring

- Store `actual_revenue` in the `revenue_forecasts` row when actuals are available (or cross-check against `revenue_metrics`) to compute accuracy metrics (MAPE, RMSE) per model.
- Use `confidence_score` + `features_used` to filter/triage low-confidence predictions.
- Suggested monitoring: weekly retraining check, daily collection job for `revenue_metrics`, and a dashboard showing recent MAPE by model.

## Recommendations for improvement

1. Add automated daily job to collect `revenue_metrics` for the previous day (cron or background worker).
2. Add a scheduled evaluation job that:
   - Matches forecasts to actuals once actuals are available.
   - Computes MAPE/RMSE per model and logs/regresses model selection.
3. Consider adding stronger time-series models for seasonality (SARIMA), or using Prophet / ETS / simple LSTM if traffic justifies complexity.
4. Store model training metadata and versioning (training window, hyperparams, dataset snapshot) to reproduce results.
5. Add unit/integration tests for `RevenueService` methods using a small, seeded `revenue_metrics` dataset.

## Quick example requests

Generate a 14-day quick prediction (linear regression):

```bash
curl -X POST "http://localhost:8000/revenue/predict/quick?days=14&model=linear_regression" \
  -H "Authorization: Bearer <admin-token>"
```

Generate predictions for a date range using the moving average model:

```bash
curl -X POST "http://localhost:8000/revenue/predict" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"start_date":"2025-12-25","end_date":"2026-01-07","model_type":"moving_average","prediction_type":"daily"}'
```

## Next steps I can take for you

- Add a small test harness that seeds `revenue_metrics`, runs each model and prints evaluation metrics.
- Implement a scheduled job (Celery/APS scheduler) to collect metrics and run predictions.
- Integrate a basic model-training metadata table and evaluation dashboard endpoints.

---
File: backend/app/services/revenue_service.py, routers: backend/app/routers/revenue_router.py, schemas: backend/app/schemas/revenue_schema.py
