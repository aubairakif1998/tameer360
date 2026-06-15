ALTER TABLE dispatches
  ADD COLUMN IF NOT EXISTS scheduled_start_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expected_delivery_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS travel_time_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS journey_km NUMERIC(10, 2);

UPDATE dispatches
SET
  scheduled_start_at = COALESCE(
    scheduled_start_at,
    (dispatch_date::timestamp + TIME '08:00') AT TIME ZONE 'Asia/Karachi'
  ),
  expected_delivery_at = COALESCE(
    expected_delivery_at,
    (dispatch_date::timestamp + TIME '17:00') AT TIME ZONE 'Asia/Karachi'
  ),
  travel_time_minutes = COALESCE(travel_time_minutes, 540)
WHERE scheduled_start_at IS NULL
   OR expected_delivery_at IS NULL
   OR travel_time_minutes IS NULL;

ALTER TABLE dispatches
  ALTER COLUMN scheduled_start_at SET NOT NULL,
  ALTER COLUMN expected_delivery_at SET NOT NULL,
  ALTER COLUMN travel_time_minutes SET NOT NULL;
