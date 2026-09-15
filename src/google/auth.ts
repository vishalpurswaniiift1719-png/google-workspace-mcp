import { google } from 'googleapis';
import dotenv from 'dotenv';
import { McpError } from '../utils/errors.js';

// Ensure env vars are loaded if this file is imported early
dotenv.config();

export function getGoogleAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const tokenString = process.env.GOOGLE_TOKEN;

  if (!clientId || !clientSecret || !tokenString) {
    throw new McpError(
      'AUTHENTICATION_ERROR',
      'Missing Google OAuth credentials in environment variables. Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_TOKEN are set.'
    );
  }

  let tokenData;
  try {
    tokenData = JSON.parse(tokenString);
  } catch (error) {
    throw new McpError(
      'AUTHENTICATION_ERROR',
      'GOOGLE_TOKEN is not valid JSON.'
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  
  // Set the full credentials object
  oauth2Client.setCredentials(tokenData);

  return oauth2Client;
}
