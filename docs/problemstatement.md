Here’s a ready-to-use `problemStatement.md` you can give directly to Cursor or Antigravity.

# Problem Statement: Generic MCP Server for Gmail and Google Docs

## 1. Overview

Build a **generic Model Context Protocol (MCP) server** that exposes tools for AI agents to interact with **Gmail** and **Google Docs**.

The MCP server will initially support two core capabilities:

1. **Gmail**

   * Draft emails
   * Send emails

2. **Google Docs**

   * Append content to an existing Google Doc

The MCP server must be designed as a **generic, reusable service** rather than being tightly coupled to a single AI agent or application. Any MCP-compatible AI agent should be able to connect to this server and use the available tools.

The primary objective is to provide AI agents with a simple and reliable interface for performing these actions without requiring each agent to implement its own Gmail/Google Docs integration.

---

# 2. Goals

The MCP server should:

* Follow the MCP standard and expose properly defined MCP tools.
* Authenticate securely with Google APIs.
* Support Gmail email drafting and sending.
* Support appending content to Google Docs.
* Be reusable by multiple AI agents.
* Keep the interface simple and intuitive for an LLM/agent to use.
* Return structured, machine-readable responses.
* Handle errors gracefully and provide useful error messages.
* Keep Google API-specific implementation details hidden behind the MCP tool interface.
* Be extensible so additional Google integrations/tools can be added later.

---

# 3. Core Functionalities

## 3.1 Gmail – Draft Email

The MCP server should provide a tool that allows an AI agent to create an email draft in Gmail.

### Suggested MCP Tool

`gmail_create_draft`

### Input Parameters

```json
{
  "to": ["recipient@example.com"],
  "cc": ["cc@example.com"],
  "bcc": ["bcc@example.com"],
  "subject": "Email subject",
  "body": "Email body",
  "is_html": false
}
```

### Parameter Requirements

* `to`

  * Required
  * Array of valid email addresses
  * At least one recipient

* `cc`

  * Optional
  * Array of email addresses

* `bcc`

  * Optional
  * Array of email addresses

* `subject`

  * Required
  * Email subject

* `body`

  * Required
  * Email content

* `is_html`

  * Optional
  * Boolean
  * Default: `false`

### Expected Behaviour

The server should:

1. Validate the input.
2. Authenticate with Gmail.
3. Create the email in the appropriate MIME format.
4. Create a Gmail draft.
5. Return the Gmail draft ID and relevant metadata.

### Example Response

```json
{
  "success": true,
  "draft_id": "r123456789",
  "message": "Email draft created successfully"
}
```

---

# 3.2 Gmail – Send Email

The MCP server should provide a tool that allows an AI agent to send an email through Gmail.

### Suggested MCP Tool

`gmail_send_email`

### Input Parameters

```json
{
  "to": ["recipient@example.com"],
  "cc": [],
  "bcc": [],
  "subject": "Email subject",
  "body": "Email body",
  "is_html": false
}
```

### Expected Behaviour

The server should:

1. Validate email parameters.
2. Authenticate with Gmail.
3. Construct the appropriate MIME email.
4. Send the email using the Gmail API.
5. Return the Gmail message ID and status.

### Example Response

```json
{
  "success": true,
  "message_id": "18abc123xyz",
  "thread_id": "18abc123xyz",
  "message": "Email sent successfully"
}
```

### Safety Considerations

Because sending an email is an external side effect, the MCP tool should make the action explicit.

The tool description should clearly indicate:

> This action sends an email immediately and cannot be undone.

The MCP server should not silently send an email when the AI agent only intends to create a draft.

---

# 4. Google Docs – Append Content

The MCP server should provide a tool allowing an AI agent to append text/content to an existing Google Doc.

### Suggested MCP Tool

`google_doc_append`

### Input Parameters

```json
{
  "document_id": "1AbCdEfGhIjKlMnOp",
  "content": "This is the content that should be appended."
}
```

### Optional Parameters

```json
{
  "document_id": "1AbCdEfGhIjKlMnOp",
  "content": "New content",
  "add_newline": true
}
```

### Parameter Requirements

* `document_id`

  * Required
  * Google Docs document ID
  * This can normally be extracted from a Google Docs URL.

* `content`

  * Required
  * Text to append

* `add_newline`

  * Optional
  * Boolean
  * Default: `true`

### Expected Behaviour

The server should:

1. Validate the document ID.
2. Authenticate with Google Docs API.
3. Retrieve the document structure or determine the correct insertion index.
4. Append the supplied content at the end of the document.
5. Preserve existing document content.
6. Return a success response.

### Example Response

```json
{
  "success": true,
  "document_id": "1AbCdEfGhIjKlMnOp",
  "message": "Content appended successfully"
}
```

---

