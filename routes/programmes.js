const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get all programmes with faculty details - NO AUTH REQUIRED for simplicity
router.get('/', (req, res) => {
    console.log('📡 Programmes endpoint called');
    
    const query = `
        SELECT p.Programme_Code, p.Programme_Name, p.Duration_Years, f.Faculty_Name 
        FROM Programmes p 
        JOIN Faculties f ON p.Faculty_Code = f.Faculty_Code 
        ORDER BY p.Programme_Name
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ 
                error: true,
                message: 'Database error: ' + err.message 
            });
        }
        
        console.log(`✅ Returning ${results.length} programmes`);
        res.json(results);
    });
});

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ 
        message: 'Programmes endpoint is working!',
        testData: [
            { Programme_Code: 'TEST1', Programme_Name: 'Test Programme 1', Faculty_Name: 'Test Faculty' },
            { Programme_Code: 'TEST2', Programme_Name: 'Test Programme 2', Faculty_Name: 'Test Faculty' }
        ]
    });
});

module.exports = router;