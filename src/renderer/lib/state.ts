/**
 * Enhanced state management utilities for renderer process
 */

import { ReactiveStore, AdvancedCache, ErrorBoundary } from '../../shared/lib/utils/index.js';

export interface ComponentState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}

export class ComponentStateManager<T> {
  private store: ReactiveStore<ComponentState<T>>;
  private cache: AdvancedCache;

  constructor(initialData: T, componentName: string) {
    this.store = new ReactiveStore<ComponentState<T>>({
      data: initialData,
      loading: false,
      error: null,
      lastUpdated: null
    }, {
      name: `${componentName}_state`,
      persist: true,
      throttleMs: 100
    });

    this.cache = new AdvancedCache({
      maxSize: 100,
      maxAge: 300000 // 5 minutes
    });
  }

  async loadData(loader: () => Promise<T>): Promise<T> {
    this.updateState({ loading: true, error: null });

    try {
      const data = await loader();
      this.updateState({ 
        data, 
        loading: false, 
        error: null, 
        lastUpdated: new Date() 
      });
      return data;
    } catch (error) {
      this.updateState({ 
        loading: false, 
        error: error as Error 
      });
      throw error;
    }
  }

  getState(): ComponentState<T> {
    return this.store.getState();
  }

  subscribe(listener: (state: ComponentState<T>) => void): () => void {
    return this.store.subscribe(listener);
  }

  async setData(data: T): Promise<void> {
    this.updateState({ data, lastUpdated: new Date() });
  }

  setError(error: Error): void {
    this.updateState({ error, loading: false });
  }

  setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  private updateState(updates: Partial<ComponentState<T>>): void {
    this.store.setState(prevState => ({
      ...prevState,
      ...updates
    }));
  }

  async clearError(): Promise<void> {
    this.updateState({ error: null });
  }

  destroy(): void {
    this.store.destroy();
  }
}

/**
 * Virtual scrolling utilities for performance optimization
 */
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  buffer?: number;
}

export class VirtualScroller {
  private container: HTMLElement;
  private options: VirtualScrollOptions;
  private startIndex: number = 0;
  private endIndex: number = 0;
  private items: any[] = [];
  private itemElements: HTMLElement[] = [];
  private scrollListener: () => void;

  constructor(container: HTMLElement, options: VirtualScrollOptions) {
    this.container = container;
    this.options = {
      buffer: 5,
      ...options
    };
    
    this.scrollListener = this.handleScroll.bind(this);
    this.container.addEventListener('scroll', this.scrollListener);
  }

  update(items: any[]): void {
    this.items = items;
    this.calculateVisibleRange();
    this.renderVisibleItems();
  }

  private calculateVisibleRange(): void {
    const scrollTop = this.container.scrollTop;
    const visibleStartIndex = Math.floor(scrollTop / this.options.itemHeight);
    const visibleCount = Math.ceil(this.options.containerHeight / this.options.itemHeight);
    
    this.startIndex = Math.max(0, visibleStartIndex - this.options.buffer!);
    this.endIndex = Math.min(
      this.items.length,
      visibleStartIndex + visibleCount + this.options.buffer!
    );
  }

  private renderVisibleItems(): void {
    // Clear existing items
    this.container.innerHTML = '';
    
    // Create container for visible items
    const visibleContainer = document.createElement('div');
    visibleContainer.style.position = 'relative';
    visibleContainer.style.height = `${this.items.length * this.options.itemHeight}px`;
    visibleContainer.style.width = '100%';
    
    // Position visible items
    for (let i = this.startIndex; i < this.endIndex; i++) {
      const item = this.items[i];
      const itemElement = this.createItemElement(item, i);
      itemElement.style.position = 'absolute';
      itemElement.style.top = `${i * this.options.itemHeight}px`;
      itemElement.style.width = '100%';
      visibleContainer.appendChild(itemElement);
    }
    
    this.container.appendChild(visibleContainer);
  }

  private createItemElement(item: any, index: number): HTMLElement {
    const element = document.createElement('div');
    element.className = 'virtual-scroll-item';
    element.style.height = `${this.options.itemHeight}px`;
    element.textContent = typeof item === 'object' ? JSON.stringify(item) : String(item);
    return element;
  }

  private handleScroll(): void {
    this.calculateVisibleRange();
    this.renderVisibleItems();
  }

  destroy(): void {
    this.container.removeEventListener('scroll', this.scrollListener);
  }
}

