require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    // Create connection to MySQL server (without database)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('📦 Starting database migrations...');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    // Split SQL statements and execute
    const statements = schemaSql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✅ Executed:', statement.substring(0, 60) + '...');
        } catch (error) {
          console.error('❌ Error executing statement:', error.message);
        }
      }
    }

    console.log('\n✅ Database migrations completed successfully!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
