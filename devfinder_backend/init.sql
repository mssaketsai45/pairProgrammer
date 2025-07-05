-- Database initialization script for DevFinder
-- This will create the necessary tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    "emailVerified" TIMESTAMP,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    tags TEXT,
    github_repo TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_rooms_user_id ON rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at);

-- Insert sample data for testing
INSERT INTO users (name, email, image) VALUES 
('John Doe', 'john@example.com', 'https://avatar.githubusercontent.com/u/1?v=4'),
('Jane Smith', 'jane@example.com', 'https://avatar.githubusercontent.com/u/2?v=4')
ON CONFLICT (email) DO NOTHING;

INSERT INTO rooms (name, description, tags, github_repo, user_id) VALUES 
('JavaScript Study Group', 'Learning modern JavaScript together', 'javascript,react,nodejs', 'https://github.com/example/js-study', 1),
('Python Coding Session', 'Building a web scraper with Python', 'python,scrapy,data', 'https://github.com/example/python-scraper', 2),
('React Component Library', 'Creating reusable React components', 'react,typescript,storybook', 'https://github.com/example/react-lib', 1)
ON CONFLICT DO NOTHING;

-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'DevFinder database initialized successfully!';
END
$$;
