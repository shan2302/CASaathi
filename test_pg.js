import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = 'postgresql://neondb_owner:npg_uYiZqPz72gcp@ep-wispy-recipe-aoh4tbe7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new pg.Pool({
  connectionString,
});

async function run() {
  try {
    const password = 'testpassword';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const name = 'Test User';
    const email = 'test@example.com';
    const phone = null;
    const firmName = 'Test Firm';
    const otp = '123456';
    const expires = new Date();

    const insertResult = await pool.query(
      'INSERT INTO users (name, email, phone, password, firmName, isVerified, verificationToken, verificationExpires) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [name, email || null, phone || null, hashedPassword, firmName || 'My Practice', false, otp, expires]
    );

    console.log('Insert Result:', insertResult.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

run();
