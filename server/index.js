const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const pg = require('pg');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// --- Middleware ---
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Prevent browser caching of API responses
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// --- Database Connection (PostgreSQL) ---
const NEON_FALLBACK = 'postgresql://neondb_owner:npg_uYiZqPz72gcp@ep-wispy-recipe-aoh4tbe7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const connectionString = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres') 
  ? process.env.DATABASE_URL 
  : NEON_FALLBACK;

const pool = new pg.Pool({
  connectionString: connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

app.get('/api/debug/db', async (req, res) => {
  try {
    const host = pool.options.host || (pool.options.connectionString ? pool.options.connectionString.split('@')[1].split('/')[0] : 'unknown');
    res.json({ host, dbUrlStart: connectionString.substring(0, 20) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Middleware to check DB connection (optional for Postgres, Pool handles it)
app.use(async (req, res, next) => {
  next();
});

// --- Firebase Admin Initialization ---
if (!admin.apps || !admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.warn('Firebase Admin initialization failed. Phone Auth will not work.', error.message);
  }
}

// --- Supabase Initialization (Storage) ---
let supabase;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

// --- Brevo Email/SMS Services ---
const sendEmail = async (toEmail, toName, subject, htmlContent) => {
  try {
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { name: "CA Saathi", email: "shantanu230205@gmail.com" },
      to: [{ email: toEmail, name: toName }],
      subject: subject,
      htmlContent: htmlContent
    }, {
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      }
    });
    return response.data;
  } catch (err) {
    console.error("Brevo Email Error:", err.response ? err.response.data : err.message);
    throw new Error('Failed to send email');
  }
};

const sendSms = async (toPhone, textContent) => {
  try {
    let formattedPhone = toPhone.replace(/[^\d+]/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }
    
    const response = await axios.post('https://api.brevo.com/v3/transactionalSMS/sms', {
      type: "transactional",
      unicodeEnabled: true,
      sender: "CASaathi",
      recipient: formattedPhone,
      content: textContent
    }, {
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      }
    });
    return response.data;
  } catch (err) {
    console.error("Brevo SMS Error:", err.response ? err.response.data : err.message);
    throw new Error('Failed to send SMS');
  }
};

// --- Auth Middleware ---
const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'secret_fallback');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// --- API Routes ---

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, phone, password, firmName } = req.body;
    if (!email && !phone) return res.status(400).json({ message: 'Email or phone required' });

    // Check if user exists
    let existingUserResult;
    if (email) {
       existingUserResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    } else {
       existingUserResult = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    }
    
    let user = existingUserResult.rows[0];

    if (user) {
      if (!user.isverified) {
         if (email) {
            await pool.query('DELETE FROM users WHERE email = $1', [email]);
         } else {
            await pool.query('DELETE FROM users WHERE phone = $1', [phone]);
         }
      } else {
         return res.status(400).json({ message: 'User already exists' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const insertResult = await pool.query(
      'INSERT INTO users (name, email, phone, password, firmName, isVerified, verificationToken, verificationExpires) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [name, email || null, phone || null, hashedPassword, firmName || 'My Practice', false, otp, expires]
    );

    const userId = insertResult.rows[0].id;

    if (email) {
      const html = `<h2>Welcome to CA Saathi!</h2><p>Your verification code is: <strong>${otp}</strong></p>`;
      await sendEmail(email, name, "Verify your CA Saathi account", html);
    } else if (phone) {
      await sendSms(phone, `Your CA Saathi verification code is: ${otp}`);
    }

    res.json({ message: 'OTP sent successfully', userId: userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    let userResult;
    if (email) {
      userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    } else {
      userResult = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    }
    
    const user = userResult.rows[0];
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isverified) return res.status(403).json({ message: 'Account not verified.', unverified: true, userId: user.id });
    if (!user.password) return res.status(400).json({ message: 'Please login with Google' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret_fallback', { expiresIn: '7d' });
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, firmName: user.firmname } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isverified) return res.status(400).json({ message: 'User already verified' });
    if (user.verificationtoken !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > new Date(user.verificationexpires)) return res.status(400).json({ message: 'OTP has expired. Please sign up again.' });
    
    await pool.query('UPDATE users SET isVerified = true, verificationToken = NULL, verificationExpires = NULL WHERE id = $1', [userId]);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret_fallback', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, firmName: user.firmname } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/firebase', async (req, res) => {
  try {
    const { idToken, name, firmName } = req.body;
    if (!idToken) return res.status(400).json({ message: 'No idToken provided' });

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const phone = decodedToken.phone_number;

    if (!phone) return res.status(400).json({ message: 'No phone number associated with this Firebase token' });

    const userResult = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    let user = userResult.rows[0];

    if (!user) {
      const insertResult = await pool.query(
        'INSERT INTO users (name, phone, firmName, isVerified) VALUES ($1, $2, $3, $4) RETURNING *',
        [name || 'User', phone, firmName || 'My Practice', true]
      );
      user = insertResult.rows[0];
    } else {
      if (!user.isverified) {
         await pool.query('UPDATE users SET isVerified = true WHERE id = $1', [user.id]);
         user.isverified = true;
      }
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret_fallback', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, firmName: user.firmname } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    
    await pool.query('UPDATE users SET verificationToken = $1, verificationExpires = $2 WHERE id = $3', [otp, expires, user.id]);

    const html = `<h2>Reset Password</h2><p>Your OTP is: <strong>${otp}</strong></p>`;
    await sendEmail(user.email, user.name, "CA Saathi Login OTP", html);

    res.json({ message: 'OTP sent to email', userId: user.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.verificationtoken !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > new Date(user.verificationexpires)) return res.status(400).json({ message: 'OTP has expired' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = $1, verificationToken = NULL, verificationExpires = NULL WHERE id = $2', [hashedPassword, user.id]);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT id, name, email, phone, firmname, isverified FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      phone: user.phone, 
      firmName: user.firmname, 
      isVerified: user.isverified 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/auth/me/firm-name', auth, async (req, res) => {
  try {
    const firmName = (req.body.firmName || '').trim();
    if (!firmName) return res.status(400).json({ message: 'Firm name is required' });

    const updateResult = await pool.query(
      'UPDATE users SET firmName = $1 WHERE id = $2 RETURNING id, firmname',
      [firmName, req.user.id]
    );

    const user = updateResult.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ id: user.id, firmName: user.firmname });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const mapClient = (row) => ({ id: row.id, userId: row.userid, name: row.name, business: row.business, phone: row.phone, email: row.email, gstin: row.gstin, createdAt: row.createdat });

// Clients (Protected)
app.get('/api/clients-live', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients WHERE userId = $1 ORDER BY createdAt DESC', [req.user.id]);
    res.json(result.rows.map(mapClient));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/clients', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients WHERE userId = $1 ORDER BY createdAt DESC', [req.user.id]);
    res.json(result.rows.map(mapClient));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/clients', auth, async (req, res) => {
  try {
    const { name, business, phone, email, gstin } = req.body;
    const insertResult = await pool.query(
      'INSERT INTO clients (userId, name, business, phone, email, gstin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, name, business, phone, email, gstin]
    );
    res.json(mapClient(insertResult.rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/clients/:id', auth, async (req, res) => {
  try {
    const { name, business, phone, email, gstin } = req.body;
    const updateResult = await pool.query(
      'UPDATE clients SET name = $1, business = $2, phone = $3, email = $4, gstin = $5 WHERE id = $6 AND userId = $7 RETURNING *',
      [name, business, phone, email, gstin, req.params.id, req.user.id]
    );
    res.json(mapClient(updateResult.rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/clients/delete/:id', auth, async (req, res) => {
  try {
    const clientResult = await pool.query('SELECT name FROM clients WHERE id = $1 AND userId = $2', [req.params.id, req.user.id]);
    if (clientResult.rows.length === 0) return res.status(404).json({ message: 'Client not found' });
    const clientName = clientResult.rows[0].name;

    await pool.query('DELETE FROM clients WHERE id = $1 AND userId = $2', [req.params.id, req.user.id]);
    await pool.query('DELETE FROM deadlines WHERE clientName = $1 AND userId = $2', [clientName, req.user.id]);
    await pool.query('DELETE FROM documents WHERE clientName = $1 AND userId = $2', [clientName, req.user.id]);
    
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const mapDeadline = (row) => ({ id: row.id, userId: row.userid, clientName: row.clientname, clientPhone: row.clientphone, type: row.type, dueDate: row.duedate, status: row.status, createdAt: row.createdat });

// Deadlines (Protected)
app.get('/api/deadlines', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM deadlines WHERE userId = $1 ORDER BY dueDate ASC', [req.user.id]);
    res.json(result.rows.map(mapDeadline));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/deadlines', auth, async (req, res) => {
  try {
    const { clientName, clientPhone, type, dueDate, status } = req.body;
    const insertResult = await pool.query(
      'INSERT INTO deadlines (userId, clientName, clientPhone, type, dueDate, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, clientName, clientPhone, type, dueDate, status]
    );
    res.json(mapDeadline(insertResult.rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/deadlines/:id', auth, async (req, res) => {
  try {
    const { type, status, dueDate } = req.body;
    const updateResult = await pool.query(
      'UPDATE deadlines SET type = COALESCE($1, type), status = $2, dueDate = $3 WHERE id = $4 AND userId = $5 RETURNING *',
      [type || null, status, dueDate, req.params.id, req.user.id]
    );
    const deadline = updateResult.rows[0];
    if (!deadline) return res.status(404).json({ message: 'Deadline not found' });
    res.json(mapDeadline(deadline));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/deadlines/delete/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM deadlines WHERE id = $1 AND userId = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Deadline deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const mapDocument = (row) => ({ id: row.id, userId: row.userid, clientName: row.clientname, business: row.business, pendingCount: row.pendingcount, docs: row.docs, createdAt: row.createdat });

// Documents (Protected)
app.get('/api/documents', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documents WHERE userId = $1 ORDER BY createdAt DESC', [req.user.id]);
    res.json(result.rows.map(mapDocument));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/documents', auth, async (req, res) => {
  try {
    const { clientName, business, pendingCount, docs } = req.body;
    const insertResult = await pool.query(
      'INSERT INTO documents (userId, clientName, business, pendingCount, docs) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, clientName, business, pendingCount, JSON.stringify(docs)]
    );
    res.json(mapDocument(insertResult.rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/documents/:id', auth, async (req, res) => {
  try {
    const { docs, pendingCount } = req.body;
    const updateResult = await pool.query(
      'UPDATE documents SET docs = $1, pendingCount = $2 WHERE id = $3 AND userId = $4 RETURNING *',
      [JSON.stringify(docs), pendingCount, req.params.id, req.user.id]
    );
    res.json(mapDocument(updateResult.rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const mapReminder = (row) => ({ id: row.id, userId: row.userid, clientName: row.clientname, clientPhone: row.clientphone, clientEmail: row.clientemail, deadlineType: row.deadlinetype, message: row.message, sendMethod: row.sendmethod, status: row.status, createdAt: row.createdat });

// Reminders (Protected)
app.get('/api/reminders', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reminders WHERE userId = $1 ORDER BY createdAt DESC', [req.user.id]);
    res.json(result.rows.map(mapReminder));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/reminders/send', auth, async (req, res) => {
  try {
    const { clientEmail, clientPhone, clientName, deadlineType, message, subject, sendMethod = 'email' } = req.body;
    
    if (sendMethod === 'email' && !clientEmail) {
      return res.status(400).json({ message: 'Client email is required to send email reminder' });
    }
    if (sendMethod === 'sms' && !clientPhone) {
      return res.status(400).json({ message: 'Client phone is required to send SMS reminder' });
    }
    
    let emailStatus = '';
    if (sendMethod === 'email' || sendMethod === 'both') {
      if (clientEmail) {
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2>Reminder from CA Saathi</h2>
            <p>Dear ${clientName || 'Client'},</p>
            <p>${message.replace(/\n/g, '<br/>')}</p>
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #888;">This is an automated reminder sent via CA Saathi Practice Management.</p>
          </div>
        `;
        try {
          await sendEmail(clientEmail, clientName || 'Client', subject || 'Important Reminder', htmlContent);
          emailStatus = 'Email Sent';
        } catch (e) {
          emailStatus = 'Email Failed';
        }
      }
    }

    let smsStatus = '';
    if (sendMethod === 'sms' || sendMethod === 'both') {
      if (clientPhone) {
        try {
          const smsMessage = `CA Saathi Reminder: Dear ${clientName || 'Client'}, ${message}`;
          await sendSms(clientPhone, smsMessage);
          smsStatus = 'SMS Sent';
        } catch (e) {
          smsStatus = 'SMS Failed (No Credits/Invalid)';
        }
      }
    }
    
    try {
      const insertResult = await pool.query(
        'INSERT INTO reminders (userId, clientName, clientEmail, clientPhone, deadlineType, message, sendMethod, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [req.user.id, clientName, clientEmail || null, clientPhone || null, deadlineType, message, sendMethod, smsStatus === 'SMS Sent' || emailStatus === 'Email Sent' ? 'Sent' : 'Failed']
      );
      res.json(mapReminder(insertResult.rows[0]));
    } catch (e) {
      console.warn("Failed to log reminder to PG", e);
      res.status(500).json({ message: 'Reminder sent but failed to log' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Storage Route (Protected)
app.post('/api/storage/upload', auth, async (req, res) => {
  try {
    const { filename, fileData, contentType } = req.body;
    const base64Data = fileData.replace(/^data:.*?;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    const filePath = `${req.user.id}/${Date.now()}_${filename}`;
    
    const { data, error } = await supabase
      .storage
      .from('documents')
      .upload(filePath, buffer, {
        contentType: contentType || 'application/octet-stream',
        upsert: false
      });
      
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase
      .storage
      .from('documents')
      .getPublicUrl(filePath);
      
    res.json({ url: publicUrl, path: filePath });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/migrate-now', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const MONGO_URI = process.env.MONGO_URI;
    await mongoose.connect(MONGO_URI);
    
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
    
    const userId = '18fdfbc0-47e2-4c3f-a522-ec9dc4c1d71d';
    const result = await pool.query("SELECT * FROM clients WHERE userId = $1", [userId]);
    const pgClients = result.rows;
    
    let migrated = 0;
    for (const c of pgClients) {
      const exists = await ClientModel.findOne({ userId, name: c.name });
      if (!exists) {
        const newC = new ClientModel({
          userId,
          name: c.name,
          business: c.business,
          phone: c.phone,
          email: c.email,
          gstin: c.gstin,
          createdAt: c.createdat
        });
        await newC.save();
        migrated++;
      }
    }
    res.json({ success: true, migrated, total: pgClients.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Serverless Express API (PG) initialized');
});

module.exports = app;

