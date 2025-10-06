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

// Test connection
const connection = createConnection();

connection.connect((err) => {
    if (err) {
        console.log('❌ Database connection failed:', err.message);
        console.log('💡 Make sure MySQL service is provisioned on Railway');
    } else {
        console.log('✅ Database connected successfully!');
        
        // Test query
        connection.query('SELECT 1 + 1 AS result', (err, results) => {
            if (err) {
                console.log('Query test failed:', err.message);
            } else {
                console.log('Database query test successful. Result:', results[0].result);
            }
            connection.end();
        });
    }
});

// Export the createConnection function
function getConnection() {
    return createConnection();
}

module.exports = getConnection;
