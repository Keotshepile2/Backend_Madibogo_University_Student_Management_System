const mysql = require('mysql2');
require('dotenv').config();

console.log('=== RAILWAY DATABASE CONFIGURATION ===');
console.log('DATABASE_URL available:', !!process.env.DATABASE_URL);
console.log('MYSQLHOST:', process.env.MYSQLHOST);
console.log('MYSQLUSER:', process.env.MYSQLUSER);

// Create connection using Railway's environment variables
function createConnection() {
    // Use DATABASE_URL if available (Railway's primary method)
    if (process.env.DATABASE_URL) {
        console.log('Using DATABASE_URL for connection');
        return mysql.createConnection(process.env.DATABASE_URL);
    }
    
    // Fallback to individual environment variables
    const config = {
        host: process.env.MYSQLHOST || 'localhost',
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD || '',
        database: process.env.MYSQLDATABASE || 'student_record_system',
        port: process.env.MYSQLPORT || 3306,
        ssl: process.env.MYSQLHOST ? { rejectUnauthorized: false } : undefined
    };
    
    console.log('Using individual env vars for connection:', {
        host: config.host,
        user: config.user,
        database: config.database,
        port: config.port
    });
    
    return mysql.createConnection(config);
}

// REMOVED THE AUTOMATIC CONNECTION TEST
// This was causing the container to stop because connection.end() was being called

// Export the createConnection function directly
module.exports = createConnection;
