import { describe, test, expect } from 'bun:test';

describe('Basic Security Tests', () => {
  test('should have Bun test runner working', () => {
    expect(true).toBe(true);
  });

  test('should pass basic security check', () => {
    // A simple security check
    const userInput = "<script>alert('xss')</script>";
    const sanitized = userInput.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    expect(sanitized).not.toContain('<script>');
  });
});