-- Users: thông tin người dùng
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);


-- Flights: chuyến bay
CREATE TABLE flights (
    flight_id SERIAL PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Bookings: đơn đặt vé
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    flight_id INT NOT NULL REFERENCES flights(flight_id) ON DELETE CASCADE,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending'
);

-- Payments: thanh toán cho booking
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'success'
);

-- Services: dịch vụ đi kèm (xe, khách sạn, gói đặc biệt...)
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,  -- rental_car, hotel, package
    price DECIMAL(10,2) NOT NULL
);

-- Booking-Services: ánh xạ N-N giữa bookings và services
CREATE TABLE booking_services (
    booking_service_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    quantity INT DEFAULT 1
);

-- Places: địa điểm (gắn với explore, trip)
CREATE TABLE places (
    place_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    description TEXT
);

-- Explores: blog, tips, bài viết khám phá
CREATE TABLE explores (
    explore_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    place_id INT REFERENCES places(place_id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trips: kế hoạch chuyến đi
CREATE TABLE trips (
    trip_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE
);

-- Trip-Activities: hoạt động trong chuyến đi (bay, dịch vụ, tham quan)
CREATE TABLE trip_activities (
    activity_id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    flight_id INT REFERENCES flights(flight_id) ON DELETE SET NULL,
    service_id INT REFERENCES services(service_id) ON DELETE SET NULL,
    place_id INT REFERENCES places(place_id) ON DELETE SET NULL,
    scheduled_time TIMESTAMP
);

-- Revenue Forecasts: lưu kết quả dự đoán doanh thu
CREATE TABLE revenue_forecasts (
    forecast_id SERIAL PRIMARY KEY,
    forecast_date DATE NOT NULL,
    predicted_revenue DECIMAL(12,2) NOT NULL,
    model_used VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
