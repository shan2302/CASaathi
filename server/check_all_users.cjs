const pg = require('pg');
const POSTGRES_URI = 'postgresql://neondb_owner:npg_uYiZqPz72gcp@ep-wispy-recipe-aoh4tbe7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: POSTGRES_URI });
pool.query('SELECT id, email, name FROM users').then(res => {
  console.log('ALL POSTGRES USERS:', res.rows);
  pool.end();
}).catch(console.error);