/**
 * Drag and drop utilities
 */
export interface DragDropOptions {
  dragClass?: string;
  dropClass?: string;
  onDragStart?: (element: HTMLElement, event: DragEvent) => void;
  onDragOver?: (element: HTMLElement, event: DragEvent) => void;
  onDrop?: (element: HTMLElement, event: DragEvent) => void;
}

export class DragDropManager {
  private options: DragDropOptions;

  constructor(options: DragDropOptions = {}) {
    this.options = {
      dragClass: 'dragging',
      dropClass: 'drop-target',
      ...options
    };
  }

  enableDrag(element: HTMLElement, dataTransfer: (dt: DataTransfer) => void): void {
    element.draggable = true;
    
    element.addEventListener('dragstart', (event) => {
      if (this.options.dragClass) {
        element.classList.add(this.options.dragClass);
      }
      
      if (event.dataTransfer) {
        dataTransfer(event.dataTransfer);
        event.dataTransfer.effectAllowed = 'move';
      }
      
      if (this.options.onDragStart) {
        this.options.onDragStart(element, event);
      }
    });

    element.addEventListener('dragend', (event) => {
      if (this.options.dragClass) {
        element.classList.remove(this.options.dragClass);
      }
    });
  }

  enableDrop(element: HTMLElement): void {
    element.addEventListener('dragover', (event) => {
      event.preventDefault(); // Necessary to allow drop
      
      if (this.options.dropClass) {
        element.classList.add(this.options.dropClass);
      }
      
      if (this.options.onDragOver) {
        this.options.onDragOver(element, event);
      }
    });

    element.addEventListener('dragleave', (event) => {
      if (this.options.dropClass) {
        element.classList.remove(this.options.dropClass);
      }
    });

    element.addEventListener('drop', (event) => {
      event.preventDefault();
      
      if (this.options.dropClass) {
        element.classList.remove(this.options.dropClass);
      }
      
      if (this.options.onDrop) {
        this.options.onDrop(element, event);
      }
    });
  }
}

/**
 * Accessibility utilities
 */
export class AccessibilityManager {
  static makeFocusable(element: HTMLElement): void {
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }
  }

  static makeKeyboardAccessible(element: HTMLElement, onClick: () => void): void {
    this.makeFocusable(element);
    
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    });
    
    element.addEventListener('click', onClick);
  }

  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only'; // Screen reader only
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  static trapFocus(element: HTMLElement): () => void {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }
}

/**
 * Enhanced animation utilities
 */
export interface AnimationSequenceStep {
  element: HTMLElement;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

export class AnimationSequencer {
  private sequences: Animation[] = [];

  async playSequence(steps: AnimationSequenceStep[], staggerDelay: number = 100): Promise<void> {
    this.sequences = []; // Clear previous sequences
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, staggerDelay));
      }
      
      const animation = step.element.animate(step.keyframes, step.options);
      this.sequences.push(animation);
      
      await animation.finished;
    }
  }

  async fadeIn(element: HTMLElement, duration: number = 300): Promise<void> {
    const animation = element.animate([
      { opacity: 0 },
      { opacity: 1 }
    ], {
      duration,
      easing: 'ease-out'
    });
    
    await animation.finished;
  }

  async fadeOut(element: HTMLElement, duration: number = 300): Promise<void> {
    const animation = element.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], {
      duration,
      easing: 'ease-out'
    });
    
    await animation.finished;
  }

  async slideIn(element: HTMLElement, direction: 'left' | 'right' | 'up' | 'down' = 'up', duration: number = 300): Promise<void> {
    let keyframes: Keyframe[];
    
    switch (direction) {
      case 'left':
        keyframes = [
          { transform: 'translateX(-100%)', opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 }
        ];
        break;
      case 'right':
        keyframes = [
          { transform: 'translateX(100%)', opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 }
        ];
        break;
      case 'up':
        keyframes = [
          { transform: 'translateY(100%)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ];
        break;
      case 'down':
        keyframes = [
          { transform: 'translateY(-100%)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ];
        break;
    }
    
    const animation = element.animate(keyframes, {
      duration,
      easing: 'ease-out'
    });
    
    await animation.finished;
  }

  cancelAll(): void {
    this.sequences.forEach(animation => {
      if (animation.playState !== 'finished') {
        animation.cancel();
      }
    });
    this.sequences = [];
  }
}