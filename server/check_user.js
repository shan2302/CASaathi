const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_uYiZqPz72gcp@ep-wispy-recipe-aoh4tbe7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
pool.query("SELECT * FROM users WHERE email = 'shantanu230205@gmail.com'").then(res => { console.log(res.rows); process.exit(0); });
