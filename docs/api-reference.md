# API Reference

## Main Process API

### Configuration Management

#### ConfigManager
Manages application configuration with file persistence and change watching.

```typescript
const configManager = new ConfigManager({
  fileName: 'app-config.json',
  watch: true
});

// Get configuration value
const apiUrl = configManager.get('api.url', 'http://localhost:3000');

// Set configuration value
configManager.set('feature.enabled', true);

// Watch for configuration changes
const watcher = configManager.watch();
const unsubscribe = watcher.onChange((newConfig) => {
  console.log('Config changed:', newConfig);
});
```

#### FeatureFlagsManager
Manages feature flags for A/B testing and gradual rollouts.

```typescript
const featureFlags = new FeatureFlagsManager(configManager);

// Check if feature is enabled
if (featureFlags.isEnabled('new-ui', userId)) {
  // Show new UI
}

// Set a feature flag
featureFlags.setFlag({
  name: 'beta-feature',
  enabled: true,
  rolloutPercentage: 10 // 10% rollout
});
```

#### EnvironmentConfig
Provides environment-specific configuration values.

```typescript
const env = EnvironmentConfig.getEnvironment(); // 'development' | 'production' | 'test'
const isDev = EnvironmentConfig.isDevelopment();
const apiUrl = EnvironmentConfig.getApiBaseUrl();
```

### IPC Handlers

#### `getSystemInfo`
Retrieves system information from the main process.

**Request**: No parameters
**Response**:
```typescript
{
  platform: string;
  version: string;
  arch: string;
}
```

#### `getFileContent`
Reads content from a file.

**Request**:
```typescript
{
  filePath: string;
}
```
**Response**:
```typescript
{
  content: string;
  success: boolean;
  error?: string;
}
```

#### `writeFileContent`
Writes content to a file.

**Request**:
```typescript
{
  filePath: string;
  content: string;
}
```
**Response**:
```typescript
{
  success: boolean;
  error?: string;
}
```

### Window Management

#### WindowUseCaseFactory
Creates window use cases for different features.

```typescript
const useCase = WindowUseCaseFactory.createUseCase('feature-name');
useCase.execute(card, index);
```

### File System Operations

#### FileSystem Class
Provides safe file operations with error handling.

```typescript
const fs = new FileSystem();
await fs.writeFile('config.json', data);
const content = await fs.readFile('config.json');
```

## Renderer Process API

### State Management

#### ComponentStateManager
Manages component state with loading, error, and persistence states.

```typescript
const stateManager = new ComponentStateManager(initialData, 'my-component');

// Subscribe to state changes
const unsubscribe = stateManager.subscribe((state) => {
  console.log('State updated:', state);
});

// Load data with loading/error handling
try {
  const data = await stateManager.loadData(async () => {
    const response = await fetch('/api/data');
    return response.json();
  });
} catch (error) {
  console.error('Failed to load data:', error);
}

// Get current state
const currentState = stateManager.getState();
```

#### ReactiveStore
Reactive state store with persistence and throttling.

```typescript
const store = new ReactiveStore({
  count: 0,
  user: null
}, {
  name: 'app-state',
  persist: true,
  throttleMs: 100
});

// Subscribe to state changes
const unsubscribe = store.subscribe((state) => {
  console.log('Store updated:', state);
});

// Update state
store.setState({ count: store.getState().count + 1 });
```

### DOM Utilities

#### DOM.create()
Creates DOM elements with options.

```typescript
const element = DOM.create('div', {
  class: 'container',
  id: 'main-container',
  text: 'Hello World',
  attributes: { 'data-id': '123' }
});
```

#### DOM.append()
Appends child elements to parent.

```typescript
DOM.append(parentElement, childElement);
```

#### DOM.remove()
Removes elements from DOM.

```typescript
DOM.remove(element);
```

### Animation System

#### AnimationSequencer
Advanced animation utilities with sequencing and effects.

```typescript
const sequencer = new AnimationSequencer();

// Play animation sequence
await sequencer.playSequence([
  {
    element: element1,
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
    options: { duration: 300 }
  },
  {
    element: element2,
    keyframes: [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }],
    options: { duration: 500 }
  }
]);

// Individual animations
await sequencer.fadeIn(element);
await sequencer.slideIn(element, 'up');
```

