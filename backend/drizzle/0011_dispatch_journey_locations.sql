ALTER TABLE dispatches
  ADD COLUMN IF NOT EXISTS pickup_location TEXT,
  ADD COLUMN IF NOT EXISTS dropoff_location TEXT;

UPDATE dispatches
SET
  dropoff_location = COALESCE(dropoff_location, delivery_location),
  pickup_location = COALESCE(pickup_location, 'Yard')
WHERE dropoff_location IS NULL OR pickup_location IS NULL;

ALTER TABLE dispatches
  ALTER COLUMN travel_time_minutes DROP NOT NULL;

UPDATE dispatches SET travel_time_minutes = NULL WHERE travel_time_minutes IS NOT NULL;
