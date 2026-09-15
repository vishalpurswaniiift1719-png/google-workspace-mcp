import { validateInput, SendEmailSchema } from '../../utils/validation.js';
import { sendEmail } from '../../google/gmail-client.js';
import { formatSuccessResponse, formatErrorResponse } from '../../utils/errors.js';

export async function handleSendEmail(args: unknown) {
  try {
    const validArgs = validateInput(SendEmailSchema, args);
    const result = await sendEmail(validArgs);
    
    return {
      content: [{
        type: 'text',
        text: formatSuccessResponse({
          message_id: result.id,
          thread_id: result.threadId,
          message: 'Email sent successfully'
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
