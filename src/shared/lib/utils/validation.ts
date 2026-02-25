/**
 * Validation utility functions for shared use
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  // Simple phone validation - adjust regex as needed
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
}

/**
 * Validate if a string is not empty
 */
export function isNotEmpty(str: string): boolean {
  return typeof str === 'string' && str.trim().length > 0;
}

/**
 * Validate if a value is a valid number
 */
export function isValidNumber(value: any): boolean {
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

/**
 * Validate if a value is a valid integer
 */
export function isValidInteger(value: any): boolean {
  return Number.isInteger(Number(value));
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string, minLength: number = 8): boolean {
  if (password.length < minLength) {
    return false;
  }

  // At least one uppercase, one lowercase, one number
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  return hasUpperCase && hasLowerCase && hasNumbers;
}

/**
 * Validate if a string contains only alphanumeric characters
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Validate if a string contains only alphabetic characters
 */
export function isAlpha(str: string): boolean {
  return /^[a-zA-Z]+$/.test(str);
}

/**
 * Validate if a string contains only numeric characters
 */
export function isNumeric(str: string): boolean {
  return /^[0-9]+$/.test(str);
}

/**
 * Validate if a string is a valid hexadecimal color
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validate if a date string is in valid ISO format
 */
export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate if an object has all required properties
 */
export function hasRequiredProps(obj: any, requiredProps: string[]): boolean {
  for (const prop of requiredProps) {
    if (!(prop in obj) || obj[prop] === undefined || obj[prop] === null) {
      return false;
    }
  }
  return true;
}

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate an object against a schema
 */
export function validateSchema<T>(
  obj: T,
  schema: { [K in keyof T]?: (value: T[K]) => boolean }
): ValidationResult {
  const errors: string[] = [];

  for (const key in schema) {
    if (Object.hasOwn(schema, key)) {
      const validator = schema[key];
      if (validator && !validator(obj[key])) {
        errors.push(`Invalid value for property: ${String(key)}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
