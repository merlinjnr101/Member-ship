import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DB_PATH = path.resolve(DATA_DIR, 'verification.db');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true, mode: 0o700 });
}

export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high performance concurrency
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  -- Membership Cards Table
  CREATE TABLE IF NOT EXISTS membership_cards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    tier TEXT NOT NULL,
    description TEXT NOT NULL,
    benefits TEXT NOT NULL, -- JSON string array
    badge_color TEXT NOT NULL,
    accent_gradient TEXT NOT NULL,
    image_path TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  -- Applications Table
  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    reference_number TEXT UNIQUE NOT NULL,
    user_id TEXT,
    membership_card_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    mother_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    residential_address TEXT NOT NULL,
    country TEXT NOT NULL,
    profile_photo_path TEXT,
    verification_status TEXT NOT NULL DEFAULT 'Pending Review',
    admin_notes TEXT,
    feedback_message TEXT,
    card_issued_number TEXT,
    issued_at TEXT,
    expires_at TEXT,
    consent_timestamp TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (membership_card_id) REFERENCES membership_cards(id) ON DELETE RESTRICT
  );

  -- Verification Documents Table
  CREATE TABLE IF NOT EXISTS verification_documents (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    document_type TEXT NOT NULL, -- government_id, drivers_license, ssn_license, proof_of_residence, additional
    original_filename TEXT NOT NULL,
    private_storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    review_status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, rejected
    uploaded_at TEXT NOT NULL,
    reviewed_at TEXT,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
  );

  -- Admin Audit Logs Table
  CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id TEXT PRIMARY KEY,
    administrator_id TEXT NOT NULL,
    application_id TEXT,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TEXT NOT NULL
  );

  -- Notification Logs Table
  CREATE TABLE IF NOT EXISTS notification_logs (
    id TEXT PRIMARY KEY,
    application_id TEXT,
    channel TEXT NOT NULL, -- telegram, email_admin, email_applicant
    recipient TEXT NOT NULL,
    delivery_status TEXT NOT NULL, -- sent, failed, retrying
    error_code TEXT,
    details TEXT,
    created_at TEXT NOT NULL
  );

  -- Support Inquiries Table
  CREATE TABLE IF NOT EXISTS support_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    reference_number TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new', -- new, replied
    telegram_message_id TEXT,
    admin_reply TEXT,
    created_at TEXT NOT NULL,
    replied_at TEXT
  );

  -- Indices for speed
  CREATE INDEX IF NOT EXISTS idx_apps_ref ON applications(reference_number);
  CREATE INDEX IF NOT EXISTS idx_apps_email ON applications(email);
  CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(verification_status);
  CREATE INDEX IF NOT EXISTS idx_docs_app ON verification_documents(application_id);
`);

// Seed default membership cards if table is empty
const countQuery = db.prepare('SELECT COUNT(*) as count FROM membership_cards');
const result = countQuery.get() as { count: number };

if (result.count === 0) {
  const insertCard = db.prepare(`
    INSERT INTO membership_cards (
      id, name, category, tier, description, benefits, badge_color, accent_gradient, image_path, active, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialCards = [
    {
      id: 'card-plat-vip',
      name: 'Platinum VIP Fan Pass',
      category: 'VIP Fan Pass',
      tier: 'Platinum',
      description: 'Exclusive premier fan tier granting verified identity accreditation, priority private venue entry, and VIP meet-and-greet access privilege.',
      benefits: JSON.stringify([
        'Cryptographically Signed Verified Digital Pass',
        'Priority Access & Fast-track Security Clearance',
        'Official Fan Authentication Holographic Seal',
        'Eligibility for Backstage & Meet & Greet Events',
        'Exclusive Direct Member Portal & Broadcasts'
      ]),
      badge_color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      accent_gradient: 'from-slate-200 via-sky-300 to-indigo-300',
      image_path: '/assets/cards/platinum.png',
      active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'card-black-obsidian',
      name: 'Black Obsidian Elite Card',
      category: 'Elite Collector',
      tier: 'Obsidian',
      description: 'The pinnacle of fan recognition. Deep obsidian gold-embossed digital card with all-access credentials and lifetime fan registry number.',
      benefits: JSON.stringify([
        'Unique Lifetime Fan Registry ID & QR Verification',
        'VIP Lounge & Official Fan Gala Invitations',
        'First Access to Limited Edition Signed Collectibles',
        'Global Concierge Support & Rapid Accreditation',
        'NFC & Apple/Google Wallet Compatibility'
      ]),
      badge_color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      accent_gradient: 'from-amber-200 via-yellow-400 to-amber-600',
      image_path: '/assets/cards/obsidian.png',
      active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'card-gold-legend',
      name: 'Gold Legend Fan Pass',
      category: 'Gold Standard',
      tier: 'Gold',
      description: 'High-tier authenticated membership featuring verified personal credentials, early ticketing access, and official member recognition.',
      benefits: JSON.stringify([
        'Authenticated Member Identity Profile',
        'Early Bird Ticket Window & Presale Code Delivery',
        'Official Digital Membership Certificate',
        'Dedicated Priority Verification Processing',
        'Community Forum Elite Badge'
      ]),
      badge_color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      accent_gradient: 'from-yellow-300 via-amber-400 to-orange-400',
      image_path: '/assets/cards/gold.png',
      active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'card-silver-standard',
      name: 'Titanium Silver Fan Card',
      category: 'Official Member',
      tier: 'Silver',
      description: 'Standard verified fan identity card providing authentic verification status, digital credential pass, and official newsletters.',
      benefits: JSON.stringify([
        'Official Fan Verification Status',
        'Digital Fan ID Card with Security QR Code',
        'Fan Club Official Newsletter & Updates',
        'Standard 48-hour Verification Review Window',
        'Member Protection & Anti-Fraud Registration'
      ]),
      badge_color: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
      accent_gradient: 'from-slate-300 via-slate-400 to-zinc-500',
      image_path: '/assets/cards/silver.png',
      active: 1,
      created_at: new Date().toISOString()
    }
  ];

  for (const card of initialCards) {
    insertCard.run(
      card.id,
      card.name,
      card.category,
      card.tier,
      card.description,
      card.benefits,
      card.badge_color,
      card.accent_gradient,
      card.image_path,
      card.active,
      card.created_at
    );
  }
}

export { UPLOADS_DIR, DATA_DIR };
