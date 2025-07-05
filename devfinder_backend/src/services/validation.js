const { z } = require('zod');

// ==================== ROOM VALIDATION SCHEMAS ====================

/**
 * Schema for creating a new room
 * Matches the validation from your original Next.js project
 */
const createRoomSchema = z.object({
  name: z.string()
    .min(1, "Room name is required")
    .max(100, "Room name must be less than 100 characters")
    .trim(),
  
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .transform(val => val === "" ? null : val),
  
  tags: z.string()
    .max(200, "Tags must be less than 200 characters")
    .optional()
    .transform(val => val === "" ? null : val),
  
  githubRepo: z.string()
    .optional()
    .transform(val => {
      if (!val || val.trim() === "") return null;
      return val.trim();
    })
    .refine(val => {
      if (val === null || val === undefined) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, {
      message: "GitHub repository must be a valid URL or empty"
    })
});

/**
 * Schema for editing an existing room
 * Same as create but for updates
 */
const editRoomSchema = createRoomSchema;

/**
 * Schema for room search/query parameters
 */
const roomQuerySchema = z.object({
  search: z.string()
    .max(100, "Search term must be less than 100 characters")
    .optional()
    .transform(val => val === "" ? null : val),
  
  page: z.string()
    .regex(/^\d+$/, "Page must be a number")
    .transform(Number)
    .refine(val => val > 0, "Page must be greater than 0")
    .optional()
    .default("1"),
  
  limit: z.string()
    .regex(/^\d+$/, "Limit must be a number")
    .transform(Number)
    .refine(val => val > 0 && val <= 100, "Limit must be between 1 and 100")
    .optional()
    .default("20")
});

// ==================== USER VALIDATION SCHEMAS ====================

/**
 * Schema for user registration/creation
 */
const createUserSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  
  email: z.string()
    .email("Must be a valid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase(),
  
  image: z.string()
    .url("Image must be a valid URL")
    .optional()
    .or(z.literal(""))
    .transform(val => val === "" ? null : val)
});

/**
 * Schema for updating user information
 */
const updateUserSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),
  
  image: z.string()
    .url("Image must be a valid URL")
    .optional()
    .or(z.literal(""))
    .transform(val => val === "" ? null : val)
});

// ==================== COMMON VALIDATION SCHEMAS ====================

/**
 * Schema for validating IDs in URL parameters
 * Updated to accept both UUIDs and text IDs from NextAuth
 */
const idParamSchema = z.object({
  id: z.string()
    .min(1, "ID cannot be empty")
    .max(100, "ID is too long")
    .trim()
});

/**
 * Schema for pagination parameters
 */
const paginationSchema = z.object({
  page: z.number()
    .int()
    .min(1, "Page must be at least 1")
    .default(1),
  
  limit: z.number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20)
});

// ==================== UTILITY FUNCTIONS ====================

/**
 * Validate and parse room data for creation
 * @param {Object} data - Raw room data
 * @returns {Object} Validated room data
 * @throws {Error} Validation error with details
 */
const validateCreateRoom = (data) => {
  try {
    return createRoomSchema.parse(data);
  } catch (error) {
    const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
    throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
  }
};

/**
 * Validate and parse room data for editing
 * @param {Object} data - Raw room data
 * @returns {Object} Validated room data
 * @throws {Error} Validation error with details
 */
const validateEditRoom = (data) => {
  try {
    return editRoomSchema.parse(data);
  } catch (error) {
    const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
    throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
  }
};

/**
 * Validate and parse user data for creation
 * @param {Object} data - Raw user data
 * @returns {Object} Validated user data
 * @throws {Error} Validation error with details
 */
const validateCreateUser = (data) => {
  try {
    return createUserSchema.parse(data);
  } catch (error) {
    const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
    throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
  }
};

/**
 * Validate URL parameters containing an ID
 * @param {Object} params - URL parameters
 * @returns {Object} Validated parameters with parsed ID
 * @throws {Error} Validation error
 */
const validateIdParam = (params) => {
  try {
    return idParamSchema.parse(params);
  } catch (error) {
    throw new Error('Invalid ID parameter');
  }
};

/**
 * Validate query parameters for room search
 * @param {Object} query - Query parameters
 * @returns {Object} Validated query parameters
 */
const validateRoomQuery = (query) => {
  try {
    return roomQuerySchema.parse(query);
  } catch (error) {
    // Return defaults if validation fails
    return { search: null, page: 1, limit: 20 };
  }
};

// ==================== EXPORTS ====================

module.exports = {
  // Schemas
  createRoomSchema,
  editRoomSchema,
  roomQuerySchema,
  createUserSchema,
  updateUserSchema,
  idParamSchema,
  paginationSchema,
  
  // Validation functions
  validateCreateRoom,
  validateEditRoom,
  validateCreateUser,
  validateIdParam,
  validateRoomQuery
};
