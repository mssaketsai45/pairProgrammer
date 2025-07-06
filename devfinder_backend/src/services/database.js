const { db } = require('../config/database');
const { users, rooms, messages } = require('../config/schema');
const { eq, like, or, desc } = require('drizzle-orm');

class DatabaseService {
  // ==================== USER OPERATIONS ====================
  
  /**
   * Create a new user
   * @param {Object} userData - User data (name, email, image)
   * @returns {Object} Created user
   */
  
  async createUser(userData) {
    try {
      const [user] = await db.insert(users).values({
        ...userData
      }).returning();
      
      console.log('✅ User created:', user.email);
      return user;
    } catch (error) {
      console.error('❌ Failed to create user:', error.message);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Object|null} User or null if not found
   */
  async findUserByEmail(email) {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || null;
    } catch (error) {
      console.error('❌ Failed to find user by email:', error.message);
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Object|null} User or null if not found
   */
  async findUserById(id) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || null;
    } catch (error) {
      console.error('❌ Failed to find user by ID:', error.message);
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  /**
   * Find or create user (useful for OAuth)
   * @param {Object} userData - User data
   * @returns {Object} User object
   */
  async findOrCreateUser(userData) {
    try {
      let user = await this.findUserByEmail(userData.email);
      
      if (!user) {
        user = await this.createUser(userData);
      }
      
      return user;
    } catch (error) {
      console.error('❌ Failed to find or create user:', error.message);
      throw new Error(`Failed to find or create user: ${error.message}`);
    }
  }

  /**
   * Delete a user by ID
   * @param {string} id - User ID
   * @returns {boolean} Success status
   */
  async deleteUser(id) {
    try {
      // First delete all rooms owned by this user
      await db.delete(rooms).where(eq(rooms.userId, id));
      
      // Then delete the user
      const result = await db.delete(users).where(eq(users.id, id));
      
      console.log('✅ User and associated rooms deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete user:', error.message);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Ensure a test user exists for development
   * @returns {string} Test user ID
   */
  async ensureTestUser() {
    try {
      // Check if test user already exists
      const testEmail = 'test@devfinder.dev';
      const testUserId = 'test-user-1';
      
      try {
        let testUser = await this.findUserByEmail(testEmail);
        
        if (!testUser) {
          // Create test user
          testUser = await this.createUser({
            id: testUserId,
            name: 'Test User',
            email: testEmail,
            image: null
          });
          console.log('✅ Test user created for development');
        }
        
        return testUser.id;
      } catch (dbError) {
        // If database is not available, return a default test user ID
        console.log('⚠️ Database not available, using fallback test user ID');
        return testUserId;
      }
    } catch (error) {
      console.error('❌ Failed to ensure test user:', error.message);
      // Return fallback ID instead of throwing
      return 'test-user-1';
    }
  }

  // ==================== ROOM OPERATIONS ====================

  /**
   * Get all rooms with optional search
   * @param {string} searchTerm - Optional search term
   * @returns {Array} Array of rooms with user info
   */
  async getAllRooms(searchTerm = null) {
    try {
      console.log('🔍 Starting getAllRooms query...');
      console.log('📊 Search term:', searchTerm);
      
      // Simplified query without JOIN for now
      let query = db.select().from(rooms);

      // Add search functionality
      if (searchTerm && searchTerm.trim()) {
        const searchPattern = `%${searchTerm.trim()}%`;
        query = query.where(
          or(
            like(rooms.name, searchPattern),
            like(rooms.description, searchPattern),
            like(rooms.tags, searchPattern)
          )
        );
      }

      console.log('🚀 Executing query...');
      const allRooms = await query;
      console.log(`📋 Retrieved ${allRooms.length} rooms${searchTerm ? ` (filtered by: "${searchTerm}")` : ''}`);
      return allRooms;
    } catch (error) {
      console.error('❌ Failed to get rooms - Full error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      throw new Error(`Failed to get rooms: ${error.message}`);
    }
  }

  /**
   * Get room by ID with user info
   * @param {number} id - Room ID
   * @returns {Object|null} Room with user info or null if not found
   */
  async getRoomById(id) {
    try {
      const [room] = await db.select({
        id: rooms.id,
        name: rooms.name,
        description: rooms.description,
        tags: rooms.tags,
        githubRepo: rooms.githubRepo,
        userId: rooms.userId,
        userName: users.name,
        userImage: users.image
      }).from(rooms)
        .leftJoin(users, eq(rooms.userId, users.id))
        .where(eq(rooms.id, id));

      if (room) {
        console.log(`📄 Retrieved room: ${room.name}`);
      }
      
      return room || null;
    } catch (error) {
      console.error('❌ Failed to get room by ID:', error.message);
      throw new Error(`Failed to get room: ${error.message}`);
    }
  }

  /**
   * Create a new room
   * @param {Object} roomData - Room data
   * @returns {Object} Created room
   */
  async createRoom(roomData) {
    try {
      const [room] = await db.insert(rooms).values({
        ...roomData
      }).returning();
      
      console.log('✅ Room created:', room.name);
      return room;
    } catch (error) {
      console.error('❌ Failed to create room:', error.message);
      throw new Error(`Failed to create room: ${error.message}`);
    }
  }

  /**
   * Update room by ID
   * @param {number} id - Room ID
   * @param {Object} roomData - Updated room data
   * @returns {Object} Updated room
   */
  async updateRoom(id, roomData) {
    try {
      const [room] = await db.update(rooms)
        .set({ 
          ...roomData, 
          updatedAt: new Date() 
        })
        .where(eq(rooms.id, id))
        .returning();
      
      if (room) {
        console.log('✅ Room updated:', room.name);
      }
      
      return room;
    } catch (error) {
      console.error('❌ Failed to update room:', error.message);
      throw new Error(`Failed to update room: ${error.message}`);
    }
  }

  /**
   * Delete room by ID
   * @param {number} id - Room ID
   * @returns {boolean} Success status
   */
  async deleteRoom(id) {
    try {
      await db.delete(rooms).where(eq(rooms.id, id));
      console.log('✅ Room deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to delete room:', error.message);
      throw new Error(`Failed to delete room: ${error.message}`);
    }
  }

  /**
   * Get rooms created by a specific user
   * @param {number} userId - User ID
   * @returns {Array} Array of user's rooms
   */
  async getUserRooms(userId) {
    try {
      const userRooms = await db.select()
        .from(rooms)
        .where(eq(rooms.userId, userId));
      
      console.log(`📋 Retrieved ${userRooms.length} rooms for user ${userId}`);
      return userRooms;
    } catch (error) {
      console.error('❌ Failed to get user rooms:', error.message);
      throw new Error(`Failed to get user rooms: ${error.message}`);
    }
  }

  /**
   * Check if user owns a room
   * @param {number} roomId - Room ID
   * @param {number} userId - User ID
   * @returns {boolean} Whether user owns the room
   */
  async userOwnsRoom(roomId, userId) {
    try {
      const [room] = await db.select({ userId: rooms.userId })
        .from(rooms)
        .where(eq(rooms.id, roomId));
      
      return room && room.userId === userId;
    } catch (error) {
      console.error('❌ Failed to check room ownership:', error.message);
      throw new Error(`Failed to check room ownership: ${error.message}`);
    }
  }

  // ==================== UTILITY OPERATIONS ====================

  /**
   * Get database statistics
   * @returns {Object} Database stats
   */
  async getStats() {
    try {
      const [userCount] = await db.select().from(users);
      const [roomCount] = await db.select().from(rooms);
      
      return {
        totalUsers: userCount?.length || 0,
        totalRooms: roomCount?.length || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to get database stats:', error.message);
      return {
        totalUsers: 0,
        totalRooms: 0,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ==================== CHAT OPERATIONS ====================

  /**
   * Get messages for a room
   * @param {string} roomId - Room ID
   * @param {number} limit - Number of messages to fetch
   * @param {number} offset - Offset for pagination
   * @returns {Array} Messages with user info
   */
  async getChatMessages(roomId, limit = 50, offset = 0) {
    try {
      console.log(`💬 Fetching ${limit} messages for room ${roomId}`);
      
      const result = await db
        .select({
          id: messages.id,
          content: messages.content,
          created_at: messages.createdAt,
          user_id: users.id,
          user_name: users.name,
          user_image: users.image,
        })
        .from(messages)
        .innerJoin(users, eq(messages.userId, users.id))
        .where(eq(messages.roomId, roomId))
        .orderBy(desc(messages.createdAt))
        .limit(limit)
        .offset(offset);

      console.log(`✅ Retrieved ${result.length} messages`);
      return result.reverse(); // Return oldest first
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error.message);
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
  }

  /**
   * Create a new chat message
   * @param {string} roomId - Room ID
   * @param {string} userId - User ID
   * @param {string} content - Message content
   * @returns {Object} Created message with user info
   */
  async createChatMessage(roomId, userId, content) {
    try {
      console.log(`💬 Creating message in room ${roomId} by user ${userId}`);
      
      // Insert the message
      const [message] = await db
        .insert(messages)
        .values({
          roomId: roomId,
          userId: userId,
          content: content,
        })
        .returning();

      // Get user info for the response
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      const fullMessage = {
        id: message.id,
        content: message.content,
        created_at: message.createdAt,
        user_id: user.id,
        user_name: user.name,
        user_image: user.image,
      };

      console.log('✅ Message created successfully');
      return fullMessage;
    } catch (error) {
      console.error('❌ Failed to create message:', error.message);
      throw new Error(`Failed to create message: ${error.message}`);
    }
  }
}

// Export a singleton instance
module.exports = new DatabaseService();
