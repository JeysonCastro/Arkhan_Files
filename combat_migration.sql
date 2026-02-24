-- Adds a column to the investigators table to track if they have a firearm drawn, which grants +50 DEX for initiative
ALTER TABLE public.investigators ADD COLUMN IF NOT EXISTS is_firearm_ready BOOLEAN DEFAULT false;
