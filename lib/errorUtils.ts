// Utility functions for handling errors safely

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    // Handle common error structures
    if (error.message && typeof error.message === 'string') {
      return error.message;
    }
    
    if (error.details && typeof error.details === 'string') {
      return error.details;
    }
    
    if (error.code && typeof error.code === 'string') {
      const message = error.message || error.details || 'An error occurred';
      return `Error ${error.code}: ${message}`;
    }
    
    // Try to extract any string value from the error object
    const keys = ['error', 'msg', 'description', 'reason'];
    for (const key of keys) {
      if (error[key] && typeof error[key] === 'string') {
        return error[key];
      }
    }
    
    // If all else fails, try to stringify the object safely
    try {
      return JSON.stringify(error);
    } catch {
      return 'An unknown error occurred';
    }
  }
  
  return 'An unknown error occurred';
};

export const ensureNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  return defaultValue;
};

export const ensureString = (value: any, defaultValue: string = ''): string => {
  if (typeof value === 'string') {
    return value;
  }
  
  if (value !== null && value !== undefined) {
    return String(value);
  }
  
  return defaultValue;
};
