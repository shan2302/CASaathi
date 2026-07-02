const mongoose = require('mongoose');
const pg = require('pg');

const MONGO_URI = 'mongodb+srv://shantanu230205_db_user:QWBfcIJcOh41vEQ2@casaathi.vcpa6rp.mongodb.net/?appName=CaSaathi';
const POSTGRES_URI = 'postgresql://neondb_owner:npg_uYiZqPz72gcp@ep-wispy-recipe-aoh4tbe7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function sync() {
  try {
    await mongoose.connect(MONGO_URI);
    const pool = new pg.Pool({ connectionString: POSTGRES_URI });
    const userId = '18fdfbc0-47e2-4c3f-a522-ec9dc4c1d71d'; 

    const deadlineSchema = new mongoose.Schema({
      userId: { type: String, required: true },
      clientName: { type: String, required: true },
      clientPhone: String,
      type: { type: String, required: true },
      dueDate: { type: Date, required: true },
      status: { type: String, default: 'Safe' },
      createdAt: { type: Date, default: Date.now }
    });
    const DeadlineModel = mongoose.models.Deadline || mongoose.model('Deadline', deadlineSchema);
    const dlResult = await pool.query('SELECT * FROM deadlines WHERE userId = $1', [userId]);
    let migratedDl = 0;
    for (const d of dlResult.rows) {
      const exists = await DeadlineModel.findOne({ userId, clientName: d.clientname, type: d.type });
      if (!exists) {
        await new DeadlineModel({
          userId, clientName: d.clientname, clientPhone: d.clientphone, type: d.type, dueDate: d.duedate, status: d.status, createdAt: d.createdat
        }).save();
        migratedDl++;
      }
    }
    console.log('Migrated deadlines to MongoDB: ' + migratedDl);
    
    const docSchema = new mongoose.Schema({
      userId: { type: String, required: true },
      clientName: { type: String, required: true },
      pendingCount: { type: Number, default: 0 },
      pendingDocs: { type: [String], default: [] },
      createdAt: { type: Date, default: Date.now }
    });
    const DocModel = mongoose.models.Document || mongoose.model('Document', docSchema);
    const docResult = await pool.query('SELECT * FROM documents WHERE userId = $1', [userId]);
    let migratedDocs = 0;
    for (const doc of docResult.rows) {
      const exists = await DocModel.findOne({ userId, clientName: doc.clientname });
      if (!exists) {
        await new DocModel({
          userId, clientName: doc.clientname, pendingCount: doc.pendingcount, pendingDocs: doc.pendingdocs, createdAt: doc.createdat
        }).save();
        migratedDocs++;
      }
    }
    console.log('Migrated documents to MongoDB: ' + migratedDocs);

    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
}
sync();
