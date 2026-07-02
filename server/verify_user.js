const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_uYiZqPz72gcp@ep-wispy-recipe-aoh4tbe7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
pool.query("UPDATE users SET isVerified = true WHERE email = 'urgenttest4@test.com'").then(res => { console.log('VERIFIED'); process.exit(0); });
