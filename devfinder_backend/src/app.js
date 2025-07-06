const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database to test connection
require('./config/database');

// Import routes
const roomRoutes = require('./routes/rooms');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://localhost:3002',
      'https://pair-programmer-one.vercel.app'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/chat', require('./routes/chat'));
app.use('/api/users', userRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 DevFinder Backend API is running!',
    status: 'success',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      rooms: '/api/rooms',
      'get room': '/api/rooms/:id',
      'create room': 'POST /api/rooms',
      'update room': 'PUT /api/rooms/:id',
      'delete room': 'DELETE /api/rooms/:id',
      auth: '/api/auth (coming soon)'
    }
  });
});

// Debug endpoint to check environment (remove after fixing)
app.get('/debug', (req, res) => {
  res.json({
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url_exists: !!process.env.DATABASE_URL,
    database_url_length: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
    database_url_prefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'NOT_SET'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: ['/', '/health']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 DevFinder Backend Server Started!
📍 Running on: http://localhost:${PORT}
📍 Also available on: http://127.0.0.1:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
⏰ Started at: ${new Date().toLocaleString()}
  `);
});

module.exports = app;
