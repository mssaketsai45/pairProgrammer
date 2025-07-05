const express = require('express');
// Using real database service now
const databaseService = require('../services/database');
const { validateCreateUser } = require('../services/validation');

const router = express.Router();

// ==================== CREATE TEST USER ====================
/**
 * POST /api/users
 * Create a test user (for development only)
 */
router.post('/', async (req, res) => {
  try {
    const validatedData = validateCreateUser(req.body);
    
    // Check if user already exists
    const existingUser = await databaseService.findUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }
    
    const newUser = await databaseService.createUser(validatedData);
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });

  } catch (error) {
    if (error.message.startsWith('Validation failed')) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }

    console.error('❌ Error creating user:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error.message
    });
  }
});

// ==================== GET ALL USERS ====================
/**
 * GET /api/users
 * Get all users (for development only)
 */
router.get('/', async (req, res) => {
  try {
    // This is a simple implementation - in a real app, you'd have pagination, etc.
    const stats = await databaseService.getStats();
    
    res.json({
      success: true,
      message: 'Users endpoint - for development only',
      stats: stats
    });

  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

// ==================== DELETE USER ====================
/**
 * DELETE /api/users/:id
 * Delete a user by ID
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await databaseService.findUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User does not exist'
      });
    }
    
    await databaseService.deleteUser(id);
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: { deletedUserId: id }
    });

  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      message: error.message
    });
  }
});

module.exports = router;
