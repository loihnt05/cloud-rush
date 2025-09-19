# ✈️ Flight Ticket Revenue Forecasting

**Project Type:** Time Series Forecasting  
**Frontend:** React  
**Backend:** FastAPI  
**Team Members:** 2

---

## Badges

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100.0-green?logo=fastapi&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Dataset](#dataset)
- [Modeling Approach](#modeling-approach)
- [Installation](#installation)
- [Usage](#usage)
- [Results](#results)
- [Team Members](#team-members)
- [License](#license)

---

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

---

## Features

- Predict daily, weekly, or monthly flight revenue.
- Visualize historical revenue trends and forecast results.
- Interactive dashboard to explore trends and models.
- Compare multiple forecasting models (Prophet, XGBoost).

---

## Tech Stack

- **Frontend:** React, Tailwind CSS, Recharts
- **Backend:** FastAPI, Python, Pandas, Prophet/XGBoost
- **Database:** PostgreSQL
- **Deployment:** Docker

---

## Dataset

- Historical flight ticket revenue (date, route, revenue, etc.)
- Preprocessing includes handling missing values, aggregating revenue, and feature engineering for modeling.

---

## Modeling Approach

- **Time Series Models:** Prophet, ARIMA/SARIMA
- **Machine Learning Models:** XGBoost, Random Forest
- **Evaluation Metrics:** RMSE, MAE, MAPE

---

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

## Results

## Team Members

## License

This project is licensed under the MIT License.
