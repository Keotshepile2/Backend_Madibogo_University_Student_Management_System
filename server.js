const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const moduleRoutes = require('./routes/modules');
const enrolmentRoutes = require('./routes/enrollments');
const reportRoutes = require('./routes/reports');
const programmeRoutes = require('./routes/programmes');

const app = express();

// Remove the immediate database connection test - do it on first request instead

// Middleware
app.use(cors({
  origin: ['https://keotshepile2.github.io', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint (CRITICAL for Railway)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Madibogo University Student Management System API',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/enrollments', enrolmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/programmes', programmeRoutes);

// Database test endpoint (instead of on startup)
app.get('/api/debug/database', (req, res) => {
  const getConnection = require('./config/database');
  const db = getConnection();
  
  db.connect((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.query('SELECT 1 + 1 AS result', (dbErr, results) => {
      if (dbErr) {
        res.status(500).json({ error: dbErr.message });
      } else {
        res.json({ 
          message: 'Database connection successful',
          result: results[0].result 
        });
      }
      db.end();
    });
  });
});

// Debug programmes endpoint
app.get('/api/debug/programmes', (req, res) => {
  const getConnection = require('./config/database');
  const db = getConnection();
  
  db.query('SHOW TABLES', (err, results) => {
    if (err) {
      return res.json({ error: err.message, tables: [] });
    }
    
    const tables = results.map(row => Object.values(row)[0]);
    res.json({ 
      message: 'Database tables',
      tables: tables
    });
    db.end();
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
