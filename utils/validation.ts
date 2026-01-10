/**
 * Input validation utilities for form validation
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates an email address format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }
  
  // RFC 5322 simplified email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }
  
  return { isValid: true };
};

/**
 * Validates a password with security requirements
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long' };
  }
  
  // Check for at least one letter and one number
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one letter and one number' };
  }
  
  return { isValid: true };
};

/**
 * Validates a name field
 */
export const validateName = (name: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Name is too long' };
  }
  
  return { isValid: true };
};

/**
 * Sanitizes text input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Validates file size
 */
export const validateFileSize = (file: File, maxSizeMB: number): ValidationResult => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return { 
      isValid: false, 
      error: `File size must be less than ${maxSizeMB}MB` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validates file type against allowed types
 */
export const validateFileType = (file: File, allowedTypes: string[]): ValidationResult => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  // Check MIME type
  const isAllowedMime = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      // Wildcard match (e.g., 'image/*')
      return fileType.startsWith(type.replace('/*', '/'));
    }
    return fileType === type;
  });
  
  // Also check file extension for common types
  const isAllowedExt = allowedTypes.some(type => {
    const extMap: Record<string, string[]> = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/json': ['.json'],
      'text/csv': ['.csv'],
    };
    
    const exts = extMap[type] || [];
    return exts.some(ext => fileName.endsWith(ext));
  });
  
  if (!isAllowedMime && !isAllowedExt) {
    return { 
      isValid: false, 
      error: 'File type is not supported' 
    };
  }
  
  return { isValid: true };
};
