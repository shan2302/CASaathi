const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');

// Initialize Firebase Admin
if (!admin.apps || !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'dummy',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'dummy@dummy.com',
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '-----BEGIN PRIVATE KEY-----\ndummy\n-----END PRIVATE KEY-----\n',
      })
    });
  } catch (err) {
    console.error("Firebase Admin initialization error", err);
  }
}

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

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
    console.log("Brevo API Success Response:", response.data);
    return response.data;
  } catch (err) {
    console.error("Brevo Email Error:", err.response ? err.response.data : err.message);
    throw new Error('Failed to send email');
  }
};

const sendSms = async (toPhone, textContent) => {
  try {
    // Format the phone number to be E.164 compliant for Brevo (worldwide)
    // Strip all spaces, dashes, parentheses, etc. (keep only digits and +)
    let formattedPhone = toPhone.replace(/[^\d+]/g, '');
    
    // Ensure it starts with a plus (assuming user provided country code)
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) {
        formattedPhone = '+91' + formattedPhone;
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }

    const response = await axios.post('https://api.brevo.com/v3/transactionalSMS/sms', {
      sender: "CASaathi",
      recipient: formattedPhone,
      content: textContent,
      type: "transactional"
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

const app = express();
app.use(cors());
app.use(express.json());

// --- Database Connection (Serverless Optimized) ---
if (!process.env.MONGO_URI) {
  console.error("CRITICAL ERROR: MONGO_URI is missing from environment variables.");
}

const connectDB = async () => {
  // Use Mongoose's internal readyState to check if we are actually connected
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // Fail fast if IP is blocked
    });
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err;
  }
};

// Add middleware to ensure DB connection on every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database connection failed. Please check MongoDB IP Whitelist." });
  }
});

// --- Mongoose Models ---
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, sparse: true },
  phone: { type: String, sparse: true },
  password: { type: String },
  firmName: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const ClientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  business: String,
  phone: String,
  email: String,
  gstin: String,
  createdAt: { type: Date, default: Date.now }
});
const Client = mongoose.model('Client', ClientSchema);

const DeadlineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientName: String,
  clientPhone: String,
  type: String,
  dueDate: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});
const Deadline = mongoose.model('Deadline', DeadlineSchema);

const DocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientName: String,
  business: String,
  pendingCount: Number,
  docs: [{
    name: String,
    status: String
  }],
  createdAt: { type: Date, default: Date.now }
});
const Document = mongoose.model('Document', DocumentSchema);


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
    
    // Determine primary identifier
    const identifier = email ? { email } : { phone };
    if (!email && !phone) return res.status(400).json({ message: 'Email or phone required' });

    // Check if user exists
    let user = await User.findOne(identifier);
    if (user) {
      if (!user.isVerified) {
         // Allow re-sending OTP if not verified
         await User.deleteOne(identifier);
      } else {
         return res.status(400).json({ message: 'User already exists' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      firmName: firmName || 'My Practice',
      isVerified: false,
      verificationToken: otp,
      verificationExpires: expires
    });

    await user.save();

    // Send OTP
    if (email) {
      const html = `<h2>Welcome to CA Saathi!</h2><p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`;
      await sendEmail(email, name, "Verify your CA Saathi account", html);
    } else if (phone) {
      // Ensure phone is E.164 formatted in frontend
      await sendSms(phone, `Your CA Saathi verification code is: ${otp}`);
    }

    res.json({ message: 'OTP sent successfully', userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    
    const identifier = email ? { email } : { phone };
    const user = await User.findOne(identifier);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) return res.status(403).json({ message: 'Account not verified. Please complete signup verification.', unverified: true, userId: user._id });
    if (!user.password) return res.status(400).json({ message: 'Please login with Google' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_fallback', { expiresIn: '7d' });
    
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, firmName: user.firmName } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: 'User not found' });
    
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
    
    if (user.verificationToken !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    
    if (new Date() > user.verificationExpires) return res.status(400).json({ message: 'OTP has expired. Please sign up again.' });
    
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_fallback', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, firmName: user.firmName } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Advanced Auth Flows

app.post('/api/auth/firebase', async (req, res) => {
  try {
    const { idToken, name, firmName } = req.body;
    if (!idToken) return res.status(400).json({ message: 'No idToken provided' });

    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const phone = decodedToken.phone_number;

    if (!phone) return res.status(400).json({ message: 'No phone number associated with this Firebase token' });

    // Find if user already exists
    let user = await User.findOne({ phone });

    if (!user) {
      // Create new user if signupData was provided, or if they are just a new user logging in
      user = new User({
        name: name || 'User',
        phone,
        firmName: firmName || 'My Practice',
        isVerified: true // Firebase already verified them
      });
      await user.save();
    } else {
      // Ensure they are marked verified
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_fallback', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, firmName: user.firmName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Firebase auth failed' });
  }
});

app.post('/api/auth/login-otp/send', async (req, res) => {
  try {
    const { identifier } = req.body; // email or phone
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
    if (!user) return res.status(404).json({ message: 'No account found with that email/phone' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationToken = otp;
    user.verificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    if (user.email === identifier) {
      const html = `<p>Your login OTP is: <strong>${otp}</strong></p>`;
      await sendEmail(user.email, user.name, "CA Saathi Login OTP", html);
    } else {
      await sendSms(user.phone, `CA Saathi Login OTP: ${otp}`);
    }

    res.json({ message: 'OTP sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login-otp/verify', async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.verificationToken !== otp || new Date() > user.verificationExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true; // Just in case they weren't verified
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_fallback', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, firmName: user.firmName } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    const resetToken = require('crypto').randomBytes(32).toString('hex');
    user.verificationToken = resetToken;
    user.verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    const html = `<p>Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`;
    await sendEmail(user.email, user.name, "Reset Your Password", html);

    res.json({ message: 'Password reset link sent to email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({ verificationToken: token, verificationExpires: { $gt: Date.now() } });
    
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Clients (Protected)
app.get('/api/clients', auth, async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/clients', auth, async (req, res) => {
  try {
    const newClient = new Client({
      ...req.body,
      userId: req.user.id
    });
    const savedClient = await newClient.save();
    res.status(201).json(savedClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/clients/update/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/clients/delete/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    
    // Also delete associated deadlines and documents
    await Deadline.deleteMany({ clientName: client.name, userId: req.user.id });
    await Document.deleteMany({ clientName: client.name, userId: req.user.id });
    
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Deadlines (Protected)
app.get('/api/deadlines', auth, async (req, res) => {
  try {
    const deadlines = await Deadline.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(deadlines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/deadlines', auth, async (req, res) => {
  try {
    const newDeadline = new Deadline({
      ...req.body,
      userId: req.user.id
    });
    const savedDeadline = await newDeadline.save();
    res.status(201).json(savedDeadline);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/deadlines/update/:id', auth, async (req, res) => {
  try {
    const deadline = await Deadline.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!deadline) return res.status(404).json({ message: 'Deadline not found' });
    res.json(deadline);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/deadlines/delete/:id', auth, async (req, res) => {
  try {
    await Deadline.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deadline deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Documents (Protected)
app.get('/api/documents', auth, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/documents', auth, async (req, res) => {
  try {
    const newDoc = new Document({
      ...req.body,
      userId: req.user.id
    });
    const savedDoc = await newDoc.save();
    res.status(201).json(savedDoc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Reminder Schema
const reminderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  clientName: String,
  clientEmail: String,
  clientPhone: String,
  deadlineType: String,
  message: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});
const Reminder = mongoose.model('Reminder', reminderSchema);

// Reminders (Protected)
app.get('/api/reminders', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(reminders);
  } catch (err) {
    console.error('Fetch reminders error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
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
    
    // 1. Send Email if requested
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
        await sendEmail(clientEmail, clientName || 'Client', subject || 'Important Reminder', htmlContent);
      }
    }

    // 2. Send SMS if requested
    let smsStatus = '';
    if (sendMethod === 'sms' || sendMethod === 'both') {
      if (clientPhone) {
        try {
          const smsMessage = `CA Saathi Reminder: Dear ${clientName || 'Client'}, ${message}`;
          await sendSms(clientPhone, smsMessage);
          smsStatus = 'SMS Sent';
        } catch (e) {
          smsStatus = 'SMS Failed (No Credits/Invalid)';
          console.warn('SMS delivery failed, but proceeding', e.message);
        }
      } else {
        smsStatus = 'No Phone';
      }
    }
    
    // Log the reminder to MongoDB
    try {
      let finalStatus = sendMethod.toUpperCase();
      if (smsStatus.includes('Failed')) finalStatus += ' (SMS Failed)';
      
      const newReminder = new Reminder({
        userId: req.user.id,
        clientName: clientName,
        clientEmail: clientEmail || '',
        clientPhone: clientPhone || '',
        deadlineType: deadlineType || '',
        message: message,
        status: finalStatus
      });
      await newReminder.save();
    } catch (e) {
      console.warn("Failed to log to MongoDB", e);
    }

    res.json({ message: smsStatus.includes('Failed') ? 'Email sent, but SMS failed (ensure valid number/credits)' : 'Reminder sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Failed to send reminder' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
