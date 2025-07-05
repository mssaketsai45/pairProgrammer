const express = require('express');
// Using real database service now
const databaseService = require('../services/database');
const { validateCreateRoom, validateEditRoom, validateIdParam, validateRoomQuery } = require('../services/validation');

const router = express.Router();

// ==================== GET ALL ROOMS ====================
/**
 * GET /api/rooms
 * Get all rooms with optional search functionality
 * Query params: ?search=javascript&page=1&limit=20
 */
router.get('/', async (req, res) => {
  try {
    // Validate and parse query parameters
    const { search } = validateRoomQuery(req.query);
    
    console.log(`📋 Fetching rooms${search ? ` with search: "${search}"` : ''}`);
    
    // Get rooms from database
    const rooms = await databaseService.getAllRooms(search);
    
    // Transform the data to match frontend expectations
    const transformedRooms = rooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      tags: room.tags,
      githubRepo: room.githubRepo,
      userId: room.userId,
      createdAt: room.createdAt,
      user: {
        name: room.userName,
        image: room.userImage
      }
    }));

    res.json({
      success: true,
      data: transformedRooms,
      count: transformedRooms.length,
      searchTerm: search
    });

  } catch (error) {
    console.error('❌ Error fetching rooms:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rooms',
      message: error.message
    });
  }
});

// ==================== GET SPECIFIC ROOM ====================
/**
 * GET /api/rooms/:id
 * Get a specific room by ID
 */
router.get('/:id', async (req, res) => {
  try {
    // Validate the ID parameter
    const { id } = validateIdParam(req.params);
    
    console.log(`📄 Fetching room with ID: ${id}`);
    
    // Get room from database
    const room = await databaseService.getRoomById(id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found',
        message: `No room found with ID ${id}`
      });
    }

    // Transform the data
    const transformedRoom = {
      id: room.id,
      name: room.name,
      description: room.description,
      tags: room.tags,
      githubRepo: room.githubRepo,
      userId: room.userId,
      createdAt: room.createdAt,
      user: {
        name: room.userName,
        image: room.userImage
      }
    };

    res.json({
      success: true,
      data: transformedRoom
    });

  } catch (error) {
    if (error.message === 'Invalid ID parameter') {
      return res.status(400).json({
        success: false,
        error: 'Invalid room ID',
        message: 'Room ID must be a valid number'
      });
    }

    console.error('❌ Error fetching room:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch room',
      message: error.message
    });
  }
});

// ==================== CREATE ROOM ====================
/**
 * POST /api/rooms
 * Create a new room
 * Body: { name, description, tags, githubRepo }
 * Note: We'll add authentication later, for now using a dummy userId
 */
router.post('/', async (req, res) => {
  try {
    // Validate the request body
    const validatedData = validateCreateRoom(req.body);
    
    console.log('🆕 Creating new room:', validatedData.name);
    
    // For now, we'll use a dummy user ID (we'll replace this with real auth later)
    // First ensure a test user exists
    const testUserId = await databaseService.ensureTestUser();
    
    const roomData = {
      ...validatedData,
      userId: testUserId
    };
    
    // Create room in database
    const newRoom = await databaseService.createRoom(roomData);
    
    // Get the full room data with user info
    const fullRoomData = await databaseService.getRoomById(newRoom.id);
    
    // Transform the response
    const transformedRoom = {
      id: fullRoomData.id,
      name: fullRoomData.name,
      description: fullRoomData.description,
      tags: fullRoomData.tags,
      githubRepo: fullRoomData.githubRepo,
      userId: fullRoomData.userId,
      createdAt: fullRoomData.createdAt,
      user: {
        name: fullRoomData.userName,
        image: fullRoomData.userImage
      }
    };

    res.status(201).json({
      success: true,
      data: transformedRoom,
      message: 'Room created successfully'
    });

  } catch (error) {
    if (error.message.startsWith('Validation failed')) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }

    console.error('❌ Error creating room:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create room',
      message: `Failed to create room: ${error.message}`
    });
  }
});

