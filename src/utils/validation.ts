import { z } from 'zod';
import { McpError } from './errors.js';

export const DraftEmailSchema = z.object({
  to: z.array(z.string().email("Invalid email address in 'to' array")).min(1, "At least one recipient is required"),
  cc: z.array(z.string().email("Invalid email address in 'cc' array")).optional().default([]),
  bcc: z.array(z.string().email("Invalid email address in 'bcc' array")).optional().default([]),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  is_html: z.boolean().optional().default(false)
});

export const SendEmailSchema = DraftEmailSchema;

export const AppendDocSchema = z.object({
  document_id: z.string().min(1, "Document ID is required"),
  content: z.string().min(1, "Content is required"),
  add_newline: z.boolean().optional().default(true)
});

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorMessages = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new McpError('VALIDATION_ERROR', `Input validation failed: ${errorMessages}`);
  }
  return result.data;
}
