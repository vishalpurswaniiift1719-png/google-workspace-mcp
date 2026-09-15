import { google } from 'googleapis';
import dotenv from 'dotenv';
import { McpError } from '../utils/errors.js';

// Ensure env vars are loaded if this file is imported early
dotenv.config();

export function getGoogleAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new McpError(
      'AUTHENTICATION_ERROR',
      'Missing Google OAuth credentials in environment variables. Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are set.'
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  
  // Set the refresh token to allow the client to automatically fetch new access tokens
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  return oauth2Client;
}
