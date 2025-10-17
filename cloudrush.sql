-- ==============================
-- 1. Roles: Phân quyền người dùng
-- ==============================
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- ==============================
-- 2. Users: Tài khoản người dùng
-- ==============================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,                     
    provider_id VARCHAR(255) NOT NULL,                 
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    role_id INT REFERENCES roles(role_id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','banned')),
    last_login_at TIMESTAMPTZ,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    preferences JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- 3. Airports: Sân bay
-- ==============================
CREATE TABLE airports (
    airport_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100)
);

-- ==============================
-- 4. Airplanes: Thông tin máy bay
-- ==============================
CREATE TABLE airplanes (
    airplane_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100),
    total_seats INT NOT NULL
);

-- ==============================
-- 5. Seats: Ghế ngồi trong máy bay
-- ==============================
CREATE TABLE seats (
    seat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    airplane_id UUID REFERENCES airplanes(airplane_id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL,
    seat_class VARCHAR(20) CHECK (seat_class IN ('economy', 'business', 'first')),
    price_modifier DECIMAL(5,2) DEFAULT 1.0
);

-- ==============================
-- 6. Flights: Chuyến bay
-- ==============================
CREATE TABLE flights (
    flight_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_number VARCHAR(20) NOT NULL,
    airplane_id UUID REFERENCES airplanes(airplane_id) ON DELETE SET NULL,
    origin_airport_id UUID REFERENCES airports(airport_id) ON DELETE SET NULL,
    destination_airport_id UUID REFERENCES airports(airport_id) ON DELETE SET NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled','delayed','cancelled','completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- 7. Bookings: Đơn đặt vé
-- ==============================
CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    flight_id UUID NOT NULL REFERENCES flights(flight_id) ON DELETE CASCADE,
    booking_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
    total_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- 8. Tickets: Vé trong mỗi booking
-- ==============================
CREATE TABLE tickets (
    ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(booking_id) ON DELETE CASCADE,
    seat_id UUID REFERENCES seats(seat_id) ON DELETE SET NULL,
    price DECIMAL(10,2) NOT NULL,
    passenger_name VARCHAR(100),
    passenger_type VARCHAR(20) CHECK (passenger_type IN ('adult','child','infant')) DEFAULT 'adult'
);

-- ==============================
-- 9. Payments: Thanh toán
-- ==============================
CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success','failed','pending'))
);

-- ==============================
-- 10. Revenue Forecasts: Dự đoán doanh thu
-- ==============================
CREATE TABLE revenue_forecasts (
    forecast_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_date DATE NOT NULL,
    predicted_revenue DECIMAL(12,2) NOT NULL,
    model_used VARCHAR(100),
    source_type VARCHAR(50), -- 'flight', 'daily', 'monthly'
    source_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 11. Services (optional, mở rộng)
-- ==============================
CREATE TABLE services (
    service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('rental_car', 'hotel', 'package')),
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE booking_services (
    booking_service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    quantity INT DEFAULT 1
);
