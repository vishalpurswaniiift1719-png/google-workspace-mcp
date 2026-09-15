import sys

def modify_index():
    with open('src/index.ts', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update the '/sse' endpoint
    old_sse = '''app.get("/sse", async (req, res) => {
    console.log("New SSE connection established");
    transport = new SSEServerTransport("/messages", res);'''
    
    new_sse = '''app.get("/sse", async (req, res) => {
    const token = req.query.token;
    if (process.env.MCP_AUTH_TOKEN && token !== process.env.MCP_AUTH_TOKEN) {
      console.warn("Unauthorized SSE connection attempt");
      return res.status(401).send("Unauthorized");
    }
    console.log("New SSE connection established");
    transport = new SSEServerTransport(/messages?token=\, res);'''
    
    # 2. Update the '/messages' endpoint
    old_messages = '''app.post("/messages", async (req, res) => {
    if (transport) {
      await transport.handlePostMessage(req, res);'''
      
    new_messages = '''app.post("/messages", async (req, res) => {
    const token = req.query.token;
    if (process.env.MCP_AUTH_TOKEN && token !== process.env.MCP_AUTH_TOKEN) {
      console.warn("Unauthorized messages POST attempt");
      return res.status(401).send("Unauthorized");
    }
    
    if (transport) {
      await transport.handlePostMessage(req, res);'''
      
    content = content.replace(old_sse, new_sse)
    content = content.replace(old_messages, new_messages)
    
    with open('src/index.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Modified src/index.ts successfully.")

if __name__ == "__main__":
    modify_index()
