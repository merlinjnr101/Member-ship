import { db } from './db.js';
import crypto from 'crypto';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8935000457:AAEFzCglE6oLz2ehGOPQi0mv5ySBMc_2yv4';
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '6724972542';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export interface TelegramSendResult {
  success: boolean;
  messageId?: number;
  error?: string;
}

/**
 * Log notification attempt in database
 */
export function logNotification(
  applicationId: string | null,
  channel: 'telegram' | 'email_admin' | 'email_applicant',
  recipient: string,
  deliveryStatus: 'sent' | 'failed' | 'retrying',
  details: string,
  errorCode?: string
) {
  try {
    const stmt = db.prepare(`
      INSERT INTO notification_logs (
        id, application_id, channel, recipient, delivery_status, error_code, details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      crypto.randomUUID(),
      applicationId,
      channel,
      recipient,
      deliveryStatus,
      errorCode || null,
      details,
      new Date().toISOString()
    );
  } catch (err: any) {
    console.error('Failed to write notification log:', err.message);
  }
}

/**
 * Send real-time Telegram message to configured administrator chat
 */
export async function sendTelegramMessage(
  text: string,
  chatId: string = TELEGRAM_ADMIN_CHAT_ID,
  replyMarkup?: any
): Promise<TelegramSendResult> {
  if (!TELEGRAM_BOT_TOKEN) {
    return { success: false, error: 'Telegram bot token is not configured' };
  }

  const endpoint = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const payload: Record<string, any> = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    };

    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok && data.ok) {
      return {
        success: true,
        messageId: data.result?.message_id,
      };
    } else {
      const err = data.description || `HTTP ${res.status}`;
      return {
        success: false,
        error: err,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error reaching Telegram API',
    };
  }
}

/**
 * Triggered upon new application submission.
 * Enforces strict privacy: zero PII or sensitive identity documents sent over Telegram.
 */
export async function notifyAdminNewApplication(application: {
  id: string;
  reference_number: string;
  membership_card_name: string;
  created_at: string;
  verification_status: string;
}) {
  const timestamp = new Date(application.created_at).toUTCString();
  const adminUrl = `${APP_URL}/admin?ref=${encodeURIComponent(application.reference_number)}`;

  const message = [
    `🛡️ <b>NEW APPLICATION RECEIVED</b>`,
    ``,
    `📋 <b>Reference ID:</b> <code>${application.reference_number}</code>`,
    `💳 <b>Card Tier:</b> ${application.membership_card_name}`,
    `🕒 <b>Submitted:</b> ${timestamp}`,
    `⚡ <b>Current Status:</b> <code>${application.verification_status}</code>`,
    ``,
    `🔒 <i>For applicant privacy, identity documents & personal data must be reviewed exclusively in the secure Administrator Portal.</i>`,
    ``,
    `🔗 <b>Admin Portal:</b> <a href="${adminUrl}">${adminUrl}</a>`
  ].join('\n');

  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: '🔐 Open Admin Review',
          url: adminUrl,
        },
      ],
    ],
  };

  const result = await sendTelegramMessage(message, TELEGRAM_ADMIN_CHAT_ID, inlineKeyboard);

  logNotification(
    application.id,
    'telegram',
    TELEGRAM_ADMIN_CHAT_ID,
    result.success ? 'sent' : 'failed',
    result.success
      ? `Telegram alert delivered (Msg ID: ${result.messageId})`
      : `Failed to deliver Telegram alert: ${result.error}`,
    result.error
  );

  return result;
}

/**
 * Notify admin when an application status changes (e.g. approved / declined)
 */
export async function notifyAdminStatusChange(application: {
  id: string;
  reference_number: string;
  membership_card_name: string;
  old_status: string;
  new_status: string;
  admin_id: string;
}) {
  const adminUrl = `${APP_URL}/admin?ref=${encodeURIComponent(application.reference_number)}`;
  const statusEmoji = application.new_status === 'Approved' ? '✅' : application.new_status === 'Declined' ? '❌' : '⚠️';

  const message = [
    `${statusEmoji} <b>APPLICATION STATUS UPDATED</b>`,
    ``,
    `📋 <b>Reference ID:</b> <code>${application.reference_number}</code>`,
    `💳 <b>Card:</b> ${application.membership_card_name}`,
    `🔄 <b>Transition:</b> ${application.old_status} ➔ <b>${application.new_status}</b>`,
    `👤 <b>Actioned by:</b> Administrator [${application.admin_id}]`,
    ``,
    `🔗 <a href="${adminUrl}">Open in Admin Portal</a>`
  ].join('\n');

  const result = await sendTelegramMessage(message);
  logNotification(
    application.id,
    'telegram',
    TELEGRAM_ADMIN_CHAT_ID,
    result.success ? 'sent' : 'failed',
    `Status change alert: ${application.new_status}`,
    result.error
  );
  return result;
}

/**
 * Fetch updates sent to the Telegram bot so users/admin can interact
 */
export async function getTelegramUpdates(offset?: number) {
  if (!TELEGRAM_BOT_TOKEN) return { ok: false, error: 'No token configured' };

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?timeout=5${
      offset ? `&offset=${offset}` : ''
    }`;
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

/**
 * Check Bot info and verification status
 */
export async function getTelegramBotInfo() {
  if (!TELEGRAM_BOT_TOKEN) return { ok: false, error: 'No token' };
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}
