const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://shantanu230205_db_user:QWBfcIJcOh41vEQ2@casaathi.vcpa6rp.mongodb.net/?appName=CaSaathi';

mongoose.connect(MONGO_URI).then(async () => {
  const pgUserId = '18fdfbc0-47e2-4c3f-a522-ec9dc4c1d71d';
  const mongoUserId = '6a44ae1e84ba38d158ca0ae6';
  
  // Update Clients
  const clientSchema = new mongoose.Schema({ userId: String }, { strict: false });
  const Client = mongoose.models.Client || mongoose.model('Client', clientSchema);
  const clientsRes = await Client.updateMany({ userId: pgUserId }, { $set: { userId: mongoUserId } });
  console.log('Updated Clients:', clientsRes.modifiedCount);

  // Update Deadlines
  const deadlineSchema = new mongoose.Schema({ userId: String }, { strict: false });
  const Deadline = mongoose.models.Deadline || mongoose.model('Deadline', deadlineSchema);
  const dlRes = await Deadline.updateMany({ userId: pgUserId }, { $set: { userId: mongoUserId } });
  console.log('Updated Deadlines:', dlRes.modifiedCount);

  // Update Documents
  const docSchema = new mongoose.Schema({ userId: String }, { strict: false });
  const Document = mongoose.models.Document || mongoose.model('Document', docSchema);
  const docRes = await Document.updateMany({ userId: pgUserId }, { $set: { userId: mongoUserId } });
  console.log('Updated Documents:', docRes.modifiedCount);

  process.exit(0);
}).catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