# 5. MCP Tool Definitions

The initial server should expose at least the following tools:

| Tool                 | Purpose                                 |
| -------------------- | --------------------------------------- |
| `gmail_create_draft` | Create a Gmail draft                    |
| `gmail_send_email`   | Immediately send an email through Gmail |
| `google_doc_append`  | Append content to a Google Doc          |

Tool definitions should contain clear descriptions so an LLM can understand:

* What the tool does
* When to use it
* Required parameters
* Optional parameters
* Side effects
* Expected input formats

---

# 6. Authentication

Use **Google OAuth 2.0** for authentication.

The implementation should use the official Google APIs.

Required API scopes should be kept as narrow as practical.

At minimum, the implementation will likely require Gmail and Google Docs scopes such as:

```text
https://www.googleapis.com/auth/gmail.compose
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/documents
```

The implementation should avoid requesting broader Google permissions unnecessarily.

## Authentication Requirements

The server should:

* Support OAuth authorization.
* Store credentials securely.
* Refresh expired access tokens automatically.
* Never expose access tokens through MCP responses.
* Never log OAuth tokens or sensitive credentials.
* Clearly document how credentials are configured.

The architecture should allow authentication details to be changed later without changing the MCP tool interface.

---

# 7. Generic / Multi-Agent Architecture

This MCP server must **not be tied to a specific AI agent**.

For example, the server should not contain logic such as:

```text
if agent == "MyAgent":
    ...
```

Instead, it should expose standard MCP tools that any compatible client can discover and invoke.

Potential clients may include:

* Custom AI agents
* Cursor
* Claude
* Other MCP-compatible applications
* Internal enterprise AI agents
* Future applications

The MCP server should therefore be treated as an **integration layer** between AI agents and Google services.

```text
                   ┌──────────────────────┐
                   │      AI Agent        │
                   └──────────┬───────────┘
                              │
                              │ MCP
                              ▼
                   ┌──────────────────────┐
                   │     MCP Server       │
                   │                      │
                   │  Gmail Tools         │
                   │  Google Docs Tools   │
                   └──────────┬───────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
        ┌───────────────┐           ┌───────────────┐
        │   Gmail API   │           │ Google Docs   │
        │               │           │     API       │
        └───────────────┘           └───────────────┘
```

---

# 8. Error Handling

All tools should return predictable structured responses.

### Success

```json
{
  "success": true,
  "message": "Operation completed successfully"
}
```

### Failure

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Google authentication has expired."
  }
}
```

The server should distinguish between common error categories such as:

```text
VALIDATION_ERROR
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
NOT_FOUND
RATE_LIMITED
GOOGLE_API_ERROR
INTERNAL_ERROR
```

Error messages should be useful to an AI agent so that it can determine whether it should:

* Retry
* Ask the user for additional information
* Ask the user to authenticate
* Correct its input
* Stop execution

---

# 9. Validation

The MCP server should perform input validation before making Google API calls.

Examples:

### Email validation

* At least one `to` recipient
* Valid email format
* Subject must be provided
* Body must be provided

### Google Docs validation

* Document ID must be provided
* Content must not be empty
* Document must be accessible by the authenticated Google account

Validation errors should be returned before making unnecessary API requests.

---

# 10. Security Requirements

Security is important because the MCP server provides access to email and documents.

The implementation should:

* Never expose OAuth access tokens to the AI agent.
* Never log access tokens.
* Never log email contents unnecessarily.
* Never expose Google client secrets in source control.
* Use environment variables or a secure secrets mechanism.
* Validate all inputs.
* Use HTTPS when deployed remotely.
* Follow least-privilege OAuth scopes.
* Handle token refresh securely.

Sensitive configuration should be stored outside the repository.

Example:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GOOGLE_REFRESH_TOKEN=
```

The exact credential storage architecture can be improved for production deployment.

---

# 11. Configuration

The server should support configuration through environment variables.

Example:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GOOGLE_REFRESH_TOKEN=

