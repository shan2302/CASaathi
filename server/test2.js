const pg = require("pg");
const pool = new pg.Pool({ connectionString: "postgresql://neondb_owner:npg_uYiZqPz72gcp@ep-wispy-recipe-aoh4tbe7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" });
async function test() {
  try {
    await pool.query("SELECT * FROM clients WHERE userId = $1 ORDER BY createdAt DESC", ["18fdfbc0-47e2-4c3f-a522-ec9dc4c1d71d"]);
    console.log("CLIENTS OK");
    await pool.query("SELECT * FROM deadlines WHERE userId = $1 ORDER BY dueDate ASC", ["18fdfbc0-47e2-4c3f-a522-ec9dc4c1d71d"]);
    console.log("DEADLINES OK");
    await pool.query("SELECT * FROM documents WHERE userId = $1 ORDER BY createdAt DESC", ["18fdfbc0-47e2-4c3f-a522-ec9dc4c1d71d"]);
    console.log("DOCUMENTS OK");
  } catch(e) {
    console.error("ERROR:", e.message);
  }
  process.exit(0);
}
test();
