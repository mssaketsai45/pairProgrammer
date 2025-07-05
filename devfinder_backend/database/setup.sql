-- DevFinder Database Schema for Supabase PostgreSQL
-- Run this script in your Supabase SQL editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    email_verified TIMESTAMPTZ,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    tags TEXT,
    github_repo TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_rooms_user_id ON rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at DESC);

-- Insert sample user for testing
INSERT INTO users (name, email, image) VALUES (
    'John Doe',
    'john@example.com',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample rooms for testing
INSERT INTO rooms (name, description, tags, github_repo, user_id) VALUES 
(
    'React Study Group',
    'Learning React together',
    'react,javascript,frontend',
    'https://github.com/example/react-study',
    1
),
(
    'Node.js Backend Project',
    'Building a REST API with Express',
    'nodejs,express,backend',
    NULL,
    1
),
(
    'TypeScript Workshop',
    'Advanced TypeScript patterns and best practices',
    'typescript,javascript,patterns',
    'https://github.com/example/typescript-workshop',
    1
);

-- Verify the setup
SELECT 'Users table created' as status, COUNT(*) as user_count FROM users;
SELECT 'Rooms table created' as status, COUNT(*) as room_count FROM rooms;
        'https://github.com/example/react-study',
        1
    ),
    (
        'Node.js Backend Project',
        'Building a REST API with Express',
        'nodejs,express,backend',
        NULL,
        1
    ),
    (
        'Full Stack Development',
        'Building complete web applications',
        'fullstack,react,nodejs,database',
        'https://github.com/example/fullstack-app',
        1
    )
ON CONFLICT DO NOTHING;

-- Show the created data
SELECT 'Users created:' as info;
SELECT * FROM users;

SELECT 'Rooms created:' as info;
SELECT r.*, u.name as user_name FROM rooms r 
JOIN users u ON r."userId" = u.id 
ORDER BY r."createdAt" DESC;
