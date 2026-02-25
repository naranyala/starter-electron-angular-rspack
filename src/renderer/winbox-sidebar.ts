type WinBoxLike = {
  title?: string;
  min?: boolean;
  on?: (event: string, handler: () => void) => void;
  focus?: () => void;
  minimize?: () => void;
  restore?: () => void;
  close?: () => void;
};

type SidebarItem = {
  id: number;
  winbox: WinBoxLike;
  element: HTMLDivElement;
  titleEl: HTMLButtonElement;
  minBtn: HTMLButtonElement;
};

let initialized = false;
let listEl: HTMLDivElement | null = null;
let nextId = 1;
const items = new Map<number, SidebarItem>();

export function initWinboxSidebar(): void {
  if (initialized) return;
  initialized = true;

  listEl = document.querySelector('.winbox-sidebar-list');
  const homeButton = document.querySelector('.winbox-sidebar-home') as HTMLButtonElement | null;
  if (!listEl) {
    initialized = false;
  }

  if (homeButton) {
    homeButton.addEventListener('click', () => {
      document.querySelectorAll('.winbox').forEach((el) => {
        const winbox = (el as any).winbox;
        if (winbox && !winbox.min) {
          winbox.minimize?.();
        }
      });
      const searchInput = document.querySelector('.search-input') as HTMLInputElement | null;
      searchInput?.focus();
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
  }
}

function setItemState(item: SidebarItem): void {
  const isMin = Boolean(item.winbox.min);
  item.element.classList.toggle('is-minimized', isMin);
  item.minBtn.textContent = isMin ? 'Restore' : 'Minimize';
}

function setActive(item: SidebarItem, isActive: boolean): void {
  item.element.classList.toggle('is-active', isActive);
}

function removeItem(item: SidebarItem): void {
  items.delete(item.id);
  item.element.remove();
}

export function registerWinBox(winbox: WinBoxLike): void {
  if (!initialized) {
    initWinboxSidebar();
  }
  if (!listEl) return;

  const id = nextId++;

  const element = document.createElement('div');
  element.className = 'winbox-sidebar-item';

  const titleEl = document.createElement('button');
  titleEl.className = 'winbox-sidebar-title';
  titleEl.type = 'button';
  titleEl.textContent = winbox.title ?? `Window ${id}`;

  const actions = document.createElement('div');
  actions.className = 'winbox-sidebar-actions';

  const minBtn = document.createElement('button');
  minBtn.className = 'winbox-sidebar-action';
  minBtn.type = 'button';
  minBtn.textContent = 'Minimize';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'winbox-sidebar-action';
  closeBtn.type = 'button';
  closeBtn.textContent = 'Close';

  actions.appendChild(minBtn);
  actions.appendChild(closeBtn);
  element.appendChild(titleEl);
  element.appendChild(actions);
  listEl.appendChild(element);

  const item: SidebarItem = { id, winbox, element, titleEl, minBtn };
  items.set(id, item);

  const focusWindow = (): void => {
    if (winbox.min && winbox.restore) {
      winbox.restore();
    }
    winbox.focus?.();
    setActive(item, true);
    setItemState(item);
  };

  titleEl.addEventListener('click', focusWindow);
  minBtn.addEventListener('click', () => {
    if (winbox.min) {
      winbox.restore?.();
    } else {
      winbox.minimize?.();
    }
    setItemState(item);
  });
  closeBtn.addEventListener('click', () => {
    winbox.close?.();
    removeItem(item);
  });

  winbox.on?.('focus', () => setActive(item, true));
  winbox.on?.('blur', () => setActive(item, false));
  winbox.on?.('minimize', () => setItemState(item));
  winbox.on?.('restore', () => setItemState(item));
  winbox.on?.('close', () => removeItem(item));

  setItemState(item);
}
