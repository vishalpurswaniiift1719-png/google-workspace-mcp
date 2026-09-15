import { validateInput, AppendDocSchema } from '../../utils/validation.js';
import { appendToDoc } from '../../google/docs-client.js';
import { formatSuccessResponse, formatErrorResponse } from '../../utils/errors.js';

export async function handleAppendDoc(args: unknown) {
  try {
    const validArgs = validateInput(AppendDocSchema, args);
    await appendToDoc(validArgs.document_id, validArgs.content, validArgs.add_newline);
    
    return {
      content: [{
        type: 'text',
        text: formatSuccessResponse({
          document_id: validArgs.document_id,
          message: 'Content appended successfully'
        })
      }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{
        type: 'text',
        text: formatErrorResponse(error)
      }]
    };
  }
}
