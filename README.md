# Google Workspace MCP Server

This is a generic Model Context Protocol (MCP) server that provides AI agents with tools to interact with Gmail and Google Docs. It allows any MCP-compatible agent to draft emails, send emails, and append content to Google Docs on your behalf.

## Provided Tools

1.  `gmail_create_draft`: Creates an email draft.
2.  `gmail_send_email`: Sends an email immediately.
3.  `google_doc_append`: Appends text to the end of an existing Google Document.

## Setup Instructions

To use this server, you need to configure a Google Cloud Project with the necessary APIs and OAuth credentials.

### 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.

### 2. Enable APIs
1. Navigate to **APIs & Services > Library**.
2. Search for and enable the **Gmail API**.
3. Search for and enable the **Google Docs API**.

### 3. Configure OAuth Consent Screen
1. Navigate to **APIs & Services > OAuth consent screen**.
2. Choose **External** (or Internal if you are a Google Workspace user).
3. Add the following scopes:
   - `https://www.googleapis.com/auth/gmail.compose`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/documents`
4. Add your email address as a **Test user** if your app is in "Testing" mode.

### 4. Create OAuth Credentials
1. Navigate to **APIs & Services > Credentials**.
2. Click **Create Credentials > OAuth client ID**.
3. Select **Desktop app** (or Web application if you prefer) as the application type.
4. Download or copy your **Client ID** and **Client Secret**.

### 5. Obtain a Refresh Token
You must perform an initial OAuth 2.0 flow to authorize the application and obtain a refresh token.
*(Note: You can use tools like [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) configured with your own OAuth Client ID/Secret to generate a refresh token with the required scopes).*

### 6. Configure Environment Variables
1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in the `.env` file with your credentials:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REFRESH_TOKEN=your_refresh_token
   MCP_SERVER_NAME=google-integration-server
   ```

### 7. Install and Build
```bash
npm install
npm run build
```

## MCP Client Configuration

Configure your MCP client (such as Cursor or Claude Desktop) to connect to the compiled server.

Example for `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "google-integration": {
      "command": "node",
      "args": [
        "/absolute/path/to/AI Summarizer MCP server/build/index.js"
      ],
      "env": {
        "GOOGLE_CLIENT_ID": "your_client_id",
        "GOOGLE_CLIENT_SECRET": "your_client_secret",
        "GOOGLE_REFRESH_TOKEN": "your_refresh_token",
        "MCP_SERVER_NAME": "google-integration-server"
      }
    }
  }
}
```
*(Alternatively, rely on the `.env` file located in the server's root directory).*

## Architecture & Security
- This server relies on Google's OAuth 2.0. Access tokens are kept entirely within the server's memory and are automatically refreshed.
- Tokens and email/document contents are not exposed to the AI agent except via structured success/error messages.
