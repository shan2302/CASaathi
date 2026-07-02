const pg = require("pg");
const pool = new pg.Pool({ connectionString: "postgresql://neondb_owner:npg_uYiZqPz72gcp@ep-wispy-recipe-aoh4tbe7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" });
const mapDocument = (row) => ({ id: row.id, userId: row.userid, clientName: row.clientname, business: row.business, pendingCount: row.pendingcount, docs: row.docs, createdAt: row.createdat });
async function test() {
  try {
    const result = await pool.query("SELECT * FROM documents WHERE userId = $1 ORDER BY createdAt DESC", ["18fdfbc0-47e2-4c3f-a522-ec9dc4c1d71d"]);
    console.log("MAPPED:", result.rows.map(mapDocument).length);
  } catch(e) {
    console.error("ERROR:", e.message);
  }
  process.exit(0);
}
test();
