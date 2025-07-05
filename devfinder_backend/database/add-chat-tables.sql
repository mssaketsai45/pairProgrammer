-- Add chat functionality to DevFinder
-- Step 1: Create chat tables

-- Messages table for room chat
CREATE TABLE IF NOT EXISTS message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES room(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'video_invite')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User presence/status table
CREATE TABLE IF NOT EXISTS user_presence (
    user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    room_id UUID REFERENCES room(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_ready_for_video BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video call sessions table
CREATE TABLE IF NOT EXISTS video_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES room(id) ON DELETE CASCADE,
    started_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video call participants table
CREATE TABLE IF NOT EXISTS video_participant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_session_id UUID NOT NULL REFERENCES video_session(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(video_session_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_message_room_id ON message(room_id);
CREATE INDEX IF NOT EXISTS idx_message_created_at ON message(created_at);
CREATE INDEX IF NOT EXISTS idx_user_presence_room_id ON user_presence(room_id);
CREATE INDEX IF NOT EXISTS idx_video_session_room_id ON video_session(room_id);

-- Add some helpful functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_message_updated_at BEFORE UPDATE ON message
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_presence_updated_at BEFORE UPDATE ON user_presence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
