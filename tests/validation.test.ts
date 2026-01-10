import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateName,
  sanitizeInput,
  validateFileSize,
  validateFileType,
} from '../utils/validation';

describe('validateEmail', () => {
  it('should return valid for a correct email', () => {
    const result = validateEmail('test@example.com');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return invalid for empty email', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Email is required');
  });

  it('should return invalid for whitespace-only email', () => {
    const result = validateEmail('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Email is required');
  });

  it('should return invalid for email without @', () => {
    const result = validateEmail('testexample.com');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a valid email address');
  });

  it('should return invalid for email without domain', () => {
    const result = validateEmail('test@');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a valid email address');
  });

  it('should return invalid for email without TLD', () => {
    const result = validateEmail('test@example');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a valid email address');
  });

  it('should return valid for email with subdomain', () => {
    const result = validateEmail('test@sub.example.com');
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for extremely long email', () => {
    const longEmail = 'a'.repeat(250) + '@example.com';
    const result = validateEmail(longEmail);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Email address is too long');
  });
});

describe('validatePassword', () => {
  it('should return valid for a strong password', () => {
    const result = validatePassword('Password123');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return invalid for empty password', () => {
    const result = validatePassword('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Password is required');
  });

  it('should return invalid for short password', () => {
    const result = validatePassword('Pass1');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Password must be at least 8 characters long');
  });

  it('should return invalid for password without numbers', () => {
    const result = validatePassword('Password');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Password must contain at least one letter and one number');
  });

  it('should return invalid for password without letters', () => {
    const result = validatePassword('12345678');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Password must contain at least one letter and one number');
  });

  it('should return invalid for extremely long password', () => {
    const longPassword = 'a1'.repeat(100);
    const result = validatePassword(longPassword);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Password is too long');
  });
});

describe('validateName', () => {
  it('should return valid for a proper name', () => {
    const result = validateName('John Doe');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return invalid for empty name', () => {
    const result = validateName('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Name is required');
  });

  it('should return invalid for whitespace-only name', () => {
    const result = validateName('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Name is required');
  });

  it('should return invalid for single character name', () => {
    const result = validateName('J');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Name must be at least 2 characters long');
  });

  it('should return invalid for extremely long name', () => {
    const longName = 'a'.repeat(101);
    const result = validateName(longName);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Name is too long');
  });
});

describe('sanitizeInput', () => {
  it('should escape HTML tags', () => {
    const result = sanitizeInput('<script>alert("xss")</script>');
    expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('should escape ampersands', () => {
    const result = sanitizeInput('Tom & Jerry');
    expect(result).toBe('Tom &amp; Jerry');
  });

  it('should escape quotes', () => {
    const result = sanitizeInput('He said "hello"');
    expect(result).toBe('He said &quot;hello&quot;');
  });

  it('should escape single quotes', () => {
    const result = sanitizeInput("It's working");
    expect(result).toBe('It&#x27;s working');
  });

  it('should handle clean input without changes', () => {
    const result = sanitizeInput('Normal text');
    expect(result).toBe('Normal text');
  });
});

describe('validateFileSize', () => {
  it('should return valid for file within size limit', () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(mockFile, 'size', { value: 5 * 1024 * 1024 }); // 5MB
    
    const result = validateFileSize(mockFile, 20);
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for file exceeding size limit', () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(mockFile, 'size', { value: 25 * 1024 * 1024 }); // 25MB
    
    const result = validateFileSize(mockFile, 20);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('File size must be less than 20MB');
  });
});

describe('validateFileType', () => {
  it('should return valid for allowed image type', () => {
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    
    const result = validateFileType(mockFile, ['image/*']);
    expect(result.isValid).toBe(true);
  });

  it('should return valid for specific MIME type', () => {
    const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    
    const result = validateFileType(mockFile, ['application/pdf']);
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for disallowed type', () => {
    const mockFile = new File([''], 'test.exe', { type: 'application/x-msdownload' });
    
    const result = validateFileType(mockFile, ['image/*', 'application/pdf']);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('File type is not supported');
  });

  it('should validate by file extension when MIME type is not matched', () => {
    const mockFile = new File([''], 'test.jpg', { type: '' });
    
    const result = validateFileType(mockFile, ['image/*']);
    expect(result.isValid).toBe(true);
  });
});