#### Animations.fadeIn()
Fade in an element.

```typescript
await Animations.fadeIn(element, duration);
```

#### Animations.fadeOut()
Fade out an element.

```typescript
await Animations.fadeOut(element, duration);
```

### Virtual Scrolling

#### VirtualScroller
Performance-optimized virtual scrolling for large lists.

```typescript
const virtualScroller = new VirtualScroller(containerElement, {
  itemHeight: 50,
  containerHeight: 400
});

// Update with new items
virtualScroller.update(items);
```

### Form Utilities

#### FormBuilder
Advanced form builder with validation and persistence.

```typescript
const formBuilder = new FormBuilder({
  fields: [
    {
      name: 'email',
      required: true,
      validators: [FormValidators.email()]
    },
    {
      name: 'password',
      required: true,
      validators: [FormValidators.minLength(8)]
    }
  ],
  validateOn: 'blur',
  onSubmit: async (data) => {
    console.log('Form submitted:', data);
  }
});

// Set field value
await formBuilder.setValue('email', 'user@example.com');

// Validate all fields
const isValid = await formBuilder.validateAll();

// Submit form
const success = await formBuilder.submit();
```

#### FormValidators
Predefined validation rules.

```typescript
const emailRule = FormValidators.email('Please enter a valid email');
const requiredRule = FormValidators.required('This field is required');
const minLengthRule = FormValidators.minLength(8, 'Must be at least 8 characters');
```

#### FormTransformers
Data transformation utilities.

```typescript
const trimmedValue = FormTransformers.trim(inputValue);
const lowerValue = FormTransformers.toLowerCase(inputValue);
```

### Storage Utilities

#### Storage.set()
Set a value in local storage.

```typescript
Storage.set('key', 'value');
```

#### Storage.get()
Get a value from local storage.

```typescript
const value = Storage.get('key', 'defaultValue');
```

#### Storage.remove()
Remove a value from local storage.

```typescript
Storage.remove('key');
```

### Accessibility Utilities

#### AccessibilityManager
Utilities for improving accessibility.

```typescript
// Make element keyboard accessible
AccessibilityManager.makeKeyboardAccessible(buttonElement, () => {
  console.log('Button clicked');
});

// Announce message to screen readers
AccessibilityManager.announce('Item deleted successfully');

// Trap focus within modal
const untrap = AccessibilityManager.trapFocus(modalElement);
```

## IPC Client API

### window.electronAPI.invoke()
Invoke an IPC handler from renderer.

```typescript
const result = await window.electronAPI.invoke('handler-name', params);
```

### window.electronAPI.send()
Send a message to main process without waiting for response.

```typescript
window.electronAPI.send('channel-name', data);
```

### window.electronAPI.on()
Listen for messages from main process.

```typescript
window.electronAPI.on('channel-name', (event, data) => {
  console.log(data);
});
```

## Configuration API

### Config Management

#### Main Process Config
Located in `/src/main/config.ts`

```typescript
import { getConfig } from './config';
const config = getConfig();
```

#### Renderer Process Config
Located in `/src/renderer/config/`

```typescript
import { appConfig } from './config';
const config = appConfig;
```

## Utility Functions

### Logger
Structured logging utility.

```typescript
import { logger } from './lib/logger';
logger.info('Message', { metadata });
logger.error('Error message', error);
```

### Type Guards
Runtime type checking utilities.

```typescript
import { isString, isObject } from './utils/type-guards';
if (isString(value)) {
  // value is definitely a string
}
```

### Async Utilities
Helper functions for asynchronous operations.

```typescript
import { delay, retry } from './utils/async';
await delay(1000); // Wait 1 second
const result = await retry(asyncFn, 3); // Retry up to 3 times
```

## Platform-Specific APIs

### Platform Detection
Detect the current platform.

```typescript
import { isWindows, isMac, isLinux } from './platform/detection';
if (isMac()) {
  // Mac-specific code
}
```

### Native Dialogs
Platform-native dialog utilities.

