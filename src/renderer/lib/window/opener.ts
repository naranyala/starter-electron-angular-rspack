import { getThemeByCategory } from '../../../shared/theme';
import type { MenuItem, Theme, WindowConfig } from '../../../shared/types';
import { generateId } from '../../../shared/lib/utils';
import { registerWinBox } from '../../winbox-sidebar';

export interface OpenWindowOptions {
  width?: number;
  height?: number;
  modal?: boolean;
  onClose?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

let winboxModule: typeof import('winbox') | null = null;

async function getWinBox(): Promise<typeof import('winbox')> {
  if (!winboxModule) {
    winboxModule = await import('winbox');
  }
  return winboxModule;
}

export async function openWindow(
  card: MenuItem,
  options: OpenWindowOptions = {}
): Promise<unknown> {
  const WinBox = await getWinBox();

  const theme = getThemeByCategory(card.category);

  const config: WindowConfig = {
    width: options.width || 500,
    height: options.height || 400,
    x: 'center',
    y: 'center',
    background: theme.bg,
    border: 4,
    class: 'dark-theme',
    html: `<div style="padding: 20px; color: ${theme.color};">
      <h3>${card.title}</h3>
      <div>${card.content}</div>
    </div>`,
  };

  const winbox: any = new (WinBox as any)({
    title: card.title,
    ...config,
  });

  registerWinBox(winbox);
  setTimeout(() => {
    winbox.maximize?.();
  }, 0);

  if (options.onClose) {
    winbox.on('close', options.onClose);
  }
  if (options.onFocus) {
    winbox.on('focus', options.onFocus);
  }
  if (options.onBlur) {
    winbox.on('blur', options.onBlur);
  }

  return winbox;
}

export async function createModalWindow(
  title: string,
  content: string,
  options: OpenWindowOptions = {}
): Promise<unknown> {
  const WinBox = await getWinBox();

  const config: WindowConfig = {
    width: options.width || 400,
    height: options.height || 300,
    x: 'center',
    y: 'center',
    background: '#ffffff',
    border: 4,
    html: content,
  };

  const winbox: any = new (WinBox as any)({
    title,
    modal: options.modal ?? true,
    ...config,
  });

  registerWinBox(winbox);

  if (options.onClose) {
    winbox.on('close', options.onClose);
  }

  return winbox;
}

export async function showNotificationWindow(
  title: string,
  message: string,
  type: 'info' | 'warning' | 'error' = 'info'
): Promise<unknown> {
  const bgColors: Record<string, string> = {
    info: '#3498db',
    warning: '#f39c12',
    error: '#e74c3c',
  };

  const WinBox = await getWinBox();

  const config: WindowConfig = {
    width: 400,
    height: 200,
    x: 'center',
    y: 'center',
    background: bgColors[type],
    border: 4,
    html: `<div style="padding: 20px; color: white; text-align: center;">
      <h3>${title}</h3>
      <p>${message}</p>
    </div>`,
  };

  const winbox: any = new (WinBox as any)({
    title,
    ...config,
  });

  registerWinBox(winbox);
  return winbox;
}

export function closeAllWindows(): void {
  document.querySelectorAll('.winbox').forEach((el) => {
    const winbox = (el as any).winbox;
    if (winbox) {
      winbox.close();
    }
  });
}

export function minimizeAllWindows(): void {
  document.querySelectorAll('.winbox').forEach((el) => {
    const winbox = (el as any).winbox;
    if (winbox && !winbox.min) {
      winbox.minimize();
    }
  });
}

export function maximizeAllWindows(): void {
  document.querySelectorAll('.winbox').forEach((el) => {
    const winbox = (el as any).winbox;
    if (winbox && !winbox.max) {
      winbox.maximize();
    }
  });
}
