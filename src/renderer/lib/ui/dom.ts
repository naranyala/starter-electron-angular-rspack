export function findElement<T extends HTMLElement>(selector: string): T | null {
  return document.querySelector(selector) as T | null;
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Record<string, string> = {},
  children: (string | HTMLElement)[] = []
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }

  for (const child of children) {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  }

  return element;
}

export function addClass(selector: string, className: string): void {
  const element = document.querySelector(selector);
  element?.classList.add(className);
}

export function removeClass(selector: string, className: string): void {
  const element = document.querySelector(selector);
  element?.classList.remove(className);
}

export function toggleClass(selector: string, className: string): void {
  const element = document.querySelector(selector);
  element?.classList.toggle(className);
}

export function showElement(selector: string): void {
  const element = document.querySelector(selector);
  element?.classList.remove('hidden');
  element?.classList.remove('none');
  element?.removeAttribute('hidden');
}

export function hideElement(selector: string): void {
  const element = document.querySelector(selector);
  element?.classList.add('hidden');
  element?.setAttribute('hidden', '');
}
