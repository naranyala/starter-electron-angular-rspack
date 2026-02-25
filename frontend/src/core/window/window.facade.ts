/**
 * Window Facade Service
 * 
 * Provides a simplified API for window management in the Angular frontend.
 * Encapsulates WinBox complexity and provides a clean interface for components.
 * 
 * Usage:
 *   constructor(private windowFacade: WindowFacade) {}
 *   
 *   openCard(card: Card) {
 *     this.windowFacade.openCard(card);
 *   }
 */

import { Injectable } from '@angular/core';
import { type Card } from '../../models/card.model.js';
import { getLogger } from '../../viewmodels/logger.viewmodel.js';
import { EventBusViewModel } from '../../viewmodels/event-bus.viewmodel.js';
import { WinBoxService, type WinBoxInstance, type WinBoxOptions } from '../winbox.service.js';

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowStats {
  open: number;
  windowIds: string[];
  maximized: number;
}

@Injectable({ providedIn: 'root' })
export class WindowFacade {
  private readonly logger = getLogger('window.facade');
  private readonly windows = new Map<string, WinBoxInstance>();
  private readonly windowIdByCardId = new Map<number, string>();
  private readonly eventBus: EventBusViewModel<Record<string, unknown>>;
  private readonly winboxService: WinBoxService;
  private defaultWidth = 400;
  private defaultHeight = 300;

  constructor() {
    // Get event bus from global or create new
    const debugWindow = window as unknown as {
      __FRONTEND_EVENT_BUS__?: EventBusViewModel<Record<string, unknown>>;
    };
    this.eventBus = debugWindow.__FRONTEND_EVENT_BUS__ ?? new EventBusViewModel();
    
    // Create WinBox service instance directly to avoid DI issues
    this.winboxService = new WinBoxService();
    
    this.logger.info('Window facade initialized');
  }

  /**
   * Set default window dimensions
   */
  setDefaultSize(width: number, height: number): void {
    this.defaultWidth = width;
    this.defaultHeight = height;
    this.logger.debug('Default window size updated', { width, height });
  }

  /**
   * Open a window for a card
   * Returns existing window if already open, otherwise creates new one
   */
  openCard(card: Card): WinBoxInstance | null {
    const windowId = `card-${card.id}`;
    
    // Check if window already exists
    if (this.windows.has(windowId)) {
      const existing = this.windows.get(windowId);
      if (existing) {
        existing.focus();
        this.logger.debug('Focused existing window', { windowId, cardId: card.id });
        this.publishEvent('window-focused', { windowId, cardId: card.id });
        return existing;
      }
    }

    // Create new window
    const options: WinBoxOptions = {
      id: windowId,
      title: card.title,
      width: this.defaultWidth,
      height: this.defaultHeight,
      x: 'center',
      y: 'center',
      controls: {
        minimize: true,
        maximize: true,
        close: true,
      },
      onclose: () => {
        this.windows.delete(windowId);
        this.windowIdByCardId.delete(card.id);
        this.logger.debug('Window closed', { windowId, cardId: card.id });
        this.publishEvent('window-closed', { windowId, cardId: card.id });
        return undefined;
      },
      onfocus: () => {
        this.logger.debug('Window focused', { windowId, cardId: card.id });
        this.publishEvent('window-focused', { windowId, cardId: card.id });
      },
    };

    const box = this.winboxService.create(options);
    
    if (!box) {
      this.logger.error('Failed to create window', { windowId, cardId: card.id });
      return null;
    }

    // Store reference
    this.windows.set(windowId, box);
    this.windowIdByCardId.set(card.id, windowId);

    this.logger.info('Window opened', { windowId, cardId: card.id });
    this.publishEvent('window-opened', { windowId, cardId: card.id, title: card.title });

    return box;
  }

  /**
   * Close a specific window by ID
   */
  close(windowId: string): boolean {
    const box = this.windows.get(windowId);
    if (box) {
      const closed = box.close();
      if (closed) {
        this.windows.delete(windowId);
        this.logger.debug('Window closed', { windowId });
        this.publishEvent('window-closed', { windowId });
      }
      return closed;
    }
    this.logger.warn('Window not found', { windowId });
    return false;
  }

