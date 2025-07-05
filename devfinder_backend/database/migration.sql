-- Migration script to align Supabase with NextAuth schema
-- Run this in your Supabase SQL editor

-- First, let's see what we have
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('user', 'users', 'room', 'rooms') 
ORDER BY table_name, ordinal_position;

-- Drop existing tables if they exist (BE CAREFUL - this will delete data!)
-- Uncomment the following lines if you want to start fresh:
-- DROP TABLE IF EXISTS rooms CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS room CASCADE;
-- DROP TABLE IF EXISTS "user" CASCADE;

-- Create user table (matches NextAuth schema)
CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL,
    "emailVerified" TIMESTAMP,
    image TEXT
);

-- Create room table (matches frontend schema)
CREATE TABLE IF NOT EXISTS "room" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    tags TEXT,
    "githubRepo" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_room_userid ON "room"("userId");
CREATE INDEX IF NOT EXISTS idx_room_tags ON "room"(tags);

-- Insert test data (you can modify this)
INSERT INTO "user" (id, name, email, image) VALUES 
    ('test-user-1', 'Test User', 'test@example.com', 'https://example.com/avatar.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "room" (name, description, tags, "githubRepo", "userId") VALUES 
    ('React Study Group', 'Learning React together', 'react,javascript,frontend', 'https://github.com/test/react-study', 'test-user-1'),
    ('Node.js Backend Project', 'Building APIs with Express', 'nodejs,express,backend,api', 'https://github.com/test/node-api', 'test-user-1'),
    ('TypeScript Workshop', 'Advanced TypeScript concepts', 'typescript,programming,education', 'https://github.com/test/ts-workshop', 'test-user-1')
ON CONFLICT (id) DO NOTHING;

-- Verify the schema
SELECT 'user table' as table_info, count(*) as row_count FROM "user"
UNION ALL
SELECT 'room table' as table_info, count(*) as row_count FROM "room";
