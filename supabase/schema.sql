-- Mandarat Goal App Database Schema (9x9 Grid)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Mandarats table (user's mandarat boards)
CREATE TABLE mandarats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '나의 만다라트',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mandarat cells table (81 cells per mandarat, position 0-80)
CREATE TABLE mandarat_cells (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mandarat_id UUID NOT NULL REFERENCES mandarats(id) ON DELETE CASCADE,
  position INT NOT NULL CHECK (position >= 0 AND position <= 80),
  title TEXT NOT NULL DEFAULT '',
  UNIQUE(mandarat_id, position)
);

-- Indexes for performance
CREATE INDEX idx_mandarats_user_id ON mandarats(user_id);
CREATE INDEX idx_mandarat_cells_mandarat_id ON mandarat_cells(mandarat_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE mandarats ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandarat_cells ENABLE ROW LEVEL SECURITY;

-- Mandarats policies
CREATE POLICY "Users can view their own mandarats"
  ON mandarats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mandarats"
  ON mandarats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mandarats"
  ON mandarats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mandarats"
  ON mandarats FOR DELETE
  USING (auth.uid() = user_id);

-- Mandarat cells policies
CREATE POLICY "Users can view their own mandarat cells"
  ON mandarat_cells FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mandarats
      WHERE mandarats.id = mandarat_cells.mandarat_id
      AND mandarats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cells for their own mandarats"
  ON mandarat_cells FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mandarats
      WHERE mandarats.id = mandarat_cells.mandarat_id
      AND mandarats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cells for their own mandarats"
  ON mandarat_cells FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM mandarats
      WHERE mandarats.id = mandarat_cells.mandarat_id
      AND mandarats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cells for their own mandarats"
  ON mandarat_cells FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM mandarats
      WHERE mandarats.id = mandarat_cells.mandarat_id
      AND mandarats.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for mandarats updated_at
CREATE TRIGGER update_mandarats_updated_at
  BEFORE UPDATE ON mandarats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
