#!/usr/bin/env node

import dotenv from "dotenv";
import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createMcpServer } from "./server/mcp-server.js";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

async function main() {
  const server = createMcpServer();
  let transport: SSEServerTransport | null = null;

  app.get("/sse", async (req, res) => {
    const token = req.query.token;
    if (process.env.MCP_AUTH_TOKEN && token !== process.env.MCP_AUTH_TOKEN) {
      console.warn("Unauthorized SSE connection attempt");
      return res.status(401).send("Unauthorized");
    }
    console.log("New SSE connection established");
    transport = new SSEServerTransport(`/messages?token=${token || ''}`, res);
    await server.connect(transport);
  });

  app.post("/messages", async (req, res) => {
    const token = req.query.token;
    if (process.env.MCP_AUTH_TOKEN && token !== process.env.MCP_AUTH_TOKEN) {
      console.warn("Unauthorized messages POST attempt");
      return res.status(401).send("Unauthorized");
    }
    
    if (transport) {
      await transport.handlePostMessage(req, res);
    } else {
      res.status(400).send("SSE connection not established");
    }
  });

  app.listen(port, () => {
    console.error(`MCP Server running on port ${port}`);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
