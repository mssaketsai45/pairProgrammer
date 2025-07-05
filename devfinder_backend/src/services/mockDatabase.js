// Mock database for testing - no real database needed
// This simulates database operations in memory

let mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let mockRooms = [
  {
    id: 1,
    name: "React Study Group",
    description: "Learning React together",
    tags: "react,javascript,frontend",
    githubRepo: "https://github.com/example/react-study",
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: "Node.js Backend Project",
    description: "Building a REST API with Express",
    tags: "nodejs,express,backend",
    githubRepo: null,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let nextUserId = 2;
let nextRoomId = 3;

class MockDatabaseService {
  // ==================== USER OPERATIONS ====================
  
  async createUser(userData) {
    try {
      const newUser = {
        id: nextUserId++,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockUsers.push(newUser);
      console.log('✅ Mock User created:', newUser.email);
      return newUser;
    } catch (error) {
      console.error('❌ Failed to create user:', error.message);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async findUserByEmail(email) {
    try {
      const user = mockUsers.find(u => u.email === email);
      return user || null;
    } catch (error) {
      console.error('❌ Failed to find user by email:', error.message);
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  async findUserById(id) {
    try {
      const user = mockUsers.find(u => u.id === id);
      return user || null;
    } catch (error) {
      console.error('❌ Failed to find user by ID:', error.message);
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

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

  // ==================== ROOM OPERATIONS ====================

  async getAllRooms(searchTerm = null) {
    try {
      let rooms = mockRooms.map(room => {
        const user = mockUsers.find(u => u.id === room.userId);
        return {
          ...room,
          userName: user?.name || 'Unknown User',
          userImage: user?.image || null
        };
      });

      // Apply search filter
      if (searchTerm && searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        rooms = rooms.filter(room => 
          room.name.toLowerCase().includes(search) ||
          room.description?.toLowerCase().includes(search) ||
          room.tags?.toLowerCase().includes(search)
        );
      }

      // Sort by newest first
      rooms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      console.log(`📋 Retrieved ${rooms.length} mock rooms${searchTerm ? ` (filtered by: "${searchTerm}")` : ''}`);
      return rooms;
    } catch (error) {
      console.error('❌ Failed to get rooms:', error.message);
      throw new Error(`Failed to get rooms: ${error.message}`);
    }
  }

  async getRoomById(id) {
    try {
      const room = mockRooms.find(r => r.id === id);
      if (!room) return null;

      const user = mockUsers.find(u => u.id === room.userId);
      const roomWithUser = {
        ...room,
        userName: user?.name || 'Unknown User',
        userImage: user?.image || null
      };

      console.log(`📄 Retrieved mock room: ${room.name}`);
      return roomWithUser;
    } catch (error) {
      console.error('❌ Failed to get room by ID:', error.message);
      throw new Error(`Failed to get room: ${error.message}`);
    }
  }

  async createRoom(roomData) {
    try {
      const newRoom = {
        id: nextRoomId++,
        ...roomData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockRooms.push(newRoom);
      console.log('✅ Mock Room created:', newRoom.name);
      return newRoom;
    } catch (error) {
      console.error('❌ Failed to create room:', error.message);
      throw new Error(`Failed to create room: ${error.message}`);
    }
  }

  async updateRoom(id, roomData) {
    try {
      const roomIndex = mockRooms.findIndex(r => r.id === id);
      if (roomIndex === -1) return null;

      mockRooms[roomIndex] = {
        ...mockRooms[roomIndex],
        ...roomData,
        updatedAt: new Date()
      };
      
      console.log('✅ Mock Room updated:', mockRooms[roomIndex].name);
      return mockRooms[roomIndex];
    } catch (error) {
      console.error('❌ Failed to update room:', error.message);
      throw new Error(`Failed to update room: ${error.message}`);
    }
  }

  async deleteRoom(id) {
    try {
      const roomIndex = mockRooms.findIndex(r => r.id === id);
      if (roomIndex === -1) return false;

      mockRooms.splice(roomIndex, 1);
      console.log('✅ Mock Room deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to delete room:', error.message);
      throw new Error(`Failed to delete room: ${error.message}`);
    }
  }

  async getUserRooms(userId) {
    try {
      const userRooms = mockRooms.filter(r => r.userId === userId);
      userRooms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      console.log(`📋 Retrieved ${userRooms.length} mock rooms for user ${userId}`);
      return userRooms;
    } catch (error) {
      console.error('❌ Failed to get user rooms:', error.message);
      throw new Error(`Failed to get user rooms: ${error.message}`);
    }
  }

  async userOwnsRoom(roomId, userId) {
    try {
      const room = mockRooms.find(r => r.id === roomId);
      return room && room.userId === userId;
    } catch (error) {
      console.error('❌ Failed to check room ownership:', error.message);
      throw new Error(`Failed to check room ownership: ${error.message}`);
    }
  }

  // ==================== UTILITY OPERATIONS ====================

  async getStats() {
    try {
      return {
        totalUsers: mockUsers.length,
        totalRooms: mockRooms.length,
        timestamp: new Date().toISOString(),
        note: "Using mock database - no real database connected"
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
}

// Export a singleton instance
module.exports = new MockDatabaseService();
