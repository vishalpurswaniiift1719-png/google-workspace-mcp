export class McpError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'McpError';
  }
}

export function formatErrorResponse(error: any): string {
  let response;
  if (error instanceof McpError) {
    response = {
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    };
  } else {
    // Check for Google API errors
    const googleApiCode = error?.response?.status || error?.code;
    const isGoogleError = googleApiCode && typeof googleApiCode === 'number';
    
    if (isGoogleError) {
      let code = 'GOOGLE_API_ERROR';
      if (googleApiCode === 401 || googleApiCode === 403) code = 'AUTHENTICATION_ERROR';
      else if (googleApiCode === 404) code = 'NOT_FOUND';
      else if (googleApiCode === 429) code = 'RATE_LIMITED';
      
      response = {
        success: false,
        error: {
          code,
          message: error?.message || 'Google API Error'
        }
      };
    } else {
      response = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error?.message || 'An unexpected error occurred'
        }
      };
    }
  }
  return JSON.stringify(response, null, 2);
}

export function formatSuccessResponse(data: Record<string, any>): string {
  return JSON.stringify({
    success: true,
    ...data
  }, null, 2);
}
