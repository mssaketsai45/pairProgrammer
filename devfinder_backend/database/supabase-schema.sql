-- DevFinder Database Schema for Supabase PostgreSQL (NextAuth Compatible)
-- Run this script in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user table (singular, matches NextAuth)
CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL,
    "emailVerified" TIMESTAMPTZ,
    image TEXT
);

-- Create account table (for NextAuth)
CREATE TABLE IF NOT EXISTS account (
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    PRIMARY KEY (provider, "providerAccountId")
);

-- Create session table (for NextAuth)
CREATE TABLE IF NOT EXISTS session (
    "sessionToken" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL
);

-- Create verificationToken table (for NextAuth)
CREATE TABLE IF NOT EXISTS "verificationToken" (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- Create room table (singular, matches schema)
CREATE TABLE IF NOT EXISTS room (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    tags TEXT,
    "githubRepo" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create message table (for chat)
CREATE TABLE IF NOT EXISTS message (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES room(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_room_userId ON room("userId");
CREATE INDEX IF NOT EXISTS idx_message_room_id ON message(room_id);
CREATE INDEX IF NOT EXISTS idx_message_created_at ON message(created_at DESC);

-- Note: Don't insert sample data - let NextAuth handle user creation