  /**
   * Close window by card ID
   */
  closeByCardId(cardId: number): boolean {
    const windowId = this.windowIdByCardId.get(cardId);
    if (windowId) {
      return this.close(windowId);
    }
    return false;
  }

  /**
   * Close all windows
   */
  closeAll(): void {
    const count = this.windows.size;
    this.windows.forEach((box, windowId) => {
      box.close();
      this.windows.delete(windowId);
    });
    this.windowIdByCardId.clear();
    this.logger.info('All windows closed', { count });
    this.publishEvent('windows-all-closed', { count });
  }

  /**
   * Resize a specific window
   */
  resize(windowId: string, bounds: Partial<WindowBounds>): boolean {
    const box = this.windows.get(windowId);
    if (!box) {
      this.logger.warn('Window not found for resize', { windowId });
      return false;
    }

    if (bounds.width) {
      box.resize(bounds.width as any, undefined as any);
    }
    if (bounds.height) {
      box.resize(undefined as any, bounds.height as any);
    }
    if (bounds.x !== undefined || bounds.y !== undefined) {
      box.move(bounds.x as any, bounds.y as any);
    }

    this.logger.debug('Window resized', { windowId, bounds });
    this.publishEvent('window-resized', { windowId, bounds });
    return true;
  }

  /**
   * Resize all windows
   */
  resizeAllWindows(bounds: Partial<WindowBounds>): void {
    let count = 0;
    this.windows.forEach((box, windowId) => {
      if (this.resize(windowId, bounds)) {
        count++;
      }
    });
    this.logger.debug('All windows resized', { count, bounds });
  }

  /**
   * Focus a specific window
   */
  focus(windowId: string): boolean {
    const box = this.windows.get(windowId);
    if (box) {
      box.focus();
      this.logger.debug('Window focused', { windowId });
      return true;
    }
    return false;
  }

  /**
   * Get window by card ID
   */
  getByCardId(cardId: number): WinBoxInstance | null {
    const windowId = this.windowIdByCardId.get(cardId);
    return windowId ? this.windows.get(windowId) || null : null;
  }

  /**
   * Get window by ID
   */
  getById(windowId: string): WinBoxInstance | null {
    return this.windows.get(windowId) || null;
  }

  /**
   * Check if window exists
   */
  hasWindow(windowId: string): boolean {
    return this.windows.has(windowId);
  }

  /**
   * Check if card window exists
   */
  hasCardWindow(cardId: number): boolean {
    const windowId = this.windowIdByCardId.get(cardId);
    return windowId ? this.windows.has(windowId) : false;
  }

  /**
   * Get statistics
   */
  getStats(): WindowStats {
    const windowIds = Array.from(this.windows.keys());
    const maximized = Array.from(this.windows.values()).filter(
      box => (box as any).__isMaximized
    ).length;

    return {
      open: this.windows.size,
      windowIds,
      maximized,
    };
  }

  /**
   * Get all window instances
   */
  getAll(): Array<{ id: string; cardId?: number; instance: WinBoxInstance }> {
    return Array.from(this.windows.entries()).map(([id, instance]) => ({
      id,
      cardId: this.findCardIdByWindowId(id),
      instance,
    }));
  }

  /**
   * Minimize all windows
   */
  minimizeAll(): void {
    this.windows.forEach(box => box.minimize());
    this.logger.debug('All windows minimized');
    this.publishEvent('windows-all-minimized', { count: this.windows.size });
  }

  /**
   * Restore all minimized windows
   */
  restoreAll(): void {
    this.windows.forEach(box => box.restore());
    this.logger.debug('All windows restored');
    this.publishEvent('windows-all-restored', { count: this.windows.size });
  }

  private publishEvent(name: string, payload: Record<string, unknown>): void {
    this.eventBus.publish(`window:${name}`, payload);
  }

  private findCardIdByWindowId(windowId: string): number | undefined {
    for (const [cardId, wid] of this.windowIdByCardId.entries()) {
      if (wid === windowId) {
        return cardId;
      }
    }
    return undefined;
  }
}
