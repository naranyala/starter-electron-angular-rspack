/**
 * UI utility functions for Electron renderer process
 */

/**
 * Show a toast notification
 */
export function showToast(
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info',
  duration: number = 3000
): void {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  // Add basic styles if not present
  const styleId = 'toast-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 4px;
        color: white;
        font-size: 14px;
        z-index: 9999;
        opacity: 0;
        transform: translateX(100%);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      
      .toast.show {
        opacity: 1;
        transform: translateX(0);
      }
      
      .toast-success { background-color: #28a745; }
      .toast-error { background-color: #dc3545; }
      .toast-warning { background-color: #ffc107; color: #212529; }
      .toast-info { background-color: #17a2b8; }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // Trigger show animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
}

/**
 * Show a confirmation dialog
 */
export async function showConfirmationDialog(
  message: string,
  title: string = 'Confirm'
): Promise<boolean> {
  return new Promise((resolve) => {
    const result = confirm(`${title}\n\n${message}`);
    resolve(result);
  });
}

/**
 * Focus an element with options
 */
export function focusElement(element: HTMLElement, options?: FocusOptions): void {
  requestAnimationFrame(() => {
    element.focus(options);
  });
}

/**
 * Scroll to an element smoothly
 */
export function scrollToElement(element: Element, behavior: ScrollBehavior = 'smooth'): void {
  element.scrollIntoView({ behavior, block: 'start' });
}

/**
 * Add loading state to an element
 */
export function setLoadingState(element: HTMLElement, isLoading: boolean): void {
  if (isLoading) {
    element.setAttribute('data-loading', 'true');
    element.classList.add('loading');
  } else {
    element.removeAttribute('data-loading');
    element.classList.remove('loading');
  }
}

/**
 * Create a DOM element with attributes and children
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attrs?: Partial<HTMLElement>,
  children?: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.substring(2).toLowerCase(), value as EventListener);
      } else if (key === 'className') {
        element.className = value as string;
      } else if (key === 'textContent' || key === 'innerHTML') {
        element[key] = value as string;
      } else if (typeof value === 'string' || typeof value === 'number') {
        element.setAttribute(key, String(value));
      } else if (typeof value === 'boolean') {
        if (value) {
          element.setAttribute(key, '');
        } else {
          element.removeAttribute(key);
        }
      }
    });
  }

  if (children) {
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }

  return element;
}

/**
 * Check if an element is in the viewport
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Get the visible percentage of an element
 */
export function getElementVisibilityPercentage(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  if (rect.bottom < 0 || rect.top > windowHeight) {
    return 0;
  }

  const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
  return Math.max(0, Math.min(1, visibleHeight / rect.height)) * 100;
}

/**
 * Disable page scrolling
 */
export function disableScroll(): void {
  document.body.style.overflow = 'hidden';
}

/**
 * Enable page scrolling
 */
export function enableScroll(): void {
  document.body.style.overflow = '';
}
