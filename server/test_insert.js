const pg = require("pg");
const pool = new pg.Pool({ connectionString: "postgresql://neondb_owner:npg_uYiZqPz72gcp@ep-wispy-recipe-aoh4tbe7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" });
pool.query("INSERT INTO clients (userId, name, business, phone, email, gstin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", ["18fdfbc0-47e2-4c3f-a522-ec9dc4c1d71d", "Test Client", "Test Business", "1234567890", "test@test.com", "GSTIN123"])
  .then(res => { console.log("INSERTED:", res.rows[0]); process.exit(0); })
  .catch(e => { console.log("ERROR:", e.message); process.exit(1); })
