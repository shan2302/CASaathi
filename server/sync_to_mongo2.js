const mongoose = require('mongoose');
const pg = require('pg');

const MONGO_URI = 'mongodb+srv://shantanu230205_db_user:QWBfcIJcOh41vEQ2@casaathi.vcpa6rp.mongodb.net/?appName=CaSaathi';
const POSTGRES_URI = 'postgresql://neondb_owner:npg_uYiZqPz72gcp@ep-wispy-recipe-aoh4tbe7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const clientSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  business: { type: String, default: '-' },
  phone: { type: String, default: '-' },
  email: { type: String, default: '-' },
  gstin: { type: String, default: '-' },
  createdAt: { type: Date, default: Date.now }
});

const ClientModel = mongoose.models.Client || mongoose.model('Client', clientSchema);

async function sync() {
  try {
    await mongoose.connect(MONGO_URI);
    const pool = new pg.Pool({ connectionString: POSTGRES_URI });
    const userId = '18fdfbc0-47e2-4c3f-a522-ec9dc4c1d71d'; 
    const result = await pool.query('SELECT * FROM clients WHERE userId = $1', [userId]);
    const pgClients = result.rows;
    let migrated = 0;
    for (const c of pgClients) {
      const exists = await ClientModel.findOne({ userId, name: c.name });
      if (!exists) {
        const newC = new ClientModel({
          userId, name: c.name, business: c.business, phone: c.phone, email: c.email, gstin: c.gstin, createdAt: c.createdat
        });
        await newC.save();
        migrated++;
      }
    }
    console.log('Migrated clients to MongoDB: ' + migrated);
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
}

sync();
