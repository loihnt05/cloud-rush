-- Add indexes to improve car_rentals query performance

-- Index for filtering by availability (most common filter)
CREATE INDEX IF NOT EXISTS idx_car_rentals_available 
ON car_rentals(available);

-- Index for filtering by brand (used in brand search endpoint)
CREATE INDEX IF NOT EXISTS idx_car_rentals_brand 
ON car_rentals(brand);

-- Index for service_id foreign key (improves join performance)
CREATE INDEX IF NOT EXISTS idx_car_rentals_service_id 
ON car_rentals(service_id);

-- Composite index for common query patterns (available + brand)
CREATE INDEX IF NOT EXISTS idx_car_rentals_available_brand 
ON car_rentals(available, brand);

-- Index on daily_rate for potential price-based filtering
CREATE INDEX IF NOT EXISTS idx_car_rentals_daily_rate 
ON car_rentals(daily_rate);

-- Show indexes for verification
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'car_rentals'
ORDER BY indexname;
