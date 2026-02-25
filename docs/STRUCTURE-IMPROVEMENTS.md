# Project Structure Improvements

## Executive Summary

This document outlines a phased approach to improve modularity and scalability of the Electron + Angular application.

---

## Phase 1: Quick Wins (1-2 days)

### 1.1 Clean Up Empty Directories

**Action:** Remove 15+ empty directories that add confusion

```bash
# Backend
rm -rf src/main/components
rm -rf src/main/constants
rm -rf src/main/ipc
rm -rf src/main/types

# Renderer
rm -rf src/renderer/config
rm -rf src/renderer/ipc

# Shared
rm -rf src/shared/app
rm -rf src/shared/components
rm -rf src/shared/config
rm -rf src/shared/hooks
rm -rf src/shared/ipc
rm -rf src/shared/platform
rm -rf src/shared/services
rm -rf src/shared/utils
```

### 1.2 Consolidate Utility Files

**Current:** 20+ utility files across 4 locations
**Target:** Single source of truth in `src/shared/utils/`

**Action:**
1. Keep only in `src/shared/utils/`:
   - `array.utils.ts`
   - `async.utils.ts`
   - `date.utils.ts`
   - `object.utils.ts`
   - `string.utils.ts`
   - `validation.utils.ts`
   - `index.ts` (barrel export)

2. Delete duplicates:
   - `src/main/lib/utils.ts`
   - `src/main/lib/utils-enhanced.ts`
   - `src/renderer/lib/utils.ts`
   - `src/renderer/lib/utils-enhanced.ts`
   - `src/renderer/lib/ui-utils.ts`

### 1.3 Standardize Naming Conventions

**Adopt this standard:**

| Suffix | Use For | Example |
|--------|---------|---------|
| `*Service` | Injectable services | `LoggerService`, `WindowService` |
| `*Manager` | Non-injectable utilities | `WindowManager`, `AppManager` |
| `*ViewModel` | State management | `EventBusViewModel`, `LoggingViewModel` |
| `*UseCase` | Business logic | `CreateWindowUseCase` |
| `*Facade` | API abstraction | `WindowFacade`, `IpcFacade` |
| `*.types.ts` | TypeScript types | `window.types.ts`, `ipc.types.ts` |
| `*.config.ts` | Configuration | `app.config.ts`, `logging.config.ts` |

---

## Phase 2: Decoupling (3-5 days)

### 2.1 Extract Window Management from AppComponent

**Problem:** AppComponent has 150+ lines of WinBox management logic

**Solution:** Create `WindowFacade` service

**New File:** `frontend/src/core/window/window.facade.ts`

```typescript
import { Injectable } from '@angular/core';
import { WinBoxService, type WinBoxInstance } from './winbox.service.js';
import { type Card } from '../../models/card.model.js';
import { getLogger } from '../../viewmodels/logger.viewmodel.js';

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Injectable({ providedIn: 'root' })
export class WindowFacade {
  private readonly logger = getLogger('window.facade');
  private readonly windows = new Map<string, WinBoxInstance>();
  private readonly windowIdByCardId = new Map<number, string>();

  constructor(private winboxService: WinBoxService) {}

  /**
   * Open a window for a card
   */
  openCard(card: Card): WinBoxInstance | null {
    const windowId = `card-${card.id}`;
    
    if (this.windows.has(windowId)) {
      const existing = this.windows.get(windowId);
      existing?.focus();
      return existing || null;
    }

    const box = this.winboxService.create({
      id: windowId,
      title: card.title,
      width: 400,
      height: 300,
      x: 'center',
      y: 'center',
    });

    if (box) {
      this.windows.set(windowId, box);
      this.windowIdByCardId.set(card.id, windowId);
      
      box.onclose = () => {
        this.windows.delete(windowId);
        this.logger.debug('Window closed', { windowId, cardId: card.id });
      };
      
      this.logger.info('Window opened', { windowId, cardId: card.id });
    }

    return box;
  }

  /**
   * Close a specific window
   */
  close(windowId: string): boolean {
    const box = this.windows.get(windowId);
    if (box) {
      box.close();
      this.windows.delete(windowId);
      return true;
    }
    return false;
  }

  /**
   * Close all windows
   */
  closeAll(): void {
    this.windows.forEach(box => box.close());
    this.windows.clear();
    this.windowIdByCardId.clear();
  }

  /**
   * Resize all windows
   */
  resizeAllWindows(bounds: Partial<WindowBounds>): void {
    this.windows.forEach(box => {
      if (bounds.width) box.resize(bounds.width as any, undefined as any);
      if (bounds.height) box.resize(undefined as any, bounds.height as any);
    });
  }

  /**
   * Get window by card ID
   */
  getByCardId(cardId: number): WinBoxInstance | null {
    const windowId = this.windowIdByCardId.get(cardId);
    return windowId ? this.windows.get(windowId) || null : null;
  }

  /**
   * Get statistics
   */
  getStats(): { open: number; windowIds: string[] } {
    return {
      open: this.windows.size,
      windowIds: Array.from(this.windows.keys()),
    };
  }
}
```

