const mysql = require('mysql2');
require('dotenv').config();

console.log('=== RAILWAY DATABASE CONFIGURATION ===');
console.log('DATABASE_URL available:', !!process.env.DATABASE_URL);
console.log('MYSQLHOST:', process.env.MYSQLHOST);
console.log('MYSQLUSER:', process.env.MYSQLUSER);

function createConnection() {
    if (process.env.DATABASE_URL) {
        console.log('Using DATABASE_URL for connection');
        return mysql.createConnection(process.env.DATABASE_URL);
    }
    
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

// NO AUTOMATIC CONNECTION TEST - just export the function
module.exports = createConnection;
