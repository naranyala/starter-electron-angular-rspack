/**
 * Advanced form utilities for validation, transformation, and submission
 */

export interface FieldValidator<T = any> {
  (value: T, formData?: Record<string, any>): boolean | string | Promise<boolean | string>;
}

export interface FieldRule {
  validator: FieldValidator;
  message: string;
}

export interface FormFieldConfig {
  name: string;
  validators?: FieldRule[];
  transform?: (value: any) => any;
  required?: boolean;
  defaultValue?: any;
}

export interface FormConfig {
  fields: FormFieldConfig[];
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
  onChange?: (data: Record<string, any>, changedField?: string) => void;
  validateOn?: 'change' | 'blur' | 'submit';
}

export class FormBuilder {
  private fields: Map<string, FormFieldConfig>;
  private data: Map<string, any>;
  private errors: Map<string, string[]>;
  private config: FormConfig;
  private subscribers: Array<(data: Record<string, any>, errors: Record<string, string[]>) => void> = [];

  constructor(config: FormConfig) {
    this.config = config;
    this.fields = new Map();
    this.data = new Map();
    this.errors = new Map();

    // Initialize fields
    config.fields.forEach(field => {
      this.fields.set(field.name, field);
      this.data.set(field.name, field.defaultValue);
    });
  }

  async setValue(fieldName: string, value: any): Promise<void> {
    const field = this.fields.get(fieldName);
    if (!field) {
      throw new Error(`Field ${fieldName} does not exist`);
    }

    // Apply transformation if defined
    if (field.transform) {
      value = field.transform(value);
    }

    this.data.set(fieldName, value);

    // Validate if needed
    if (this.config.validateOn === 'change') {
      await this.validateField(fieldName);
    }

    // Notify subscribers
    this.notifySubscribers();

    // Call change handler if defined
    if (this.config.onChange) {
      this.config.onChange(Object.fromEntries(this.data), fieldName);
    }
  }

  getValue(fieldName: string): any {
    return this.data.get(fieldName);
  }

  async validateField(fieldName: string): Promise<boolean> {
    const field = this.fields.get(fieldName);
    if (!field) return false;

    const value = this.data.get(fieldName);
    const allData = Object.fromEntries(this.data);
    const fieldErrors: string[] = [];

    // Check required
    if (field.required && (value === undefined || value === null || value === '')) {
      fieldErrors.push(`${field.name} is required`);
    }

    // Run custom validators
    if (field.validators) {
      for (const rule of field.validators) {
        const result = await Promise.resolve(rule.validator(value, allData));
        
        if (typeof result === 'string') {
          fieldErrors.push(result);
        } else if (result === false) {
          fieldErrors.push(rule.message);
        }
      }
    }

    if (fieldErrors.length > 0) {
      this.errors.set(fieldName, fieldErrors);
      return false;
    } else {
      this.errors.delete(fieldName);
      return true;
    }
  }

  async validateAll(): Promise<boolean> {
    const fieldNames = Array.from(this.fields.keys());
    const results = await Promise.all(
      fieldNames.map(fieldName => this.validateField(fieldName))
    );
    
    return results.every(result => result);
  }

  async submit(): Promise<boolean> {
    // Validate all fields first
    const isValid = await this.validateAll();
    
    if (!isValid) {
      return false;
    }

    // Call submit handler if defined
    if (this.config.onSubmit) {
      try {
        await this.config.onSubmit(Object.fromEntries(this.data));
        return true;
      } catch (error) {
        console.error('Form submission error:', error);
        return false;
      }
    }

    return true;
  }

  subscribe(callback: (data: Record<string, any>, errors: Record<string, string[]>) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  getData(): Record<string, any> {
    return Object.fromEntries(this.data);
  }

  getErrors(): Record<string, string[]> {
    return Object.fromEntries(this.errors);
  }

  private notifySubscribers(): void {
    const data = Object.fromEntries(this.data);
    const errors = Object.fromEntries(this.errors);
    this.subscribers.forEach(subscriber => subscriber(data, errors));
  }
}

/**
 * Form validation presets
 */
export const FormValidators = {
  required: (message: string = 'This field is required'): FieldRule => ({
    validator: (value: any) => value != null && value !== '',
    message
  }),

  minLength: (min: number, message?: string): FieldRule => ({
    validator: (value: string) => typeof value === 'string' && value.length >= min,
    message: message || `Minimum length is ${min}`
  }),

  maxLength: (max: number, message?: string): FieldRule => ({
    validator: (value: string) => typeof value === 'string' && value.length <= max,
    message: message || `Maximum length is ${max}`
  }),

  email: (message: string = 'Please enter a valid email'): FieldRule => ({
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),

  url: (message: string = 'Please enter a valid URL'): FieldRule => ({
    validator: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message
  }),

  pattern: (regex: RegExp, message: string): FieldRule => ({
    validator: (value: string) => regex.test(value),
    message
  }),

  custom: (validator: FieldValidator, message: string): FieldRule => ({
    validator,
    message
  })
};

/**
 * Form transformers for data normalization
 */
export const FormTransformers = {
  trim: (value: string) => typeof value === 'string' ? value.trim() : value,
  toLowerCase: (value: string) => typeof value === 'string' ? value.toLowerCase() : value,
  toUpperCase: (value: string) => typeof value === 'string' ? value.toUpperCase() : value,
  toDate: (value: string) => new Date(value),
  toNumber: (value: string) => Number(value),
  toBoolean: (value: any) => Boolean(value),
  jsonParse: (value: string) => JSON.parse(value),
  jsonArray: (value: string) => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [value];
    }
  }
};

/**
 * Form persistence utilities
 */
export class FormPersistence {
  static async save(formId: string, data: Record<string, any>, storage: Storage = localStorage): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      storage.setItem(`form_${formId}`, serialized);
    } catch (error) {
      console.error(`Failed to save form ${formId}:`, error);
    }
  }

  static async load(formId: string, storage: Storage = localStorage): Promise<Record<string, any> | null> {
    try {
      const serialized = storage.getItem(`form_${formId}`);
      return serialized ? JSON.parse(serialized) : null;
    } catch (error) {
      console.error(`Failed to load form ${formId}:`, error);
      return null;
    }
  }

  static async clear(formId: string, storage: Storage = localStorage): Promise<void> {
    try {
      storage.removeItem(`form_${formId}`);
    } catch (error) {
      console.error(`Failed to clear form ${formId}:`, error);
    }
  }
}