import sys

def modify_index():
    with open('src/index.ts', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix the corrupted line
    old_line = "transport = new SSEServerTransport(/messages?token=\\, res);"
    new_line = "transport = new SSEServerTransport(`/messages?token=${token || ''}`, res);"
    
    if old_line in content:
        content = content.replace(old_line, new_line)
        with open('src/index.ts', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed corrupted line in index.ts.")
    else:
        print("Line not found. Check if already fixed.")

if __name__ == "__main__":
    modify_index()