**Update:** `frontend/src/views/app.component.ts`

```typescript
// BEFORE (150+ lines of window management)
private existingBoxes: WinBoxInstance[] = [];
private windowIdByCardId = new Map<number, string>();

openCard(card: Card): void {
  // 50+ lines of window creation logic
}

// AFTER (delegate to facade)
constructor(
  private windowFacade: WindowFacade,
  // ... other services
) {}

openCard(card: Card): void {
  this.windowFacade.openCard(card);
}
```

**Benefits:**
- AppComponent reduced by 150+ lines
- Window logic testable in isolation
- Single responsibility principle

### 2.2 Create Search Service

**New File:** `frontend/src/features/search/search.service.ts`

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { type Card } from '../../models/card.model.js';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly searchQuery = signal('');
  
  readonly filteredCards = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.allCards();
    
    return this.allCards().filter(card => 
      card.title.toLowerCase().includes(query) ||
      card.description?.toLowerCase().includes(query)
    );
  });

  constructor(private allCards: () => Card[]) {}

  search(query: string): Card[] {
    this.searchQuery.set(query);
    return this.filteredCards();
  }

  clear(): void {
    this.searchQuery.set('');
  }

  getQuery(): string {
    return this.searchQuery();
  }
}
```

### 2.3 Unify IPC Pattern

**New Structure:**

```
src/shared/ipc/
├── channels.ts              # All channel definitions
├── types.ts                 # IPC type definitions
├── main/
│   └── ipc.main.ts          # Main process IPC handler
└── preload/
    └── ipc.preload.ts       # Preload API
```

**New File:** `src/shared/ipc/channels.ts`

```typescript
/**
 * Centralized IPC channel definitions
 * Import this file everywhere instead of hardcoded strings
 */
export const IPC_CHANNELS = {
  // Logging
  LOG: {
    WRITE: 'log:write',
    GET_LEVEL: 'log:get-level',
    SET_LEVEL: 'log:set-level',
  },
  // Window Management
  WINDOW: {
    CREATE: 'window:create',
    CLOSE: 'window:close',
    GET_ALL: 'window:get-all',
  },
  // Application
  APP: {
    INFO: 'get-app-info',
    QUIT: 'app:quit',
    SHOW_MESSAGE: 'show-message',
  },
} as const;

export type IpcChannel = typeof IPC_CHANNELS;
export type LogChannels = typeof IPC_CHANNELS.LOG;
export type WindowChannels = typeof IPC_CHANNELS.WINDOW;
export type AppChannels = typeof IPC_CHANNELS.APP;
```

**Usage:**
```typescript
// BEFORE
ipcMain.handle('log:write', async () => {...});

// AFTER
import { IPC_CHANNELS } from '@shared/ipc/channels';
ipcMain.handle(IPC_CHANNELS.LOG.WRITE, async () => {...});
```

---

## Phase 3: Architecture (5-10 days)

### 3.1 Implement Feature Modules (Angular)

**New Structure:**

```
frontend/src/
├── app/
│   ├── app.component.ts     # Simplified shell
│   ├── app.config.ts
│   └── app.routes.ts
├── features/
│   ├── home/
│   │   ├── home.component.ts
│   │   ├── home.module.ts
│   │   └── home.routes.ts
│   ├── demo/
│   │   ├── demo.component.ts
│   │   ├── demo.module.ts
│   │   └── demo.routes.ts
│   └── devtools/
│       ├── devtools.component.ts
│       └── devtools.module.ts
└── core/                    # Shared core services only
```

**Example:** `frontend/src/features/home/home.module.ts`

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home.routes';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
  ],
})
export class HomeModule {}
```

**Example:** `frontend/src/app.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.module')
      .then(m => m.HomeModule),
  },
  {
    path: 'demo',
    loadChildren: () => import('./features/demo/demo.module')
      .then(m => m.DemoModule),
  },
  {
    path: 'devtools',
    loadChildren: () => import('./features/devtools/devtools.module')
      .then(m => m.DevToolsModule),
  },
  { path: '**', redirectTo: '' },
];
```

### 3.2 Externalize Configuration

**New File:** `config/app.config.json`

```json
{
  "window": {
    "defaultWidth": 1200,
    "defaultHeight": 800,
    "minWidth": 400,
    "minHeight": 300,
    "center": true
  },
  "features": {
    "devTools": true,
    "logging": {
      "level": "INFO",
      "showSource": true,
      "prettyPrint": true
    }
  },
  "environment": "development"
}
```

**New File:** `src/main/config/config.loader.ts`

