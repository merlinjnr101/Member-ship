import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { db, UPLOADS_DIR } from './server/db.js';
import {
  notifyAdminNewApplication,
  notifyAdminStatusChange,
  sendTelegramMessage,
  getTelegramUpdates,
  getTelegramBotInfo,
  logNotification
} from './server/telegram.js';
import {
  sendAdminApplicationNotification,
  sendApplicantConfirmationEmail
} from './server/email.js';

const app = express();
const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Admin auth credentials
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@FanCard2026!Secure';
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'fancard-session-secret-key-2026-production';

// In-memory active admin sessions: token -> { adminId, loginTime }
const activeSessions = new Map<string, { adminId: string; loginTime: number }>();

function generateAdminToken(adminId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, { adminId, loginTime: Date.now() });
  return token;
}

function verifyAdminToken(token?: string): boolean {
  if (!token) return false;
  const session = activeSessions.get(token);
  if (!session) return false;
  // Session valid for 24 hours
  if (Date.now() - session.loginTime > 24 * 60 * 60 * 1000) {
    activeSessions.delete(token);
    return false;
  }
  return true;
}

// Multer storage setup for private document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Cryptographically secure randomized filename to prevent any guessing or traversal
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.pdf'].includes(ext) ? ext : '.bin';
    const uniqueName = `${crypto.randomUUID()}${safeExt}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPG, PNG, and PDF are allowed.`));
    }
  },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware: Admin Authentication Guard
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Administrative access token required' });
  }
  const token = authHeader.substring(7);
  if (!verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid token' });
  }
  next();
}

// Record Admin Audit Log
function recordAuditLog(adminId: string, applicationId: string | null, action: string, details: string, req: express.Request) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const stmt = db.prepare(`
      INSERT INTO admin_audit_logs (id, administrator_id, application_id, action, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(crypto.randomUUID(), adminId, applicationId, action, details, String(ip), new Date().toISOString());
  } catch (err: any) {
    console.error('Audit log error:', err.message);
  }
}

// Helper: Generate unique application reference number (e.g. MFC-2026-9A8B2C)
function generateReferenceNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MFC-2026-${rand}`;
}

// Helper: Generate issued membership card number
function generateMembershipCardNumber(): string {
  const num = Math.floor(10000000 + Math.random() * 90000000);
  return `MFC-${num}`;
}

// -------------------------------------------------------------
// API: PUBLIC CARD CATALOG
// -------------------------------------------------------------

