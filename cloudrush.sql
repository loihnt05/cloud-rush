-- ========== USERS (MOCK FOR VISUALIZATION) ==========
-- This table is for draw.sql visualization only.
-- It is managed by an external service (e.g., Auth0) in production.
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY,
    -- email VARCHAR(255) UNIQUE NOT NULL,
    -- full_name VARCHAR(100)
);

-- ========== AIRPORTS (NEW) ==========
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
    base_price DECIMAL(10,2) NOT NULL
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
    flight_seat_id INT, -- Tách ràng buộc ra khỏi dòng này
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),

    -- Định nghĩa các ràng buộc (constraints) ở cuối
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

-- ========== SERVICES ==========
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('rental_car','hotel','package')),
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE booking_services (
    booking_service_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    quantity INT DEFAULT 1
);

-- ========== PLACES ==========
CREATE TABLE places (
    place_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    description TEXT
);

-- ========== EXPLORES (UPDATED FOR VISUAL) ==========
CREATE TABLE explores (
    explore_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- <--- UPDATED
    place_id INT REFERENCES places(place_id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== TRIPS (UPDATED FOR VISUAL) ==========
CREATE TABLE trips (
    trip_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- <--- UPDATED
    name VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE
);

CREATE TABLE trip_activities (
    activity_id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    flight_id INT REFERENCES flights(flight_id) ON DELETE SET NULL,
    service_id INT REFERENCES services(service_id) ON DELETE SET NULL,
    place_id INT REFERENCES places(place_id) ON DELETE SET NULL,
    scheduled_time TIMESTAMP
);
-- ========== REVENUE FORECASTS ==========
-- CREATE TABLE revenue_forecasts (
--    forecast_id SERIAL PRIMARY KEY,
--    forecast_date DATE NOT NULL,
--    predicted_revenue DECIMAL(12,2) NOT NULL,
--    model_used VARCHAR(100),
--    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
