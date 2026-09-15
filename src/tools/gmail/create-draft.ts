import { validateInput, DraftEmailSchema } from '../../utils/validation.js';
import { createDraft } from '../../google/gmail-client.js';
import { formatSuccessResponse, formatErrorResponse } from '../../utils/errors.js';

export async function handleCreateDraft(args: unknown) {
  try {
    const validArgs = validateInput(DraftEmailSchema, args);
    const result = await createDraft(validArgs);
    
    return {
      content: [{
        type: 'text',
        text: formatSuccessResponse({
          draft_id: result.id,
          message: 'Email draft created successfully'
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