// ==================== UPDATE ROOM ====================
/**
 * PUT /api/rooms/:id
 * Update an existing room
 * Body: { name, description, tags, githubRepo }
 */
router.put('/:id', async (req, res) => {
  try {
    // Validate the ID parameter
    const { id } = validateIdParam(req.params);
    
    // Validate the request body
    const validatedData = validateEditRoom(req.body);
    
    console.log(`✏️ Updating room with ID: ${id}`);
    
    // Check if room exists
    const existingRoom = await databaseService.getRoomById(id);
    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        error: 'Room not found',
        message: `No room found with ID ${id}`
      });
    }

    // TODO: Add authorization check here
    // if (existingRoom.userId !== req.user.id) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Unauthorized',
    //     message: 'You can only edit your own rooms'
    //   });
    // }
    
    // Update room in database
    const updatedRoom = await databaseService.updateRoom(id, validatedData);
    
    if (!updatedRoom) {
      return res.status(404).json({
        success: false,
        error: 'Room not found',
        message: 'Room was deleted during update'
      });
    }

    // Get the full updated room data
    const fullRoomData = await databaseService.getRoomById(id);
    
    // Transform the response
    const transformedRoom = {
      id: fullRoomData.id,
      name: fullRoomData.name,
      description: fullRoomData.description,
      tags: fullRoomData.tags,
      githubRepo: fullRoomData.githubRepo,
      userId: fullRoomData.userId,
      createdAt: fullRoomData.createdAt,
      user: {
        name: fullRoomData.userName,
        image: fullRoomData.userImage
      }
    };

    res.json({
      success: true,
      data: transformedRoom,
      message: 'Room updated successfully'
    });

  } catch (error) {
    if (error.message === 'Invalid ID parameter') {
      return res.status(400).json({
        success: false,
        error: 'Invalid room ID',
        message: 'Room ID must be a valid number'
      });
    }

    if (error.message.startsWith('Validation failed')) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }

    console.error('❌ Error updating room:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update room',
      message: error.message
    });
  }
});

// ==================== DELETE ROOM ====================
/**
 * DELETE /api/rooms/:id
 * Delete a room
 */
router.delete('/:id', async (req, res) => {
  try {
    // Validate the ID parameter
    const { id } = validateIdParam(req.params);
    
    console.log(`🗑️ Deleting room with ID: ${id}`);
    
    // Check if room exists
    const existingRoom = await databaseService.getRoomById(id);
    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        error: 'Room not found',
        message: `No room found with ID ${id}`
      });
    }

    // TODO: Add authorization check here
    // if (existingRoom.userId !== req.user.id) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Unauthorized',
    //     message: 'You can only delete your own rooms'
    //   });
    // }
    
    // Delete room from database
    await databaseService.deleteRoom(id);

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });

  } catch (error) {
    if (error.message === 'Invalid ID parameter') {
      return res.status(400).json({
        success: false,
        error: 'Invalid room ID',
        message: 'Room ID must be a valid number'
      });
    }

    console.error('❌ Error deleting room:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete room',
      message: error.message
    });
  }
});

// ==================== GET USER'S ROOMS ====================
/**
 * GET /api/rooms/user/:userId
 * Get all rooms created by a specific user
 */
router.get('/user/:userId', async (req, res) => {
  try {
    // Validate the userId parameter
    const { id: userId } = validateIdParam({ id: req.params.userId });
    
    console.log(`📋 Fetching rooms for user ID: ${userId}`);
    
    // Get user's rooms from database
    const userRooms = await databaseService.getUserRooms(userId);

    res.json({
      success: true,
      data: userRooms,
      count: userRooms.length,
      userId: userId
    });

  } catch (error) {
    if (error.message === 'Invalid ID parameter') {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
        message: 'User ID must be a valid number'
      });
    }

    console.error('❌ Error fetching user rooms:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user rooms',
      message: error.message
    });
  }
});

module.exports = router;
