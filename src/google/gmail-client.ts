import { google } from 'googleapis';
import { getGoogleAuth } from './auth.js';

export interface EmailOptions {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  is_html?: boolean;
}

function createMimeMessage(options: EmailOptions): string {
  const headers = [
    `To: ${options.to.join(', ')}`,
    `Subject: ${options.subject}`,
    'MIME-Version: 1.0',
    `Content-Type: text/${options.is_html ? 'html' : 'plain'}; charset="UTF-8"`
  ];

  if (options.cc && options.cc.length > 0) {
    headers.push(`Cc: ${options.cc.join(', ')}`);
  }
  if (options.bcc && options.bcc.length > 0) {
    headers.push(`Bcc: ${options.bcc.join(', ')}`);
  }

  const messageParts = [
    headers.join('\r\n'),
    '',
    options.body
  ];

  const message = messageParts.join('\r\n');
  
  // Base64url encode the message as required by Gmail API
  return Buffer.from(message).toString('base64url');
}

export async function createDraft(options: EmailOptions) {
  const auth = getGoogleAuth();
  const gmail = google.gmail({ version: 'v1', auth });
  
  const raw = createMimeMessage(options);

  const res = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: {
        raw
      }
    }
  });

  return res.data;
}

export async function sendEmail(options: EmailOptions) {
  const auth = getGoogleAuth();
  const gmail = google.gmail({ version: 'v1', auth });
  
  const raw = createMimeMessage(options);

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw
    }
  });

  return res.data;
}
