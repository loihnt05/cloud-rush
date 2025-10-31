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
ALTER TABLE flights ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 0.15;
-- ========== FLIGHT SEATS (NEW) ==========
CREATE TABLE flight_seats (
    flight_seat_id SERIAL PRIMARY KEY,
    flight_id INT NOT NULL REFERENCES flights(flight_id) ON DELETE CASCADE,
    seat_id INT NOT NULL REFERENCES seats(seat_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'booked')),
    price_multiplier DECIMAL(5,2) DEFAULT 1.0,
    UNIQUE(flight_id, seat_id)
);

-- ========== BOOKINGS (DEBUG VERSION FOR DRAW.SQL) ==========
-- Thử phiên bản này nếu bản gốc bị lỗi "unsupported statement"
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    flight_seat_id INT,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
    CONSTRAINT fk_flight_seat FOREIGN KEY(flight_seat_id) REFERENCES flight_seats(flight_seat_id) ON DELETE SET NULL,
    CONSTRAINT uq_flight_seat UNIQUE(flight_seat_id)
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
-- A package is a combined service that includes hotel, car rental, and places
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
-- User can plan their trip by combining packages, services, and flights
CREATE TABLE trip_plans (
    plan_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
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
   model_used VARCHAR(100),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