```typescript
import { showOpenDialog, showSaveDialog } from './platform/dialogs';
const result = await showOpenDialog({
  filters: [{ name: 'Text Files', extensions: ['txt'] }]
});
```

## Shared Types

### Common Interfaces
Defined in `/src/shared/types/`

```typescript
import { WindowOptions, FileData, SystemInfo } from '../shared/types';
```

## Advanced Shared Utilities

### State Management

#### ReactiveStore
Reactive state management with persistence and throttling.

```typescript
import { ReactiveStore } from '../shared/lib/utils';

const store = new ReactiveStore({
  count: 0,
  user: null
}, {
  name: 'counter-store',
  persist: true,
  throttleMs: 100
});

// Subscribe to changes
const unsubscribe = store.subscribe((state) => {
  console.log('State changed:', state);
});

// Update state
store.setState({ count: 1 });
```

### Caching

#### AdvancedCache
Advanced caching with TTL, size limits, and revalidation.

```typescript
import { AdvancedCache } from '../shared/lib/utils';

const cache = new AdvancedCache({
  maxSize: 100,
  maxAge: 300000 // 5 minutes
});

// Set value with TTL
await cache.set('key', 'value', { maxAge: 60000 }); // 1 minute

// Get value
const value = await cache.get('key');

// Get or set with factory function
const result = await cache.getOrSet('expensive-key', async () => {
  return await expensiveOperation();
});
```

### Form Utilities

#### FormBuilder
Advanced form building and validation (shared between processes).

```typescript
import { FormBuilder, FormValidators } from '../shared/lib/utils';

const formBuilder = new FormBuilder({
  fields: [
    {
      name: 'email',
      required: true,
      validators: [FormValidators.email()]
    }
  ]
});
```

### Network Utilities

#### AdvancedHttpClient
HTTP client with caching, retries, and interceptors.

```typescript
import { AdvancedHttpClient } from '../shared/lib/utils';

const httpClient = new AdvancedHttpClient({
  baseUrl: 'https://api.example.com',
  timeout: 10000,
  retries: 3
});

// Make request with caching
const response = await httpClient.get('/users');

// POST request
const postResponse = await httpClient.post('/users', { name: 'John' });
```

#### WebSocketClient
WebSocket client with auto-reconnection and heartbeats.

```typescript
import { WebSocketClient } from '../shared/lib/utils';

const wsClient = new WebSocketClient('ws://localhost:8080');

wsClient.on('open', () => {
  console.log('Connected');
});

wsClient.onMessage('user-update', (data) => {
  console.log('User updated:', data);
});

wsClient.connect();
```

### Utility Functions

#### memoize
Function memoization for expensive operations.

```typescript
import { memoize } from '../shared/lib/utils';

const expensiveFunction = (a: number, b: number) => {
  // Expensive computation
  return a + b;
};

const memoizedFunction = memoize(expensiveFunction);
```

#### retry
Retry mechanism with exponential backoff.

```typescript
import { retry } from '../shared/lib/utils';

const result = await retry(async () => {
  // Operation that might fail
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}, {
  maxAttempts: 3,
  baseDelay: 1000
});
```

#### RateLimiter
Rate limiting for API calls.

```typescript
import { RateLimiter } from '../shared/lib/utils';

const limiter = new RateLimiter(10, 1000); // 10 calls per second

if (limiter.isAllowed()) {
  // Make API call
} else {
  await limiter.waitForAvailable();
  // Make API call
}
```

## Error Handling

### Custom Errors
Application-specific error types.

```typescript
import { FileNotFoundError, PermissionError } from './errors';
throw new FileNotFoundError(filePath);
```

### Error Boundaries
Component-level error handling with graceful degradation.

```typescript
import { ErrorBoundary } from '../shared/lib/utils';

const boundary = new ErrorBoundary({
  handleError: (error, context) => {
    console.error('Caught error in', context, ':', error);
  },
  getFallback: (error) => {
    return { error: true, message: error.message };
  }
});

try {
  const result = await boundary.execute(async () => {
    // Risky operation
    return await riskyOperation();
  }, 'risky-operation');
} catch (error) {
  // Handle error
}
```