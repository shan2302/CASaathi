const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_uYiZqPz72gcp@ep-wispy-recipe-aoh4tbe7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
async function run() {
  const d = await pool.query("SELECT * FROM deadlines WHERE userId = '18fdfbc0-47e2-4c3f-a522-ec9dc4c1d71d'");
  console.log('DEADLINES:', d.rows);
  const doc = await pool.query("SELECT * FROM documents WHERE userId = '18fdfbc0-47e2-4c3f-a522-ec9dc4c1d71d'");
  console.log('DOCUMENTS:', doc.rows);
  process.exit(0);
}
run();
