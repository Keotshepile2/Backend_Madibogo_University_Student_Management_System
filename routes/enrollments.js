const express = require('express');
const auth = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get enrollments for a specific student
router.get('/student/:studentId', auth, (req, res) => {
    const studentId = req.params.studentId;
    
    console.log('=== GET STUDENT ENROLLMENTS ===');
    console.log('Requested student ID:', studentId);
    console.log('Authenticated user:', req.user);
    
    // Students can only access their own data, admins can access any
    if (req.user.userType === 'student' && parseInt(req.user.id) !== parseInt(studentId)) {
        console.log('Access denied: Student trying to access other student data');
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const query = `
        SELECT 
            e.Enrollment_ID,
            e.Student_ID,
            e.Module_Code,
            m.Module_Name,
            m.Module_Description,
            m.Credit_Hours,
            e.Semester_Code,
            sem.Semester_Number,
            sem.Academic_Year,
            e.Mark_Obtained,
            e.Grade,
            e.Enrollment_Date,
            e.Status,
            p.Programme_Name
        FROM Student_Enrollments e
        LEFT JOIN Modules m ON e.Module_Code = m.Module_Code
        LEFT JOIN Semesters sem ON e.Semester_Code = sem.Semester_Code
        LEFT JOIN Students s ON e.Student_ID = s.Student_ID
        LEFT JOIN Programmes p ON s.Programme_Code = p.Programme_Code
        WHERE e.Student_ID = ?
        ORDER BY sem.Academic_Year DESC, sem.Semester_Number DESC, m.Module_Code
    `;
    
    console.log('Executing query for student:', studentId);
    
    db.query(query, [studentId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                message: 'Database error: ' + err.message,
                error: err 
            });
        }
        
        console.log(`Query successful. Found ${results.length} enrollments`);
        console.log('Enrollments data:', results);
        
        if (results.length === 0) {
            console.log('No enrollments found for student:', studentId);
            // Return empty array instead of error
            return res.json([]);
        }
        
        res.json(results);
    });
});

// Get all enrollments (admin only)
router.get('/', auth, (req, res) => {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const query = `
        SELECT 
            e.Enrollment_ID, e.Student_ID, s.Student_Name, 
            e.Module_Code, m.Module_Name, m.Credit_Hours,
            e.Semester_Code, sem.Academic_Year, sem.Semester_Number,
            e.Mark_Obtained, e.Grade, e.Enrollment_Date, e.Status,
            p.Programme_Name
        FROM Student_Enrollments e
        JOIN Students s ON e.Student_ID = s.Student_ID
        JOIN Modules m ON e.Module_Code = m.Module_Code
        JOIN Semesters sem ON e.Semester_Code = sem.Semester_Code
        LEFT JOIN Programmes p ON s.Programme_Code = p.Programme_Code
        ORDER BY e.Enrollment_ID DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        res.json(results);
    });
});
// Get marks for a specific student
router.get('/student/:studentId/marks', auth, (req, res) => {
    const studentId = req.params.studentId;
    
    // Students can only access their own data, admins can access any
    if (req.user.userType === 'student' && req.user.id != studentId) {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const query = `
        SELECT e.ModuleCode, m.ModuleName, e.Semester, e.Marks
        FROM Enrollments e
        JOIN Modules m ON e.ModuleCode = m.ModuleCode
        WHERE e.StudentID = ? AND e.Marks IS NOT NULL
        ORDER BY e.Semester, m.ModuleCode
    `;
    
    db.query(query, [studentId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        res.json(results);
    });
});
// Get semesters for dropdown
router.get('/semesters', auth, (req, res) => {
    const query = 'SELECT * FROM Semesters ORDER BY Academic_Year DESC, Semester_Number DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        res.json(results);
    });
});

// Get all marks (admin only)
router.get('/marks', auth, (req, res) => {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const query = `
        SELECT e.EnrollmentID, e.StudentID, s.Name as StudentName, s.Surname, 
               e.ModuleCode, m.ModuleName, e.Semester, e.Marks
        FROM Enrollments e
        JOIN Students s ON e.StudentID = s.StudentID
        JOIN Modules m ON e.ModuleCode = m.ModuleCode
        ORDER BY e.StudentID, e.Semester, m.ModuleCode
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        results.forEach(enrollment => {
            enrollment.StudentName = `${enrollment.StudentName} ${enrollment.Surname}`;
        });
        
        res.json(results);
    });
});

// Add new enrollment (admin only)
router.post('/', auth, (req, res) => {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const { studentId, moduleCode, semesterCode } = req.body;
    
    if (!studentId || !moduleCode || !semesterCode) {
        return res.status(400).json({ message: 'Student, module, and semester are required' });
    }
    
    // Check if enrollment already exists
    const checkQuery = 'SELECT * FROM Student_Enrollments WHERE Student_ID = ? AND Module_Code = ? AND Semester_Code = ?';
    
    db.query(checkQuery, [studentId, moduleCode, semesterCode], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        if (results.length > 0) {
            return res.status(400).json({ message: 'Student is already enrolled in this module for the selected semester' });
        }
        
        // Insert new enrollment
        const insertQuery = `
            INSERT INTO Student_Enrollments (Student_ID, Module_Code, Semester_Code) 
            VALUES (?, ?, ?)
        `;
        
        db.query(insertQuery, [studentId, moduleCode, semesterCode], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Database error' });
            }
            
            res.json({ 
                message: 'Student enrolled successfully',
                enrollmentId: results.insertId 
            });
        });
    });
});

// Update marks (admin only)
router.put('/marks', auth, (req, res) => {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const { enrollmentId, markObtained } = req.body;
    
    if (!enrollmentId || markObtained === undefined) {
        return res.status(400).json({ message: 'Enrollment ID and marks are required' });
    }
    
    if (markObtained < 0 || markObtained > 100) {
        return res.status(400).json({ message: 'Marks must be between 0 and 100' });
    }
    
    // Calculate grade
    let grade = 'F';
    if (markObtained >= 80) grade = 'A';
    else if (markObtained >= 70) grade = 'B';
    else if (markObtained >= 60) grade = 'C';
    else if (markObtained >= 50) grade = 'D';
    
    const updateQuery = 'UPDATE Student_Enrollments SET Mark_Obtained = ?, Grade = ? WHERE Enrollment_ID = ?';
    
    db.query(updateQuery, [markObtained, grade, enrollmentId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }
        
        res.json({ message: 'Marks updated successfully' });
    });
});


// Delete enrollment (admin only)
router.delete('/:id', auth, (req, res) => {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const enrollmentId = req.params.id;
    
    const query = 'DELETE FROM Enrollments WHERE EnrollmentID = ?';
    
    db.query(query, [enrollmentId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }
        
        res.json({ message: 'Enrollment deleted successfully' });
    });
});

module.exports = router;