```typescript
import { app } from 'electron';
import * as path from 'node:path';
import { promises as fs } from 'node:fs';

export interface AppConfig {
  window: {
    defaultWidth: number;
    defaultHeight: number;
    minWidth: number;
    minHeight: number;
    center: boolean;
  };
  features: {
    devTools: boolean;
    logging: {
      level: string;
      showSource: boolean;
      prettyPrint: boolean;
    };
  };
  environment: 'development' | 'production';
}

const DEFAULT_CONFIG: AppConfig = {
  window: {
    defaultWidth: 1200,
    defaultHeight: 800,
    minWidth: 400,
    minHeight: 300,
    center: true,
  },
  features: {
    devTools: true,
    logging: {
      level: 'INFO',
      showSource: true,
      prettyPrint: true,
    },
  },
  environment: 'development',
};

export async function loadConfig(): Promise<AppConfig> {
  try {
    const configPath = path.join(process.cwd(), 'config', 'app.config.json');
    const content = await fs.readFile(configPath, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(content) };
  } catch {
    return DEFAULT_CONFIG;
  }
}
```

### 3.3 Create App Facade for Main Process

**New File:** `src/main/app/app.facade.ts`

```typescript
import { container } from '../di/index.js';
import { LoggerService } from '../services/logger.service.js';
import { WindowService } from '../services/window.service.js';
import { IpcHandlerService } from '../services/ipc-handler.service.js';

/**
 * Main Process Facade
 * Simplifies access to main process functionality
 */
export class AppFacade {
  constructor(private container = container) {}

  get logger(): LoggerService {
    return this.container.resolve(LoggerService);
  }

  get windows(): WindowService {
    return this.container.resolve(WindowService);
  }

  get ipc(): IpcHandlerService {
    return this.container.resolve(IpcHandlerService);
  }

  async initialize(): Promise<void> {
    this.logger.info('app', 'Application initializing');
    this.ipc.registerHandlers();
    this.logger.info('app', 'Application initialized');
  }

  async shutdown(): Promise<void> {
    this.logger.info('app', 'Application shutting down');
    this.windows.closeAll();
  }
}

export const appFacade = new AppFacade();
```

**Update:** `src/main/index.ts` (simplified)

```typescript
import { app } from 'electron';
import { appFacade } from './app/app.facade.js';
import { WindowService } from './services/window.service.js';
import { container } from './di/index.js';

let mainWindow: Electron.BrowserWindow | null = null;

app.whenReady().then(async () => {
  await appFacade.initialize();
  
  const windowService = container.resolve(WindowService);
  mainWindow = windowService.create({
    id: 'main',
    title: 'Electron Angular Rspack',
    width: 1200,
    height: 800,
  });
  
  // Load frontend...
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    appFacade.shutdown();
    app.quit();
  }
});
```

---

## Phase 4: Testing & Documentation (2-3 days)

### 4.1 Add Unit Tests for Extracted Services

```typescript
// frontend/src/core/window/window.facade.spec.ts
describe('WindowFacade', () => {
  let facade: WindowFacade;
  let mockWinboxService: jasmine.SpyObj<WinBoxService>;

  beforeEach(() => {
    mockWinboxService = jasmine.createSpyObj('WinBoxService', ['create']);
    facade = new WindowFacade(mockWinboxService);
  });

  it('should open a new window for a card', () => {
    const card = { id: 1, title: 'Test' } as Card;
    mockWinboxService.create.and.returnValue({} as WinBoxInstance);

    facade.openCard(card);

    expect(mockWinboxService.create).toHaveBeenCalled();
    expect(facade.getStats().open).toBe(1);
  });

  it('should focus existing window if already open', () => {
    // Test implementation
  });
});
```

### 4.2 Update Documentation

Create `ARCHITECTURE.md` with:
- Module dependency diagram
- Service communication flow
- IPC channel reference
- Configuration options

---

## Migration Checklist

### Phase 1: Quick Wins
- [ ] Remove empty directories
- [ ] Consolidate utility files
- [ ] Update naming conventions
- [ ] Update imports across codebase

### Phase 2: Decoupling
- [ ] Create WindowFacade
- [ ] Extract window logic from AppComponent
- [ ] Create SearchService
- [ ] Unify IPC channels

### Phase 3: Architecture
- [ ] Create feature modules
- [ ] Implement lazy loading routes
- [ ] Externalize configuration
- [ ] Create AppFacade

### Phase 4: Testing
- [ ] Add tests for WindowFacade
- [ ] Add tests for SearchService
- [ ] Add tests for IPC channels
- [ ] Update architecture documentation

---

## Expected Outcomes

| Metric | Before | After |
|--------|--------|-------|
| AppComponent lines | 600+ | ~100 |
| IPC locations | 5 | 1 |
| Empty directories | 15+ | 0 |
| Utility files | 20+ | 6 |
| Feature modules | 0 | 3+ |
| Testable services | Low | High |
| Lazy loading | No | Yes |

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing functionality | High | Comprehensive testing, phased rollout |
| Team learning curve | Medium | Documentation, code reviews |
| Refactoring time | Medium | Prioritize high-impact changes first |
| DI system confusion | Low | Clear guidelines, examples |

---

## Next Steps

1. **Review this document** with team
2. **Prioritize phases** based on timeline
3. **Create GitHub issues** for each task
4. **Start with Phase 1** (quick wins)
5. **Measure progress** with metrics above
