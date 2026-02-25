/**
 * Enhanced DOM utilities for renderer process
 * Provides comprehensive DOM manipulation with TypeScript support and error handling
 */

export interface ElementSelector {
  element: Element | null;
  exists: boolean;
  visible: boolean;
}

export interface ElementStyle {
  [property: string]: string | number;
}

export interface ElementAttributes {
  [attribute: string]: string;
}

export class DOMManager {
  private static instance: DOMManager;
  private mutationObserver: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private constructor() {
    this.setupObservers();
  }

  static getInstance(): DOMManager {
    if (!DOMManager.instance) {
      DOMManager.instance = new DOMManager();
    }
    return DOMManager.instance;
  }

  /**
   * Setup global observers
   */
  private setupObservers(): void {
    // Setup ResizeObserver if available
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const event = new CustomEvent('elementResize', {
            detail: { element: entry.target, contentRect: entry.contentRect },
          });
          entry.target.dispatchEvent(event);
        });
      });
    }
  }

  /**
   * Query selector with enhanced error handling and type safety
   */
  querySelector<T extends Element = Element>(
    selector: string,
    parent: Element | Document = document
  ): ElementSelector {
    try {
      const element = parent.querySelector<T>(selector);
      return {
        element,
        exists: !!element,
        visible: element ? this.isVisible(element) : false,
      };
    } catch (error) {
      console.error(`Error selecting element: ${selector}`, error);
      return {
        element: null,
        exists: false,
        visible: false,
      };
    }
  }

  /**
   * Query selector all with enhanced functionality
   */
  querySelectorAll<T extends Element = Element>(
    selector: string,
    parent: Element | Document = document
  ): T[] {
    try {
      const elements = Array.from(parent.querySelectorAll<T>(selector));
      return elements;
    } catch (error) {
      console.error(`Error selecting elements: ${selector}`, error);
      return [];
    }
  }

  /**
   * Create element with comprehensive options
   */
  createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    options: {
      attributes?: ElementAttributes;
      style?: ElementStyle;
      classes?: string[];
      textContent?: string;
      innerHTML?: string;
      children?: (Element | string)[];
      events?: Record<string, EventListener>;
      dataset?: Record<string, string>;
    } = {}
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);

    // Set attributes
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          element.setAttribute(key, String(value));
        }
      });
    }

    // Set styles
    if (options.style) {
      Object.entries(options.style).forEach(([property, value]) => {
        (element.style as any)[property] = value;
      });
    }

    // Add classes
    if (options.classes) {
      element.classList.add(...options.classes);
    }

    // Set text content
    if (options.textContent) {
      element.textContent = options.textContent;
    }

    // Set inner HTML (use with caution)
    if (options.innerHTML) {
      element.innerHTML = options.innerHTML;
    }

    // Append children
    if (options.children) {
      options.children.forEach((child) => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      });
    }

    // Set dataset
    if (options.dataset) {
      Object.entries(options.dataset).forEach(([key, value]) => {
        (element as any).dataset[key] = value;
      });
    }

    // Add event listeners
    if (options.events) {
      Object.entries(options.events).forEach(([event, handler]) => {
        element.addEventListener(event, handler);
      });
    }

    return element;
  }

  /**
   * Check if element is visible
   */
  isVisible(element: Element): boolean {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      (element as HTMLElement).offsetParent !== null
    );
  }

  /**
   * Add event listener with automatic cleanup
   */
  addEventListener(
    element: Element | Window | Document,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): () => void {
    element.addEventListener(event, handler, options);

    return () => {
      element.removeEventListener(event, handler, options);
    };
  }

  /**
   * Add event listeners to multiple elements
   */
  addEventListeners(
    elements: Element[],
    events: Record<string, EventListener>,
    options?: AddEventListenerOptions
  ): Array<() => void> {
    const cleanupFunctions: Array<() => void> = [];

    elements.forEach((element) => {
      Object.entries(events).forEach(([event, handler]) => {
        const cleanup = this.addEventListener(element, event, handler, options);
        cleanupFunctions.push(cleanup);
      });
    });

    return cleanupFunctions;
  }

  /**
   * Wait for element to appear in DOM
   */
  waitForElement<T extends Element = Element>(
    selector: string,
    timeout: number = 5000,
    parent: Element | Document = document
  ): Promise<T | null> {
    return new Promise((resolve) => {
      // Check if element already exists
      const existing = parent.querySelector<T>(selector);
      if (existing) {
        resolve(existing);
        return;
      }

      // Set up timeout
      const timeoutId = setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);

      // Set up mutation observer
      const observer = new MutationObserver(() => {
        const element = parent.querySelector<T>(selector);
        if (element) {
          clearTimeout(timeoutId);
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(parent, {
        childList: true,
        subtree: true,
      });
    });
  }

  /**
   * Add resize observer to element
   */
  observeResize(element: Element, callback: ResizeObserverCallback): () => void {
    if (!this.resizeObserver) {
      console.warn('ResizeObserver not supported');
      return () => {};
    }

    this.resizeObserver.observe(element);
    const resizeObserver = this.resizeObserver;

    return () => {
      resizeObserver.unobserve(element);
    };
  }

  /**
   * Add mutation observer to element
   */
  observeMutations(
    element: Element,
    callback: MutationCallback,
    options: MutationObserverInit = { childList: true, subtree: true }
  ): () => void {
    const observer = new MutationObserver(callback);
    observer.observe(element, options);

    return () => {
      observer.disconnect();
    };
  }

  /**
   * Smooth scroll to element
   */
  scrollToElement(element: Element, options: ScrollIntoViewOptions = {}): void {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
      ...options,
    });
  }

  /**
   * Animate element properties
   */
  animate(
    element: Element,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions = {}
  ): Animation {
    return element.animate(keyframes, options);
  }

  /**
   * Fade in element
   */
  fadeIn(element: Element, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      element.classList.add('fade-in');

      const animation = element.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration,
        easing: 'ease-in-out',
      });

      animation.onfinish = () => {
        element.classList.remove('fade-in');
        resolve();
      };
    });
  }

  /**
   * Fade out element
   */
  fadeOut(element: Element, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      const animation = element.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration,
        easing: 'ease-in-out',
      });

      animation.onfinish = () => {
        (element as HTMLElement).style.display = 'none';
        resolve();
      };
    });
  }

  /**
   * Set element focus with trap management
   */
  setFocus(element: HTMLElement, trapFocus: boolean = false): void {
    element.focus();

    if (trapFocus) {
      // Focus trap implementation
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      element.addEventListener('keydown', handleTabKey);
    }
  }

  /**
   * Remove element with animation
   */
  removeWithAnimation(
    element: Element,
    animationType: 'fade' | 'scale' | 'slide' = 'fade'
  ): Promise<void> {
    return new Promise((resolve) => {
      let keyframes: Keyframe[];

      switch (animationType) {
        case 'scale':
          keyframes = [
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(0)', opacity: 0 },
          ];
          break;
        case 'slide':
          keyframes = [
            { transform: 'translateX(0)', opacity: 1 },
            { transform: 'translateX(100%)', opacity: 0 },
          ];
          break;
        case 'fade':
        default:
          keyframes = [{ opacity: 1 }, { opacity: 0 }];
          break;
      }

      const animation = element.animate(keyframes, {
        duration: 300,
        easing: 'ease-in-out',
      });

      animation.onfinish = () => {
        element.remove();
        resolve();
      };
    });
  }

  /**
   * Clean up all observers
   */
  cleanup(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}

// Export singleton instance
export const dom = DOMManager.getInstance();
