import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { handleCreateDraft } from "../tools/gmail/create-draft.js";
import { handleSendEmail } from "../tools/gmail/send-email.js";
import { handleAppendDoc } from "../tools/google-docs/append.js";

export function createMcpServer() {
  const server = new Server(
    {
      name: process.env.MCP_SERVER_NAME || "google-integration-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "gmail_create_draft",
          description: "Create an email draft in Gmail",
          inputSchema: {
            type: "object",
            properties: {
              to: { type: "array", items: { type: "string" }, description: "Array of valid email addresses (Required)" },
              cc: { type: "array", items: { type: "string" }, description: "Array of email addresses" },
              bcc: { type: "array", items: { type: "string" }, description: "Array of email addresses" },
              subject: { type: "string", description: "Email subject (Required)" },
              body: { type: "string", description: "Email content (Required)" },
              is_html: { type: "boolean", description: "Set to true if body is HTML" }
            },
            required: ["to", "subject", "body"]
          }
        },
        {
          name: "gmail_send_email",
          description: "Send an email immediately through Gmail. WARNING: This action sends an email immediately and cannot be undone.",
          inputSchema: {
            type: "object",
            properties: {
              to: { type: "array", items: { type: "string" }, description: "Array of valid email addresses (Required)" },
              cc: { type: "array", items: { type: "string" }, description: "Array of email addresses" },
              bcc: { type: "array", items: { type: "string" }, description: "Array of email addresses" },
              subject: { type: "string", description: "Email subject (Required)" },
              body: { type: "string", description: "Email content (Required)" },
              is_html: { type: "boolean", description: "Set to true if body is HTML" }
            },
            required: ["to", "subject", "body"]
          }
        },
        {
          name: "google_doc_append",
          description: "Append content to an existing Google Doc",
          inputSchema: {
            type: "object",
            properties: {
              document_id: { type: "string", description: "Google Docs document ID (Required)" },
              content: { type: "string", description: "Text to append (Required)" },
              add_newline: { type: "boolean", description: "Add a newline before content (Default: true)" }
            },
            required: ["document_id", "content"]
          }
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
      case "gmail_create_draft":
        return await handleCreateDraft(request.params.arguments);
      case "gmail_send_email":
        return await handleSendEmail(request.params.arguments);
      case "google_doc_append":
        return await handleAppendDoc(request.params.arguments);
      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  });

  return server;
}
