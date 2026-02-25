interface WinBoxOptions {
  title?: string;
  html?: string;
  width?: number;
  height?: number;
  x?: string | number;
  y?: string | number;
  class?: string;
  background?: string;
  border?: number;
}

declare module 'winbox/src/js/winbox' {
  export default class WinBox {
    constructor(options?: WinBoxOptions);
    body: HTMLElement;
  }
}
