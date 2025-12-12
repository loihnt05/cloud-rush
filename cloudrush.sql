-- ========== USERS ==========
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY
);

-- ========== AIRPORTS ==========
CREATE TABLE airports (
    airport_id SERIAL PRIMARY KEY,
    iata_code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100)
);

-- ========== AIRPLANES ==========
CREATE TABLE airplanes (
    airplane_id SERIAL PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100),
    seat_capacity INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== SEATS (FIXED) ==========
CREATE TABLE seats (
    seat_id SERIAL PRIMARY KEY,
    airplane_id INT REFERENCES airplanes(airplane_id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL,
    seat_class VARCHAR(20) CHECK (seat_class IN ('economy', 'business', 'first'))
);

-- ========== FLIGHTS (FIXED) ==========
CREATE TABLE flights (
    flight_id SERIAL PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL,
    airplane_id INT REFERENCES airplanes(airplane_id) ON DELETE SET NULL,
    origin_airport_id INT NOT NULL REFERENCES airports(airport_id),
    destination_airport_id INT NOT NULL REFERENCES airports(airport_id),
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled','delayed','cancelled','completed')),
    base_price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0.15
);

-- ========== FLIGHT SEATS ==========
CREATE TABLE flight_seats (
    flight_seat_id SERIAL PRIMARY KEY,
    flight_id INT NOT NULL REFERENCES flights(flight_id) ON DELETE CASCADE,
    seat_id INT NOT NULL REFERENCES seats(seat_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'booked')),
    price_multiplier DECIMAL(5,2) DEFAULT 1.0,
    UNIQUE(flight_id, seat_id)
);

-- ========== BOOKINGS (UPDATED - Now group-level) ==========
-- One booking can have multiple passengers
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    booking_reference VARCHAR(20) UNIQUE NOT NULL, -- e.g., ABC123XYZ
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
    total_amount DECIMAL(10,2),
    notes TEXT
);

-- ========== PASSENGERS (NEW) ==========
-- Store passenger details for each booking
CREATE TABLE passengers (
    passenger_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    passenger_type VARCHAR(20) NOT NULL CHECK (passenger_type IN ('adult', 'child', 'infant')),
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    suffix VARCHAR(20),
    date_of_birth DATE NOT NULL,
    
    -- Contact Information (usually for lead passenger)
    email VARCHAR(255),
    phone_number VARCHAR(20),
    
    -- Travel Documents
    redress_number VARCHAR(50),
    known_traveller_number VARCHAR(50), -- TSA PreCheck, Global Entry, etc.
    
    -- Seat Assignment
    flight_seat_id INT REFERENCES flight_seats(flight_seat_id) ON DELETE SET NULL,
    
    -- Special Requirements
    special_requests TEXT, -- wheelchair, meal preferences, etc.
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure each passenger gets unique seat per booking
    UNIQUE(booking_id, flight_seat_id)
);

-- ========== EMERGENCY CONTACTS (NEW) ==========
-- Store emergency contact for each passenger
CREATE TABLE emergency_contacts (
    contact_id SERIAL PRIMARY KEY,
    passenger_id INT NOT NULL REFERENCES passengers(passenger_id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(20) NOT NULL,
    relationship VARCHAR(50), -- spouse, parent, sibling, friend, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== PAYMENTS ==========
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success','failed','pending'))
);

-- ========== PLACES ==========
CREATE TABLE places (
    place_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    description TEXT
);

-- ========== SERVICES ==========
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('hotel','rental_car','package')),
    price DECIMAL(10,2) NOT NULL
);

-- ========== HOTEL DETAILS ==========
CREATE TABLE hotels (
    hotel_id SERIAL PRIMARY KEY,
    service_id INT UNIQUE REFERENCES services(service_id) ON DELETE CASCADE,
    location VARCHAR(200),
    stars INT CHECK (stars BETWEEN 1 AND 5),
    description TEXT
);

-- ========== CAR RENTAL DETAILS ==========
CREATE TABLE car_rentals (
    car_rental_id SERIAL PRIMARY KEY,
    service_id INT UNIQUE REFERENCES services(service_id) ON DELETE CASCADE,
    car_model VARCHAR(100),
    brand VARCHAR(100),
    daily_rate DECIMAL(10,2),
    available BOOLEAN DEFAULT TRUE
);

-- ========== BOOKING SERVICES ==========
CREATE TABLE booking_services (
    booking_service_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    quantity INT DEFAULT 1
);

-- ========== PACKAGES ==========
CREATE TABLE booking_packages (
    package_id SERIAL PRIMARY KEY,
    service_id INT UNIQUE REFERENCES services(service_id) ON DELETE CASCADE,
    hotel_id INT REFERENCES hotels(hotel_id) ON DELETE SET NULL,
    car_rental_id INT REFERENCES car_rentals(car_rental_id) ON DELETE SET NULL,
    name VARCHAR(100),
    total_price DECIMAL(10,2)
);

CREATE TABLE package_places (
    package_place_id SERIAL PRIMARY KEY,
    package_id INT NOT NULL REFERENCES booking_packages(package_id) ON DELETE CASCADE,
    place_id INT NOT NULL REFERENCES places(place_id) ON DELETE CASCADE,
    day_number INT
);

-- ========== TRIP PLANS ==========
CREATE TABLE trip_plans (
    plan_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE,
    notes TEXT
);

CREATE TABLE trip_plan_items (
    plan_item_id SERIAL PRIMARY KEY,
    plan_id INT NOT NULL REFERENCES trip_plans(plan_id) ON DELETE CASCADE,
    flight_id INT REFERENCES flights(flight_id) ON DELETE SET NULL,
    service_id INT REFERENCES services(service_id) ON DELETE SET NULL,
    place_id INT REFERENCES places(place_id) ON DELETE SET NULL,
    scheduled_time TIMESTAMP
);

-- ========== EXPLORES ==========
CREATE TABLE explores (
    explore_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    place_id INT REFERENCES places(place_id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== REVENUE FORECASTS ==========
CREATE TABLE revenue_forecasts (
   forecast_id SERIAL PRIMARY KEY,
   forecast_date DATE NOT NULL,
   predicted_revenue DECIMAL(12,2) NOT NULL,
   actual_revenue DECIMAL(12, 2),
   confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 100),
   model_used VARCHAR(100),
   model_version VARCHAR(50),
   prediction_type VARCHAR(50) DEFAULT 'daily' CHECK (prediction_type IN ('daily', 'weekly', 'monthly', 'yearly')),
   features_used TEXT,
   notes TEXT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revenue Metrics table for tracking actual metrics
CREATE TABLE revenue_metrics (
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

-- ========== INDEXES FOR PERFORMANCE ==========
CREATE INDEX idx_passengers_booking ON passengers(booking_id);
CREATE INDEX idx_passengers_type ON passengers(passenger_type);
CREATE INDEX idx_emergency_contacts_passenger ON emergency_contacts(passenger_id);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);

-- Revenue forecasting indexes
CREATE INDEX idx_revenue_forecasts_date ON revenue_forecasts(forecast_date);
CREATE INDEX idx_revenue_forecasts_type ON revenue_forecasts(prediction_type);
CREATE INDEX idx_revenue_forecasts_model ON revenue_forecasts(model_used);
CREATE INDEX idx_revenue_forecasts_confidence ON revenue_forecasts(confidence_score);

-- Revenue metrics indexes
CREATE INDEX idx_revenue_metrics_date ON revenue_metrics(date);
CREATE INDEX idx_revenue_metrics_revenue ON revenue_metrics(actual_revenue);