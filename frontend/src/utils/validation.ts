/**
 * Validation utilities for forms and data
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

/**
 * Validate a single field
 */
export function validateField(value: unknown, rules: ValidationRule, fieldName: string): string | null {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return `${fieldName} is required`;
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null;
  }

  const stringValue = String(value);

  // Min length validation
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `${fieldName} must be at least ${rules.minLength} characters`;
  }

  // Max length validation
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `${fieldName} must be no more than ${rules.maxLength} characters`;
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return `${fieldName} format is invalid`;
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      return customError;
    }
  }

  return null;
}

/**
 * Validate an object against a schema
 */
export function validateObject(data: Record<string, unknown>, schema: ValidationSchema): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [fieldName, rules] of Object.entries(schema)) {
    const error = validateField(data[fieldName], rules, fieldName);
    if (error) {
      errors[fieldName] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9+\-\s()]{9,15}$/,
  phoneStrict: /^[0-9]{9,10}$/,
  creditCard: /^[0-9]{13,19}$/,
  expiryDate: /^(0[1-9]|1[0-2])\/\d{2}$/,
  cvv: /^[0-9]{3,4}$/,
  postalCode: /^[0-9]{5}(-[0-9]{4})?$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphabetic: /^[a-zA-Z\s]+$/,
  numeric: /^[0-9]+$/
};

/**
 * Predefined validation schemas
 */
export const ValidationSchemas = {
  shippingAddress: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: ValidationPatterns.alphabetic
    },
    phone: {
      required: true,
      pattern: ValidationPatterns.phone
    },
    address: {
      required: true,
      minLength: 10,
      maxLength: 500
    },
    email: {
      required: false,
      pattern: ValidationPatterns.email
    }
  },

  creditCard: {
    cardNumber: {
      required: true,
      custom: (value: unknown) => {
        const stringValue = String(value || '');
        const cleaned = stringValue.replace(/\s/g, '');
        if (!ValidationPatterns.creditCard.test(cleaned)) {
          return 'Invalid card number';
        }
        return null;
      }
    },
    expiryDate: {
      required: true,
      pattern: ValidationPatterns.expiryDate,
      custom: (value: unknown) => {
        const stringValue = String(value || '');
        if (!stringValue) return null;
        const [month, year] = stringValue.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        const expYear = parseInt(year);
        const expMonth = parseInt(month);

        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
          return 'Card has expired';
        }
        return null;
      }
    },
    cvv: {
      required: true,
      pattern: ValidationPatterns.cvv
    }
  },

  paypal: {
    paypalEmail: {
      required: true,
      pattern: ValidationPatterns.email
    }
  }
};

/**
 * Validate shipping address
 */
export function validateShippingAddress(address: Record<string, unknown>): ValidationResult {
  return validateObject(address, ValidationSchemas.shippingAddress);
}

/**
 * Validate credit card information
 */
export function validateCreditCard(cardInfo: Record<string, unknown>): ValidationResult {
  return validateObject(cardInfo, ValidationSchemas.creditCard);
}

/**
 * Validate PayPal information
 */
export function validatePayPal(paypalInfo: Record<string, unknown>): ValidationResult {
  return validateObject(paypalInfo, ValidationSchemas.paypal);
}

/**
 * Format and validate credit card number
 */
export function formatCreditCardNumber(value: string): string {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  
  if (parts.length) {
    return parts.join(' ');
  } else {
    return v;
  }
}

/**
 * Format and validate expiry date
 */
export function formatExpiryDate(value: string): string {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  return v;
}

/**
 * Validate phone number with different formats
 */
export function validatePhoneNumber(phone: string, strict: boolean = false): boolean {
  const pattern = strict ? ValidationPatterns.phoneStrict : ValidationPatterns.phone;
  return pattern.test(phone);
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
  return ValidationPatterns.email.test(email);
}

/**
 * Check if URL is valid
 */
export function isValidUrl(url: string): boolean {
  return ValidationPatterns.url.test(url);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isStrong: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password should be at least 8 characters long');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain uppercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain numbers');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain special characters');
  }

  return {
    isStrong: score >= 4,
    score,
    feedback
  };
}
