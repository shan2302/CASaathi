const mongoose = require('mongoose');
const pg = require('pg');

const MONGO_URI = "mongodb+srv://shan230205:t3b8t9P2S1qj@cluster0.z2g7d.mongodb.net/ca_saathi?retryWrites=true&w=majority";
const POSTGRES_URI = 'postgresql://neondb_owner:npg_uYiZqPz72gcp@ep-wispy-recipe-aoh4tbe7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Mongo Client Schema
const clientSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  business: { type: String, default: '-' },
  phone: { type: String, default: '-' },
  email: { type: String, default: '-' },
  gstin: { type: String, default: '-' },
  createdAt: { type: Date, default: Date.now }
});
const Client = mongoose.model('Client', clientSchema);

async function migrate() {
  console.log("Connecting to Mongo...");
  await mongoose.connect(MONGO_URI);
  
  console.log("Connecting to Postgres...");
  const pool = new pg.Pool({ connectionString: POSTGRES_URI });
  
  const userId = '18fdfbc0-47e2-4c3f-a522-ec9dc4c1d71d';
  
  const result = await pool.query("SELECT * FROM clients WHERE userId = $1", [userId]);
  const pgClients = result.rows;
  console.log(`Found ${pgClients.length} clients in Postgres.`);
  
  for (const c of pgClients) {
    const exists = await Client.findOne({ userId, name: c.name });
    if (!exists) {
      const newC = new Client({
        userId,
        name: c.name,
        business: c.business,
        phone: c.phone,
        email: c.email,
        gstin: c.gstin,
        createdAt: c.createdat
      });
      await newC.save();
      console.log(`Migrated ${c.name} to Mongo`);
    } else {
      console.log(`Client ${c.name} already exists in Mongo`);
    }
  }
  
  console.log("Done!");
  process.exit(0);
}

migrate();