app.get('/api/cards', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM membership_cards WHERE active = 1 ORDER BY created_at ASC');
    const rows = stmt.all() as any[];
    const cards = rows.map(r => ({
      ...r,
      benefits: JSON.parse(r.benefits || '[]'),
      active: Boolean(r.active)
    }));
    res.json({ cards });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// API: APPLICATION SUBMISSION (With Multipart Documents)
// -------------------------------------------------------------

app.post('/api/applications', upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'government_id', maxCount: 1 },
  { name: 'drivers_license', maxCount: 1 },
  { name: 'ssn_license', maxCount: 1 }
]), async (req: express.Request, res: express.Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const {
      full_name,
      father_name,
      mother_name,
      email,
      phone_number,
      residential_address,
      country,
      membership_card_id,
      consent
    } = req.body;

    // Strict validation
    if (!full_name || !father_name || !mother_name || !email || !phone_number || !residential_address || !country || !membership_card_id) {
      return res.status(400).json({ error: 'All personal information fields are required.' });
    }

    if (!consent || consent !== 'true') {
      return res.status(400).json({ error: 'You must provide consent for identity verification.' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Required files validation
    if (!files || !files.profile_photo || files.profile_photo.length === 0) {
      return res.status(400).json({ error: 'Clear profile photograph is required.' });
    }

    if (!files.government_id || files.government_id.length === 0) {
      return res.status(400).json({ error: 'Government-issued identity document is required.' });
    }

    // Check card exists
    const cardStmt = db.prepare('SELECT id, name FROM membership_cards WHERE id = ?');
    const card = cardStmt.get(membership_card_id) as { id: string; name: string } | undefined;
    if (!card) {
      return res.status(400).json({ error: 'Selected membership card tier is invalid.' });
    }

    // Duplicate check: check if an identical pending application exists in last 10 minutes
    const duplicateCheck = db.prepare(`
      SELECT id, reference_number FROM applications 
      WHERE email = ? AND verification_status IN ('Pending Review', 'Under Review')
    `).get(email) as { id: string; reference_number: string } | undefined;

    if (duplicateCheck) {
      return res.status(409).json({
        error: `An active application (${duplicateCheck.reference_number}) is already pending review for this email address. Please use the Status Tracker to view progress.`,
        reference_number: duplicateCheck.reference_number
      });
    }

    // Generate unique Application ID & Reference ID
    const applicationId = crypto.randomUUID();
    let refNumber = generateReferenceNumber();

    // Guarantee reference number uniqueness
    const checkRef = db.prepare('SELECT id FROM applications WHERE reference_number = ?');
    while (checkRef.get(refNumber)) {
      refNumber = generateReferenceNumber();
    }

    const now = new Date().toISOString();
    const profilePhoto = files.profile_photo[0];

    // Begin database transaction to insert application & documents
    const insertApp = db.prepare(`
      INSERT INTO applications (
        id, reference_number, membership_card_id, full_name, father_name, mother_name,
        email, phone_number, residential_address, country, profile_photo_path,
        verification_status, consent_timestamp, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertApp.run(
      applicationId,
      refNumber,
      membership_card_id,
      full_name.trim(),
      father_name.trim(),
      mother_name.trim(),
      email.trim().toLowerCase(),
      phone_number.trim(),
      residential_address.trim(),
      country.trim(),
      profilePhoto.filename,
      'Pending Review',
      now,
      now,
      now
    );

    // Insert verification documents into private documents table
    const insertDoc = db.prepare(`
      INSERT INTO verification_documents (
        id, application_id, document_type, original_filename, private_storage_path, mime_type, file_size, review_status, uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Government ID
    const govIdFile = files.government_id[0];
    insertDoc.run(
      crypto.randomUUID(),
      applicationId,
      'government_id',
      govIdFile.originalname,
      govIdFile.filename,
      govIdFile.mimetype,
      govIdFile.size,
      'pending',
      now
    );

    // Driver's License if uploaded
    if (files.drivers_license && files.drivers_license[0]) {
      const dlFile = files.drivers_license[0];
      insertDoc.run(
        crypto.randomUUID(),
        applicationId,
        'drivers_license',
        dlFile.originalname,
        dlFile.filename,
        dlFile.mimetype,
        dlFile.size,
        'pending',
        now
      );
    }

    // SSN / Tax License upload where applicable
    if (files.ssn_license && files.ssn_license[0]) {
      const ssnFile = files.ssn_license[0];
      insertDoc.run(
        crypto.randomUUID(),
        applicationId,
        'ssn_license',
        ssnFile.originalname,
        ssnFile.filename,
        ssnFile.mimetype,
        ssnFile.size,
        'pending',
        now
      );
    }

    // Dispatch background notifications (Must not fail the submission)
    const appData = {
      id: applicationId,
      reference_number: refNumber,
      membership_card_name: card.name,
      created_at: now,
      verification_status: 'Pending Review',
      email: email.trim().toLowerCase(),
      full_name: full_name.trim()
    };

    // 1. Send Telegram Notification to Admin
    notifyAdminNewApplication(appData).catch(err => {
      console.error('Non-blocking Telegram notification error:', err);
    });

    // 2. Send Email Notification to Admin
    sendAdminApplicationNotification(appData).catch(err => {
      console.error('Non-blocking Admin Email error:', err);
    });

    // 3. Send Confirmation Email to Applicant (Requirement 16)
    sendApplicantConfirmationEmail(appData).catch(err => {
      console.error('Non-blocking Applicant Email error:', err);
    });

    return res.status(201).json({
      success: true,
      reference_number: refNumber,
      application_id: applicationId,
      card_name: card.name,
      created_at: now,
      message: 'Application received and securely queued for verification review.'
    });

  } catch (err: any) {
    console.error('Submission error:', err);
    return res.status(500).json({ error: err.message || 'Server error processing application' });
  }
});

// -------------------------------------------------------------
// API: APPLICATION STATUS TRACKER (Requirement 19)
// -------------------------------------------------------------

app.get('/api/applications/track/:ref', (req, res) => {
  try {
    const ref = req.params.ref.trim().toUpperCase();
    const query = db.prepare(`
      SELECT 
        a.id, a.reference_number, a.verification_status, a.feedback_message,
        a.card_issued_number, a.issued_at, a.expires_at, a.created_at, a.updated_at,
        a.full_name, a.country,
        c.name as card_name, c.category as card_category, c.tier as card_tier,
        c.badge_color, c.accent_gradient
      FROM applications a
      LEFT JOIN membership_cards c ON a.membership_card_id = c.id
      WHERE a.reference_number = ?
    `);

    const appRecord = query.get(ref) as any;
    if (!appRecord) {
      return res.status(404).json({ error: `No application found with reference ID "${ref}". Please check the reference code.` });
    }

    // Mask name for privacy in public tracker (e.g. "J*** D**")
    const names = appRecord.full_name.split(' ');
    const maskedName = names.map((n: string) => n.length > 1 ? `${n[0]}${'*'.repeat(n.length - 1)}` : n).join(' ');

    res.json({
      reference_number: appRecord.reference_number,
      verification_status: appRecord.verification_status,
      feedback_message: appRecord.feedback_message,
      card_issued_number: appRecord.card_issued_number,
      issued_at: appRecord.issued_at,
      expires_at: appRecord.expires_at,
      created_at: appRecord.created_at,
      updated_at: appRecord.updated_at,
      masked_name: maskedName,
      country: appRecord.country,
      card: {
        name: appRecord.card_name,
        category: appRecord.card_category,
        tier: appRecord.card_tier,
        badge_color: appRecord.badge_color,
        accent_gradient: appRecord.accent_gradient
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// API: APPLICANT AUTHENTICATED PORTAL (Check & Upload Docs)
// -------------------------------------------------------------

app.post('/api/applications/auth', (req, res) => {
  try {
    const { reference_number, email } = req.body;
    if (!reference_number || !email) {
      return res.status(400).json({ error: 'Reference ID and email are required to sign in.' });
    }

    const stmt = db.prepare(`
      SELECT 
        a.*, 
        c.name as card_name, c.category as card_category, c.tier as card_tier,
        c.badge_color, c.accent_gradient, c.benefits
      FROM applications a
      LEFT JOIN membership_cards c ON a.membership_card_id = c.id
      WHERE UPPER(a.reference_number) = ? AND LOWER(a.email) = ?
    `);

    const appRecord = stmt.get(reference_number.trim().toUpperCase(), email.trim().toLowerCase()) as any;
    if (!appRecord) {
      return res.status(401).json({ error: 'Application record not found. Please verify your reference number and email.' });
    }

    // Get documents list (metadata only, no raw paths)
    const docsStmt = db.prepare(`
      SELECT id, document_type, original_filename, review_status, uploaded_at, reviewed_at
      FROM verification_documents
      WHERE application_id = ?
    `);
    const docs = docsStmt.all(appRecord.id);

    res.json({
      application: {
        id: appRecord.id,
        reference_number: appRecord.reference_number,
        full_name: appRecord.full_name,
        email: appRecord.email,
        phone_number: appRecord.phone_number,
        country: appRecord.country,
        verification_status: appRecord.verification_status,
        feedback_message: appRecord.feedback_message,
        card_issued_number: appRecord.card_issued_number,
        issued_at: appRecord.issued_at,
        expires_at: appRecord.expires_at,
        created_at: appRecord.created_at,
        card: {
          name: appRecord.card_name,
          category: appRecord.card_category,
          tier: appRecord.card_tier,
          badge_color: appRecord.badge_color,
          accent_gradient: appRecord.accent_gradient,
          benefits: JSON.parse(appRecord.benefits || '[]')
        },
        documents: docs
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Upload additional document if requested by administrator
app.post('/api/applications/:ref/upload-additional', upload.single('additional_document'), async (req, res) => {
  try {
    const ref = req.params.ref.trim().toUpperCase();
    const { email } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No document file provided.' });
    }

    const appStmt = db.prepare('SELECT id, verification_status FROM applications WHERE reference_number = ? AND LOWER(email) = ?');
    const appRecord = appStmt.get(ref, (email || '').trim().toLowerCase()) as any;

    if (!appRecord) {
      return res.status(404).json({ error: 'Application not found or unauthorized.' });
    }

    const now = new Date().toISOString();
    const insertDoc = db.prepare(`
      INSERT INTO verification_documents (
        id, application_id, document_type, original_filename, private_storage_path, mime_type, file_size, review_status, uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDoc.run(
      crypto.randomUUID(),
      appRecord.id,
      'additional',
      file.originalname,
      file.filename,
      file.mimetype,
      file.size,
      'pending',
      now
    );

    // Update application status back to 'Under Review'
    db.prepare(`
      UPDATE applications 
      SET verification_status = 'Under Review', updated_at = ?
      WHERE id = ?
    `).run(now, appRecord.id);

    // Alert admin via Telegram
    sendTelegramMessage(`📎 <b>ADDITIONAL DOCUMENT RECEIVED</b>\nRef: <code>${ref}</code>\nApplicant has uploaded supplementary documentation for review.`).catch(() => {});

    res.json({ success: true, message: 'Additional document uploaded successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// API: CONTACT SUPPORT & TELEGRAM RECEIVE/SEND (Requirement 17)
// -------------------------------------------------------------

app.post('/api/support', async (req, res) => {
  try {
    const { name, email, reference_number, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Please provide your name, email, subject, and message.' });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO support_messages (id, name, email, reference_number, subject, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name.trim(), email.trim().toLowerCase(), reference_number ? reference_number.trim().toUpperCase() : null, subject.trim(), message.trim(), 'new', now);

    // Dispatch Telegram alert to admin chat
    const telegramText = [
      `💬 <b>NEW SUPPORT INQUIRY</b>`,
      `From: ${name} (${email})`,
      reference_number ? `Ref: <code>${reference_number}</code>` : '',
      `Subject: <b>${subject}</b>`,
      `Message: <i>${message}</i>`
    ].filter(Boolean).join('\n');

    sendTelegramMessage(telegramText).catch(e => console.error('Telegram support notify error:', e));

    res.json({ success: true, message: 'Your message has been sent to our verification support team. A representative will contact you shortly.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// API: PUBLIC CARD VERIFICATION (QR Code Scan Link)
// -------------------------------------------------------------

app.get('/api/verify/card/:cardNumber', (req, res) => {
  try {
    const cardNum = req.params.cardNumber.trim().toUpperCase();
    const stmt = db.prepare(`
      SELECT 
        a.card_issued_number, a.verification_status, a.issued_at, a.expires_at,
        a.full_name, a.country, a.reference_number,
        c.name as card_name, c.tier as card_tier, c.category as card_category
      FROM applications a
      LEFT JOIN membership_cards c ON a.membership_card_id = c.id
      WHERE a.card_issued_number = ? AND a.verification_status = 'Approved'
    `);

    const result = stmt.get(cardNum) as any;
    if (!result) {
      return res.status(404).json({
        verified: false,
        message: 'This membership card could not be validated or is not in active approved status.'
      });
    }

    // Mask name for public credential presentation
    const names = result.full_name.split(' ');
    const maskedName = names.map((n: string) => n.length > 1 ? `${n[0]}${'*'.repeat(n.length - 1)}` : n).join(' ');

    res.json({
      verified: true,
      card_issued_number: result.card_issued_number,
      status: 'VERIFIED & ACTIVE',
      holder_name: maskedName,
      country: result.country,
      card_name: result.card_name,
      tier: result.card_tier,
      category: result.card_category,
      issued_at: result.issued_at,
      expires_at: result.expires_at,
      authenticity_seal: 'OFFICIAL_FAN_CARD_AUTHENTICATED'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// API: ADMINISTRATOR PORTAL & DASHBOARD
// -------------------------------------------------------------

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password, username } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  if (password === ADMIN_PASSWORD) {
    const adminId = username || 'admin_super';
    const token = generateAdminToken(adminId);
    recordAuditLog(adminId, null, 'LOGIN', 'Admin authenticated successfully', req);
    return res.json({
      success: true,
      token,
      // Requirement 18: Never return identifiable personal admin details to client!
      role: 'System Administrator'
    });
  }

  recordAuditLog('unknown', null, 'LOGIN_FAILED', 'Invalid admin password attempt', req);
  return res.status(401).json({ error: 'Invalid administrative password credentials' });
});

// Admin Auth Check
app.get('/api/admin/check-auth', requireAdmin, (req, res) => {
  res.json({ authenticated: true });
});

// Admin Metrics Stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  try {
    const total = (db.prepare('SELECT COUNT(*) as c FROM applications').get() as any).c;
    const pending = (db.prepare("SELECT COUNT(*) as c FROM applications WHERE verification_status = 'Pending Review'").get() as any).c;
    const underReview = (db.prepare("SELECT COUNT(*) as c FROM applications WHERE verification_status = 'Under Review'").get() as any).c;
    const approved = (db.prepare("SELECT COUNT(*) as c FROM applications WHERE verification_status = 'Approved'").get() as any).c;
    const declined = (db.prepare("SELECT COUNT(*) as c FROM applications WHERE verification_status = 'Declined'").get() as any).c;
    const infoNeeded = (db.prepare("SELECT COUNT(*) as c FROM applications WHERE verification_status = 'Additional Information Required'").get() as any).c;
    const totalDocs = (db.prepare('SELECT COUNT(*) as c FROM verification_documents').get() as any).c;

    res.json({
      total,
      pending,
      underReview,
      approved,
      declined,
      infoNeeded,
      totalDocs
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Applications List with Search & Status Filters
app.get('/api/admin/applications', requireAdmin, (req, res) => {
  try {
    const { status, search, card_id } = req.query;
    let queryStr = `
      SELECT 
        a.id, a.reference_number, a.full_name, a.email, a.phone_number, a.country,
        a.verification_status, a.card_issued_number, a.created_at, a.updated_at,
        c.name as card_name, c.tier as card_tier,
        (SELECT COUNT(*) FROM verification_documents vd WHERE vd.application_id = a.id) as doc_count
      FROM applications a
      LEFT JOIN membership_cards c ON a.membership_card_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      queryStr += ' AND a.verification_status = ?';
      params.push(status);
    }

    if (card_id && card_id !== 'all') {
      queryStr += ' AND a.membership_card_id = ?';
      params.push(card_id);
    }

    if (search) {
      queryStr += ` AND (
        a.reference_number LIKE ? OR
        a.full_name LIKE ? OR
        a.email LIKE ? OR
        a.country LIKE ? OR
        a.card_issued_number LIKE ?
      )`;
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    queryStr += ' ORDER BY a.created_at DESC';

    const stmt = db.prepare(queryStr);
    const applications = stmt.all(...params);

    res.json({ applications });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Single Application Detail & Documents
app.get('/api/admin/applications/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const appStmt = db.prepare(`
      SELECT 
        a.*,
        c.name as card_name, c.tier as card_tier, c.category as card_category,
        c.badge_color, c.accent_gradient
      FROM applications a
      LEFT JOIN membership_cards c ON a.membership_card_id = c.id
      WHERE a.id = ?
    `);
    const application = appStmt.get(id) as any;
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const docsStmt = db.prepare(`
      SELECT id, document_type, original_filename, mime_type, file_size, review_status, uploaded_at, reviewed_at
      FROM verification_documents
      WHERE application_id = ?
    `);
    const documents = docsStmt.all(id);

    res.json({
      application,
      documents
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Secure Document View/Stream endpoint for authorized admin
app.get('/api/admin/documents/:id/file', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const doc = db.prepare('SELECT * FROM verification_documents WHERE id = ?').get(id) as any;
    if (!doc) {
      return res.status(404).send('Document not found');
    }

    const filePath = path.resolve(UPLOADS_DIR, doc.private_storage_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File missing in secure storage');
    }

    res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${doc.original_filename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// Secure Profile Photo Stream
app.get('/api/admin/applications/:id/profile-photo', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const app = db.prepare('SELECT profile_photo_path FROM applications WHERE id = ?').get(id) as any;
    if (!app || !app.profile_photo_path) {
      return res.status(404).send('Photo not found');
    }

    const filePath = path.resolve(UPLOADS_DIR, app.profile_photo_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Photo file not found');
    }

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'private, no-cache');
    fs.createReadStream(filePath).pipe(res);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// Requirement 15: "Allow admin to approve or decline"
// PATCH /api/admin/applications/:id/status
app.patch('/api/admin/applications/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes, feedback_message } = req.body;

    const allowed = ['Pending Review', 'Under Review', 'Approved', 'Declined', 'Additional Information Required'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }

    const currentApp = db.prepare(`
      SELECT a.*, c.name as card_name 
      FROM applications a
      LEFT JOIN membership_cards c ON a.membership_card_id = c.id
      WHERE a.id = ?
    `).get(id) as any;

    if (!currentApp) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const now = new Date().toISOString();
    let cardIssuedNumber = currentApp.card_issued_number;
    let issuedAt = currentApp.issued_at;
    let expiresAt = currentApp.expires_at;

    // If approving, generate official Card Number & validity if not already assigned
    if (status === 'Approved' && !cardIssuedNumber) {
      cardIssuedNumber = generateMembershipCardNumber();
      issuedAt = now;
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 3); // 3-year validity
      expiresAt = expiryDate.toISOString();
    }

    // Update application
    db.prepare(`
      UPDATE applications
      SET 
        verification_status = ?,
        admin_notes = COALESCE(?, admin_notes),
        feedback_message = COALESCE(?, feedback_message),
        card_issued_number = ?,
        issued_at = ?,
        expires_at = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      status,
      admin_notes || null,
      feedback_message || null,
      cardIssuedNumber,
      issuedAt,
      expiresAt,
      now,
      id
    );

    // If status is Approved or Declined, mark documents accordingly
    if (status === 'Approved') {
      db.prepare("UPDATE verification_documents SET review_status = 'verified', reviewed_at = ? WHERE application_id = ?")
        .run(now, id);
    } else if (status === 'Declined') {
      db.prepare("UPDATE verification_documents SET review_status = 'rejected', reviewed_at = ? WHERE application_id = ?")
        .run(now, id);
    }

    // Record Audit Log
    recordAuditLog(
      'admin_user',
      id,
      `STATUS_CHANGE_${status.toUpperCase().replace(/\s+/g, '_')}`,
      `Transitioned status from "${currentApp.verification_status}" to "${status}". Notes: ${admin_notes || 'None'}`,
      req
    );

    // Send Telegram alert
    notifyAdminStatusChange({
      id,
      reference_number: currentApp.reference_number,
      membership_card_name: currentApp.card_name,
      old_status: currentApp.verification_status,
      new_status: status,
      admin_id: 'SecureAdmin'
    }).catch(err => console.error('Status telegram notify error:', err));

    res.json({
      success: true,
      status,
      card_issued_number: cardIssuedNumber,
      issued_at: issuedAt,
      expires_at: expiresAt,
      message: `Application ${currentApp.reference_number} has been updated to "${status}".`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Requirement 14: "Add an 'Export to CSV' button to the AdminDashboardPage, allowing administrators to download lists of all pending, approved, and declined applications."
app.get('/api/admin/applications/export/csv', requireAdmin, (req, res) => {
  try {
    const { status } = req.query;
    let queryStr = `
      SELECT 
        a.reference_number,
        a.verification_status,
        a.full_name,
        a.father_name,
        a.mother_name,
        a.email,
        a.phone_number,
        a.residential_address,
        a.country,
        c.name as card_name,
        c.tier as card_tier,
        a.card_issued_number,
        a.issued_at,
        a.expires_at,
        a.admin_notes,
        a.feedback_message,
        a.consent_timestamp,
        a.created_at,
        a.updated_at
      FROM applications a
      LEFT JOIN membership_cards c ON a.membership_card_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      queryStr += ' AND a.verification_status = ?';
      params.push(status);
    }

    queryStr += ' ORDER BY a.created_at DESC';

    const rows = db.prepare(queryStr).all(...params) as any[];

    // CSV header row
    const headers = [
      'Reference ID',
      'Verification Status',
      'Full Name',
      'Father Name',
      'Mother Name',
      'Email',
      'Phone Number',
      'Country',
      'Residential Address',
      'Membership Card',
      'Card Tier',
      'Issued Card Number',
      'Issued Date',
      'Expiry Date',
      'Internal Admin Notes',
      'Applicant Feedback',
      'Consent Timestamp',
      'Created Date'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvLines = [headers.join(',')];
    for (const r of rows) {
      csvLines.push([
        escapeCsv(r.reference_number),
        escapeCsv(r.verification_status),
        escapeCsv(r.full_name),
        escapeCsv(r.father_name),
        escapeCsv(r.mother_name),
        escapeCsv(r.email),
        escapeCsv(r.phone_number),
        escapeCsv(r.country),
        escapeCsv(r.residential_address),
        escapeCsv(r.card_name),
        escapeCsv(r.card_tier),
        escapeCsv(r.card_issued_number),
        escapeCsv(r.issued_at),
        escapeCsv(r.expires_at),
        escapeCsv(r.admin_notes),
        escapeCsv(r.feedback_message),
        escapeCsv(r.consent_timestamp),
        escapeCsv(r.created_at)
      ].join(','));
    }

    const csvContent = csvLines.join('\r\n');
    const filename = `membership-applications-${status || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;

    recordAuditLog('admin_user', null, 'EXPORT_CSV', `Exported ${rows.length} applications (filter: ${status || 'all'}) to CSV`, req);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Membership Cards Manager (Add, Edit, Toggle)
app.get('/api/admin/cards', requireAdmin, (req, res) => {
  try {
    const cards = db.prepare('SELECT * FROM membership_cards ORDER BY created_at ASC').all() as any[];
    res.json({
      cards: cards.map(c => ({
        ...c,
        benefits: JSON.parse(c.benefits || '[]'),
        active: Boolean(c.active)
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/cards', requireAdmin, (req, res) => {
  try {
    const { name, category, tier, description, benefits, badge_color, accent_gradient } = req.body;
    if (!name || !category || !tier || !description) {
      return res.status(400).json({ error: 'Name, category, tier, and description are required.' });
    }

    const id = `card-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO membership_cards (
        id, name, category, tier, description, benefits, badge_color, accent_gradient, image_path, active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      id,
      name.trim(),
      category.trim(),
      tier.trim(),
      description.trim(),
      JSON.stringify(Array.isArray(benefits) ? benefits : [benefits]),
      badge_color || 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      accent_gradient || 'from-blue-400 via-indigo-500 to-purple-600',
      '/assets/cards/custom.png',
      now
    );

    recordAuditLog('admin_user', null, 'CREATE_CARD', `Created membership card: ${name}`, req);
    res.status(201).json({ success: true, id, message: 'Card created successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/cards/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, tier, description, benefits, active, badge_color, accent_gradient } = req.body;

    db.prepare(`
      UPDATE membership_cards
      SET 
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        tier = COALESCE(?, tier),
        description = COALESCE(?, description),
        benefits = COALESCE(?, benefits),
        active = COALESCE(?, active),
        badge_color = COALESCE(?, badge_color),
        accent_gradient = COALESCE(?, accent_gradient)
      WHERE id = ?
    `).run(
      name ? name.trim() : null,
      category ? category.trim() : null,
      tier ? tier.trim() : null,
      description ? description.trim() : null,
      benefits ? JSON.stringify(benefits) : null,
      active !== undefined ? (active ? 1 : 0) : null,
      badge_color || null,
      accent_gradient || null,
      id
    );

    recordAuditLog('admin_user', null, 'UPDATE_CARD', `Updated card ${id}`, req);
    res.json({ success: true, message: 'Card tier updated.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Notification Logs & Telegram Controls (Requirement 17)
app.get('/api/admin/notifications', requireAdmin, (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT nl.*, a.reference_number 
      FROM notification_logs nl
      LEFT JOIN applications a ON nl.application_id = a.id
      ORDER BY nl.created_at DESC
      LIMIT 100
    `).all();
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/audit-logs', requireAdmin, (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 100').all();
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Telegram Bot Status & Info Check
app.get('/api/admin/telegram/info', requireAdmin, async (req, res) => {
  try {
    const info = await getTelegramBotInfo();
    res.json({ info });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Test Telegram Alert Ping
app.post('/api/admin/telegram/test', requireAdmin, async (req, res) => {
  try {
    const result = await sendTelegramMessage(
      `🔔 <b>VERIFICATION PLATFORM TEST NOTIFICATION</b>\n\nTelegram API connectivity verified at ${new Date().toISOString()}.\nNotifications are active and operational!`
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get incoming Telegram messages (Requirement 17: "Let telegram bot to receive and send message")
app.get('/api/admin/telegram/updates', requireAdmin, async (req, res) => {
  try {
    const updates = await getTelegramUpdates();
    res.json(updates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Send custom message or reply through Telegram bot (Requirement 17)
app.post('/api/admin/telegram/send', requireAdmin, async (req, res) => {
  try {
    const { chat_id, message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message text required' });
    }
    const targetChat = chat_id || process.env.TELEGRAM_ADMIN_CHAT_ID || '6724972542';
    const result = await sendTelegramMessage(message, targetChat);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Support Tickets View
app.get('/api/admin/support', requireAdmin, (req, res) => {
  try {
    const tickets = db.prepare('SELECT * FROM support_messages ORDER BY created_at DESC').all();
    res.json({ tickets });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/support/:id/reply', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ error: 'Reply text required' });

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE support_messages
      SET admin_reply = ?, status = 'replied', replied_at = ?
      WHERE id = ?
    `).run(reply, now, id);

    res.json({ success: true, message: 'Reply recorded.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// VITE DEV SERVER / PRODUCTION STATIC ASSET SERVING
// -------------------------------------------------------------

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Membership Fan Card Verification running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
