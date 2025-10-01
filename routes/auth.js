const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const router = express.Router();

router.post('/login', (req, res) => {
    const { email, password, userType } = req.body;

    console.log('\n=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('User Type:', userType);

    const table = userType === 'admin' ? 'Admins' : 'Students';
    const emailColumn = userType === 'admin' ? 'Email_Address' : 'Email_Address';
    const idColumn = userType === 'admin' ? 'Admin_ID' : 'Student_ID';
    const nameColumn = userType === 'admin' ? 'Admin_Name' : 'Student_Name';
    
    const query = `SELECT * FROM ${table} WHERE ${emailColumn} = ?`;
    
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Database error' 
            });
        }
        
        if (results.length === 0) {
            console.log('No user found with email:', email);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }
        
        const user = results[0];
        console.log('User found:', user[emailColumn]);
        
        if (user.Password === password) {
            console.log('✅ Login successful!');
            
            const token = jwt.sign(
                { 
                    id: user[idColumn], 
                    email: user[emailColumn],
                    userType: userType,
                    name: user[nameColumn]
                },
                process.env.JWT_SECRET || 'fallback-secret-key',
                { expiresIn: '24h' }
            );
            
            let userData = {
                id: user[idColumn],
                name: user[nameColumn],
                email: user[emailColumn],
                userType: userType
            };
            
            // Add student-specific fields
            if (userType === 'student') {
                userData.programmeCode = user.Programme_Code;
                userData.yearEnrolled = user.Year_Enrolled;
                userData.enrollmentStatus = user.Enrollment_Status;
            }
            
            return res.json({
                success: true,
                message: 'Login successful',
                token: token,
                user: userData,
                userType: userType
            });
        } else {
            console.log('❌ Password mismatch');
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }
    });
});

router.get('/verify', (req, res) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
        return res.status(401).json({ valid: false, message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ valid: false, message: 'Token invalid' });
    }
});

module.exports = router;
