const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_uYiZqPz72gcp@ep-wispy-recipe-aoh4tbe7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
async function run() {
  const user = await pool.query("SELECT * FROM users WHERE email LIKE '%shantanu230205%'");
  console.log('USERS:', JSON.stringify(user.rows, null, 2));
  process.exit(0);
}
run();
