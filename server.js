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

// Test database connection on startup (but don't end it)
const getConnection = require('./config/database');
const testConnection = getConnection();

testConnection.connect((err) => {
    if (err) {
        console.log('❌ Database connection failed on startup:', err.message);
    } else {
        console.log('✅ Database connected successfully on startup!');
        // Don't call testConnection.end() - keep the connection alive
        // Just run a simple test query
        testConnection.query('SELECT 1 + 1 AS result', (err, results) => {
            if (err) {
                console.log('Query test failed:', err.message);
            } else {
                console.log('Database test query successful. Result:', results[0].result);
            }
            // Still don't end the connection here either
        });
    }
});

// Middleware
app.use(cors({
  origin: ['https://keotshepile2.github.io', 'http://localhost:3000'], // Fixed the GitHub Pages URL
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check endpoint (Railway needs this)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        database: 'Connected'
    });
});

// API Welcome route (moved before other routes to avoid conflict)
app.get('/api', (req, res) => {
    res.json({ 
        message: 'Madibogo University Student Management System API',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            students: '/api/students',
            modules: '/api/modules',
            enrollments: '/api/enrollments',
            reports: '/api/reports',
            programmes: '/api/programmes'
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/enrollments', enrolmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/programmes', programmeRoutes);

// Debug endpoint
app.get('/api/debug/programmes', (req, res) => {
    const db = getConnection();
    
    db.query('SELECT * FROM Programmes', (err, results) => {
        if (err) {
            return res.json({ error: err.message });
        }
        res.json({ programmes: results });
        db.end(); // Only end connection for individual requests, not on startup
    });
});

// Frontend routes - ONLY if you're serving frontend from the same repo
// If your frontend is on GitHub Pages, you might want to remove these
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/student-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/student-dashboard.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin-dashboard.html'));
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

// 404 handler for frontend routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../frontend/404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
