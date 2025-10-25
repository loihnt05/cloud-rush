-- ========== ROLES ==========
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- ========== USERS ==========
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    role_id INT REFERENCES roles(role_id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','banned')),
    last_login_at TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    preferences JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== AIRPLANES ==========
CREATE TABLE airplanes (
    airplane_id SERIAL PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100),
    seat_capacity INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== SEATS ==========
CREATE TABLE seats (
    seat_id SERIAL PRIMARY KEY,
    airplane_id INT REFERENCES airplanes(airplane_id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL,
    seat_class VARCHAR(20) CHECK (seat_class IN ('economy', 'business', 'first')),
    available BOOLEAN DEFAULT TRUE
);

-- ========== FLIGHTS ==========
CREATE TABLE flights (
    flight_id SERIAL PRIMARY KEY,
    flight_number VARCHAR(20) UNIQUE NOT NULL,
    airplane_id INT REFERENCES airplanes(airplane_id) ON DELETE SET NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    base_price DECIMAL(10,2) NOT NULL
);

-- ========== BOOKINGS ==========
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    flight_id INT NOT NULL REFERENCES flights(flight_id) ON DELETE CASCADE,
    seat_id INT REFERENCES seats(seat_id) ON DELETE SET NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled'))
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

-- ========== EXPLORES ==========
CREATE TABLE explores (
    explore_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE SET NULL,
    place_id INT REFERENCES places(place_id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== TRIPS ==========
CREATE TABLE trips (
    trip_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
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
CREATE TABLE revenue_forecasts (
    forecast_id SERIAL PRIMARY KEY,
    forecast_date DATE NOT NULL,
    predicted_revenue DECIMAL(12,2) NOT NULL,
    model_used VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
