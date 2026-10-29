export interface MembershipCard {
  id: string;
  name: string;
  category: string;
  tier: string;
  description: string;
  benefits: string[];
  badge_color: string;
  accent_gradient: string;
  image_path?: string;
  active: boolean;
  created_at: string;
}

export interface VerificationDocument {
  id: string;
  application_id: string;
  document_type: 'government_id' | 'drivers_license' | 'ssn_license' | 'proof_of_residence' | 'additional';
  original_filename: string;
  mime_type: string;
  file_size: number;
  review_status: 'pending' | 'verified' | 'rejected';
  uploaded_at: string;
  reviewed_at?: string;
}

export type ApplicationStatus =
  | 'Pending Review'
  | 'Under Review'
  | 'Approved'
  | 'Declined'
  | 'Additional Information Required';

export interface Application {
  id: string;
  reference_number: string;
  membership_card_id: string;
  card_name?: string;
  card_tier?: string;
  card_category?: string;
  badge_color?: string;
  accent_gradient?: string;
  full_name: string;
  father_name?: string;
  mother_name?: string;
  email: string;
  phone_number: string;
  residential_address: string;
  country: string;
  profile_photo_path?: string;
  verification_status: ApplicationStatus;
  admin_notes?: string;
  feedback_message?: string;
  card_issued_number?: string;
  issued_at?: string;
  expires_at?: string;
  consent_timestamp: string;
  created_at: string;
  updated_at: string;
  doc_count?: number;
  documents?: VerificationDocument[];
}

export interface NotificationLog {
  id: string;
  application_id?: string;
  reference_number?: string;
  channel: 'telegram' | 'email_admin' | 'email_applicant';
  recipient: string;
  delivery_status: 'sent' | 'failed' | 'retrying';
  error_code?: string;
  details: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  administrator_id: string;
  application_id?: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  reference_number?: string;
  subject: string;
  message: string;
  status: 'new' | 'replied';
  admin_reply?: string;
  created_at: string;
  replied_at?: string;
}