MCP_SERVER_NAME=google-integration-server
LOG_LEVEL=info
```

Do not hard-code credentials.

Provide a `.env.example` file.

---

# 12. Logging

Logging should provide enough information for debugging without exposing sensitive information.

Good:

```text
gmail_send_email called
Google API request successful
Email sent successfully
```

Avoid:

```text
Access token: ...
OAuth refresh token: ...
Full email body: ...
```

Structured logging is preferred.

---

# 13. Project Structure

Use a clean modular architecture.

A possible structure:

```text
/
├── src/
│   ├── server/
│   │   ├── mcp-server.*
│   │   └── config.*
│   │
│   ├── tools/
│   │   ├── gmail/
│   │   │   ├── create-draft.*
│   │   │   └── send-email.*
│   │   │
│   │   └── google-docs/
│   │       └── append.*
│   │
│   ├── google/
│   │   ├── auth.*
│   │   ├── gmail-client.*
│   │   └── docs-client.*
│   │
│   └── utils/
│       ├── validation.*
│       └── errors.*
│
├── tests/
├── .env.example
├── README.md
├── package.json
└── ...
```

The exact language/framework can be selected based on MCP SDK maturity and ecosystem support, but the implementation should prioritize an officially supported or well-maintained MCP SDK.

---

# 14. Testing Requirements

The implementation should include tests for:

## Gmail

* Valid draft creation
* Invalid recipient
* Missing subject
* Missing body
* Successful email send
* Gmail authentication failure
* Gmail API failure

## Google Docs

* Valid document append
* Invalid document ID
* Empty content
* Document permission failure
* Google API failure

## MCP

* Tool discovery
* Tool input validation
* Structured tool responses
* Error handling

Google API calls should be mockable so most tests do not require live Google credentials.

---

# 15. README Requirements

The project should contain a detailed README explaining:

### Setup

How to:

1. Create a Google Cloud project.
2. Enable Gmail API.
3. Enable Google Docs API.
4. Configure OAuth credentials.
5. Configure environment variables.
6. Authenticate the Google account.
7. Start the MCP server.

### MCP Client Configuration

Include an example showing how a generic MCP client can connect to the server.

For example:

```json
{
  "mcpServers": {
    "google-integration": {
      "command": "...",
      "args": ["..."]
    }
  }
}
```

The exact configuration should match the chosen MCP transport/runtime.

---

# 16. Future Extensibility

The architecture should make it easy to add additional Google capabilities later.

Potential future tools include:

```text
gmail_search
gmail_read_email
gmail_reply
gmail_create_label

google_doc_read
google_doc_replace
google_sheet_read
google_sheet_append
google_calendar_create_event
google_calendar_list_events
google_drive_search
```

These should not necessarily be implemented in the first version, but the architecture should avoid making them difficult to add.

---

# 17. Non-Goals for V1

The first version does **not** need to implement:

* Gmail inbox synchronization
* Gmail email search
* Reading emails
* Email attachments
* Gmail labels
* Google Sheets
* Google Calendar
* Google Drive
* Multi-user enterprise identity management
* Complex document formatting
* Full Google Workspace administration

The priority is to get the three core tools working reliably:

```text
gmail_create_draft
gmail_send_email
google_doc_append
```

---

# 18. Definition of Done

The project will be considered complete when:

1. The MCP server starts successfully.
2. An MCP-compatible client can discover the three tools.
3. `gmail_create_draft` can create a real Gmail draft.
4. `gmail_send_email` can send a real Gmail email.
5. `google_doc_append` can append content to a real Google Doc.
6. OAuth authentication works reliably.
7. Access tokens are refreshed automatically.
8. Invalid inputs return structured errors.
9. Google API failures are handled gracefully.
10. Secrets are not committed to the repository.
11. Tests exist for core functionality.
12. README documentation allows another developer to set up and run the server without needing additional undocumented steps.
13. The MCP server works independently of any specific AI agent.

---

# 19. Implementation Priority

Implement in this order:

### Phase 1 – MCP Foundation

* Initialize project.
* Add MCP SDK.
* Create server.
* Add configuration management.
* Add basic health/startup handling.

### Phase 2 – Google Authentication

* Configure Google Cloud OAuth.
* Implement authentication.
* Implement token persistence/refresh.
* Create reusable Google API client layer.

### Phase 3 – Gmail

Implement:

```text
gmail_create_draft
gmail_send_email
```

### Phase 4 – Google Docs

Implement:

```text
google_doc_append
```

### Phase 5 – Reliability

* Input validation
* Error handling
* Logging
* Unit tests
* Integration tests

### Phase 6 – Documentation

* README
* Environment configuration
* Google Cloud setup instructions
* MCP client configuration
* Example tool calls

---

# 20. Important Design Principle

The MCP server should be treated as a **generic Google Workspace capability server for AI agents**, not as part of any particular agent.

The AI agent owns the **reasoning and decision-making**.

The MCP server owns the **execution and Google API integration**.

For example:

```text
AI Agent:

"I need to send the customer an email with the meeting summary."

        ↓

AI Agent decides to call:

gmail_send_email

        ↓

MCP Server

        ↓

Gmail API

        ↓

Email sent
```

Similarly:

```text
AI Agent:

"I need to add today's meeting notes to our Google Doc."

        ↓

AI Agent calls:

google_doc_append

        ↓

MCP Server

        ↓

Google Docs API

        ↓

Content appended
```

The MCP server should not contain business-specific reasoning, workflows, prompts, or agent logic.

It should provide **reliable, reusable primitives that any AI agent can call**.
