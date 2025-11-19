-- ========== CANCELLATION POLICIES ==========
-- Define refund policies based on hours before departure
CREATE TABLE IF NOT EXISTS cancellation_policies (
    policy_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    hours_before_departure INT NOT NULL,  -- Minimum hours before departure
    refund_percentage DECIMAL(5, 2) NOT NULL CHECK (refund_percentage >= 0 AND refund_percentage <= 100),
    cancellation_fee DECIMAL(10, 2) DEFAULT 0.00,
    is_active VARCHAR(10) DEFAULT 'true' CHECK (is_active IN ('true', 'false')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== REFUNDS ==========
-- Track refund requests and their status
CREATE TABLE IF NOT EXISTS refunds (
    refund_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    payment_id INT REFERENCES payments(payment_id) ON DELETE CASCADE,
    refund_amount DECIMAL(10, 2) NOT NULL,
    refund_percentage DECIMAL(5, 2) NOT NULL CHECK (refund_percentage >= 0 AND refund_percentage <= 100),
    cancellation_fee DECIMAL(10, 2) DEFAULT 0.00,
    refund_reason VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    requested_by VARCHAR(255) NOT NULL,  -- user_id who requested
    processed_by VARCHAR(255),  -- admin/agent who processed
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    notes TEXT
);

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_refunds_booking_id ON refunds(booking_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_requested_by ON refunds(requested_by);
CREATE INDEX IF NOT EXISTS idx_cancellation_policies_active ON cancellation_policies(is_active);

-- ========== SAMPLE CANCELLATION POLICIES ==========
-- Insert default cancellation policies
INSERT INTO cancellation_policies (name, description, hours_before_departure, refund_percentage, cancellation_fee) VALUES
    ('Full Refund', 'Cancellation more than 48 hours before departure - Full refund minus processing fee', 48, 100.00, 25.00),
    ('Partial Refund', 'Cancellation between 24-48 hours before departure - 50% refund', 24, 50.00, 50.00),
    ('Minimal Refund', 'Cancellation less than 24 hours before departure - 25% refund', 0, 25.00, 75.00)
ON CONFLICT DO NOTHING;
