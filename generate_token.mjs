import { google } from 'googleapis';
import fs from 'fs';
import http from 'http';
import url from 'url';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/documents'
];

async function main() {
  let credentials;
  
  if (process.env.GOOGLE_CREDENTIALS) {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } else {
    try {
      const content = fs.readFileSync('credentials.json.json', 'utf8');
      credentials = JSON.parse(content);
    } catch (error) {
      console.error('Error reading credentials: You must set the GOOGLE_CREDENTIALS environment variable or provide a credentials.json.json file.');
      process.exit(1);
    }
  }
  
  const {client_secret, client_id, redirect_uris} = credentials.installed || credentials.web;
  
  // Use the first redirect URI or a default local one
  const redirectUri = redirect_uris && redirect_uris.length > 0 ? redirect_uris[0] : 'http://localhost';
  const parsedUrl = new url.URL(redirectUri);
  const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 80;

  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirectUri);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  console.log('Authorize this app by visiting this url:', authUrl);
  console.log(`\nWaiting for authorization on port ${port}...`);
  
  const server = http.createServer((req, res) => {
    if (req.url && req.url.startsWith('/')) {
      const qs = new url.URL(req.url, `http://localhost:${port}`).searchParams;
      const code = qs.get('code');
      
      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Authentication successful!</h1><p>You can close this tab and return to the terminal.</p>');
        server.close();
        
        oAuth2Client.getToken(code, (err, token) => {
          if (err) return console.error('Error retrieving access token', err);
          
          fs.writeFileSync('token.json', JSON.stringify(token, null, 2));
          console.log('\nToken stored to token.json');
          
          if (token.refresh_token) {
            console.log('\n--- IMPORTANT ---');
            console.log('Your GOOGLE_TOKEN is:');
            console.log(JSON.stringify(token));
            console.log('\nAdd this entire JSON string as the GOOGLE_TOKEN environment variable in your Railway dashboard!');
          } else {
            console.log('\nNo refresh token received. You might need to remove the app from your Google account and try again.');
          }
          process.exit(0);
        });
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('No code found in the request URL.');
      }
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EACCES') {
      console.error(`\nError: Permission denied to start server on port ${port}. Try running with administrator privileges or change the redirect URI in Google Cloud Console to include a different port (e.g., http://localhost:3000).`);
    } else {
      console.error('\nServer error:', err);
    }
    process.exit(1);
  });

  server.listen(port, () => {
    // Server is listening
  });
}

main().catch(console.error);
