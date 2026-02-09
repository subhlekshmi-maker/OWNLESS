-- Only if 'items' table exists, add image_url if not present
alter table items add column if not exists image_url text;

-- If you are recreating everything, update setup scripts (which I already did in ultra_safe_setup.sql)
-- This file is for SAFE updates to existing deployments.
