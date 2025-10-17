# ✈️ Airline Ticket Sales Revenue Predictor

**Project Type:** Time Series Forecasting  
**Frontend:** React  
**Backend:** FastAPI  
**Team Members:** 2

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100.0-green?logo=fastapi&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Dataset](#dataset)
- [Modeling Approach](#modeling-approach)
- [Installation](#installation)
- [Usage](#usage)
- [System Flow](#system-flow)
- [Results](#results)
- [License](#license)

## Overview

Flight ticket revenue is influenced by seasonality, holidays, and market demand. This project leverages **time series forecasting** to predict future revenue, helping airlines and travel agencies optimize pricing and capacity planning.

The system consists of:

- **Backend (FastAPI):** Provides a REST API for predictions.
- **Frontend (React):** Interactive dashboard for visualizing historical revenue and forecasts.
- **Forecasting Algorithms:**

  - **Statistical models:**
    - **ARIMA / SARIMA:** Capture trends and seasonality in stationary time series. Good for short-term forecasts and interpretable results.
  - **Machine Learning models:**
    - **Random Forest / XGBoost:** Treats lagged values and engineered features as predictors. Can capture nonlinear relationships.
  - **Deep Learning models:**
    - **Transformer-based models:** Handle complex sequential patterns with attention mechanisms.
  - **Hybrid approaches:** Combine statistical and ML/DL models to improve robustness.

## Features

- Predict daily, weekly, or monthly flight revenue.
- Visualize historical revenue trends and forecast results.
- Interactive dashboard to explore trends and models.
- Compare multiple forecasting models (Prophet, XGBoost).

## Tech Stack

- **Frontend:** React, Tailwind CSS, Recharts
- **Backend:** FastAPI, Python, Pandas, Prophet/XGBoost
- **Database:** PostgreSQL
- **Deployment:** Docker

## Dataset

- Historical flight ticket revenue (date, route, revenue, etc.)
- Preprocessing includes handling missing values, aggregating revenue, and feature engineering for modeling.

## Modeling Approach

- **Time Series Models:** Prophet, ARIMA/SARIMA
- **Machine Learning Models:** XGBoost, Random Forest
- **Evaluation Metrics:** RMSE, MAE, MAPE

## Installation

### Backend (FastAPI)

1. Clone the repository and navigate to the backend folder:

```bash
git clone https://github.com/loihnt05/cloud-rush.git
cd cloud-rush/backend
```

2. Create a virtual environment and install dependencies:

```bash
docker compose up --build
```

The API will be available at http://localhost:8000

See document at http://localhost:8000/docs

### Frontend (React)

1. Navigate to the frontend folder:

```bash
cd ../frontend
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the React app:

```bash
pnpm run dev
```

Cloudrush will be available at http://localhost:5173

## Usage
To use the Airline Ticket Sales Revenue Predictor:

1. **Access the Frontend Dashboard:**  
  Visit [https://cloud-rush.netlify.app/](https://cloud-rush.netlify.app/) to interact with the web application.

2. **Explore Historical Data & Forecasts:**  
  - Upload or select a dataset to visualize historical revenue trends.
  - Choose forecasting models and parameters directly from the dashboard.
  - View and compare prediction results in interactive charts.

3. **API Access:**  
  For programmatic access or integration, use the backend REST API at [https://cloud-rush.onrender.com/docs](https://cloud-rush.onrender.com/docs) to submit data and retrieve forecasts.

No local installation is required—everything runs in the cloud!
But if you want to use in local, check readme.md in backend and frontend folder!

## System Flow

### Step 1: Data Initialization (Seeding Phase)

Populate the reference data before starting the backend so every downstream feature has the entities it needs.

| Table | Purpose | Key Fields |
| --- | --- | --- |
| `roles` | Controls authorization levels | `id`, `name` (`Admin`, `Traveler`, `Agent`) |
| `airplanes` | Master list of aircraft | `id`, `model`, `capacity` |
| `seats` | Seats per aircraft | `id`, `airplane_id`, `seat_number`, `is_available` |
| `flights` | Schedules that travelers can search | `id`, `flight_number`, `origin`, `destination`, `departure_time`, `arrival_time`, `price` |
| `places` | Curated destinations | `id`, `name`, `country`, `description` |
| `services` | Add-on services | `id`, `type`, `price`, `vendor` |

- Use the provided `cloudrush.sql` or a dedicated seed script to insert baseline rows. Reseed on clean databases so joins remain consistent.
- When seats are generated, ensure each `seat.airplane_id` points to an existing aircraft and that the number of seats matches the airplane capacity.

### Step 2: User Registration / Authentication

1. Users initiate sign-up or login through Auth0 (or a compatible OAuth/OIDC provider) using email/password or social login. Successful authentication yields `provider`, `provider_id`, and profile claims.
2. Persist or upsert the user in the local `users` table with a foreign key to `roles.id`. Default new users to the `Traveler` role; admins can promote others as needed.
3. Exchange the Auth0 credentials for a JWT. Store it client-side and attach it as a Bearer token on every subsequent API call.
4. FastAPI middleware validates the token on protected routes, injects the user context, and enforces role-based access policies.

### Step 3: Search Flights

- **Endpoint:** `GET /flights`
- **Query parameters:** `origin`, `destination`, `date`
- The backend filters the `flights` table by origin/destination and narrows by the requested departure date range.
- To display seat availability, join `flights` ⟂ `airplanes` ⟂ `seats` and count seats where `is_available = TRUE`.
- Responses return flight metadata, pricing, and optionally the seat inventory snapshot so users can pick specific seats in the next step.

### Step 4: Booking a Flight

1. Traveler selects a flight and seat and calls `POST /bookings` with `flight_id`, `seat_id`, passenger details, and optional services.
2. The backend verifies:
   - Seat belongs to the same flight (`seat.airplane_id` matches flight aircraft).
   - Seat is still available.
   - User has permission to book (role = `Traveler` or `Agent`).
3. On success, create a `bookings` record with `status = 'pending'` and relate it to the traveler.
4. Mark the chosen seat as reserved (`is_available = FALSE`). Hold times or automatic release logic can be layered on later.

### Step 5: Payment Process

- **Endpoint:** `POST /payments`
- Expected payload contains `booking_id`, `amount`, `currency`, and the payment provider metadata.
- Workflow:
  1. Confirm booking status is `pending`.
  2. Charge through the payment gateway and log the transaction reference.
  3. Insert a `payments` row with `status = 'success'` (or store failure details for retries).
  4. Transition the booking state to `confirmed` and emit domain events/notifications.

### Step 6: Optional Add-on Services

- Travelers can enrich the booking by adding services (hotel, car, packages) through `POST /booking-services`.
- The payload links `booking_id` with one or more `service_id` values, plus service-specific configuration (dates, guest counts, etc.).
- The backend stores records in a join table (e.g., `booking_services`) and recalculates the booking total so subsequent payments reflect the full itinerary cost.

### Step 7: Trip Planning

- **Endpoint:** `POST /trips`
- Users compose itineraries that span multiple flights and experiences. A trip includes owner info, travel window, and preferences.
- Attach activities via `POST /trip-activities`, referencing flights, services, and places. This forms a timeline the frontend can visualize.
- Trip editing stays idempotent: repeating the same activity updates it instead of duplicating rows.

### Step 8: Data for Revenue Forecasting

- Forecasting pulls from operational tables once bookings close and payments settle.
- Aggregate facts from:
  - `payments.amount` and `payments.status`
  - `bookings.status`, `bookings.created_at`
  - `flights.departure_time`, `flights.price`
- Build daily/weekly/monthly revenue views, for example:

  $$
  	ext{DailyRevenue}(d) = \sum_{p \in \text{payments on } d} p_\text{amount}
  $$

- Feed these aggregates into the forecasting pipeline (Prophet, XGBoost, etc.), enrich with seasonality features (holidays, route demand), and surface the predictions through the frontend dashboards.

## Results

## License

This project is licensed under the MIT License.
