import { google } from 'googleapis';
import { getGoogleAuth } from './auth.js';

export async function appendToDoc(documentId: string, content: string, addNewline: boolean = true) {
  const auth = getGoogleAuth();
  const docs = google.docs({ version: 'v1', auth });

  // First fetch the document to get the end index
  const docRes = await docs.documents.get({
    documentId,
  });

  const body = docRes.data.body;
  if (!body || !body.content) {
    throw new Error('Failed to retrieve document body');
  }

  // The last structural element determines the end index.
  // We can insert at the end minus 1 index.
  const endIndex = body.content[body.content.length - 1].endIndex;
  
  if (endIndex == null) {
      throw new Error('Could not determine document end index');
  }

  const insertIndex = endIndex - 1;
  const textToInsert = addNewline ? `\n${content}` : content;

  const res = await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: {
              index: Math.max(1, insertIndex)
            },
            text: textToInsert
          }
        }
      ]
    }
  });

  return res.data;
}
