import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_uYiZqPz72gcp@ep-wispy-recipe-aoh4tbe7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({
  connectionString: connectionString,
});

async function initDB() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        firmName VARCHAR(255) NOT NULL,
        isVerified BOOLEAN DEFAULT FALSE,
        verificationToken VARCHAR(255),
        verificationExpires TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created users table');

    // Create clients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        userId UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255),
        business VARCHAR(255),
        phone VARCHAR(255),
        email VARCHAR(255),
        gstin VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created clients table');

    // Create deadlines table
    await client.query(`
      CREATE TABLE IF NOT EXISTS deadlines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        userId UUID REFERENCES users(id) ON DELETE CASCADE,
        clientName VARCHAR(255),
        clientPhone VARCHAR(255),
        type VARCHAR(255),
        dueDate VARCHAR(255),
        status VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created deadlines table');

    // Create documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        userId UUID REFERENCES users(id) ON DELETE CASCADE,
        clientName VARCHAR(255),
        business VARCHAR(255),
        pendingCount INTEGER,
        docs JSONB,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created documents table');

    // Create reminders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        userId UUID REFERENCES users(id) ON DELETE CASCADE,
        clientName VARCHAR(255),
        clientEmail VARCHAR(255),
        clientPhone VARCHAR(255),
        deadlineType VARCHAR(255),
        message TEXT,
        status VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created reminders table');

    console.log('Database initialization completed successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await client.end();
  }
}

initDB();
