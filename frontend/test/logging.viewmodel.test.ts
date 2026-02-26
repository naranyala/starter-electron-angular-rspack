import { describe, expect, it } from 'bun:test';
import { LoggingViewModel } from '../src/viewmodels/logging.viewmodel';

describe('LoggingViewModel', () => {
  it('stores emitted entries and assigns ids', () => {
    const vm = new LoggingViewModel();

    vm.emit({
      level: 'info',
      namespace: 'test',
      message: 'hello',
      context: { a: 1 },
    });

    const entries = vm.snapshot();
    expect(entries.length).toBe(1);
    expect(entries[0].id).toBe(1);
    expect(entries[0].namespace).toBe('test');
  });

  it('redacts configured keys in sanitize()', () => {
    const vm = new LoggingViewModel();
    vm.configure({ redactKeys: ['token'] });

    const sanitized = vm.sanitize({ token: 'secret', safe: 'ok' }) as Record<string, unknown>;

    expect(sanitized.token).toBe('[REDACTED]');
    expect(sanitized.safe).toBe('ok');
  });
});
