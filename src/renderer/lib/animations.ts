/**
 * Animation and visual effects utilities for renderer process
 * Provides comprehensive animation system with performance optimization
 */

export interface AnimationOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  iterations?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface Transition {
  property: string;
  duration: number;
  easing?: string;
  delay?: number;
}

export interface KeyframeSequence {
  [offset: number]: any;
}

export class AnimationManager {
  private static instance: AnimationManager;
  private activeAnimations: Set<Animation> = new Set();
  private animationQueue: Array<() => void> = [];
  private isProcessingQueue: boolean = false;

  private constructor() {
    this.setupGlobalSettings();
  }

  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  /**
   * Setup global animation settings
   */
  private setupGlobalSettings(): void {
    // Reduce motion for users who prefer it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduce-motion');
    }
  }

  /**
   * Animate element with Web Animations API
   */
  animate(
    element: Element,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options: AnimationOptions = {}
  ): Promise<Animation> {
    const animationOptions: KeyframeAnimationOptions = {
      duration: options.duration || 300,
      easing: options.easing || 'ease',
      delay: options.delay || 0,
      iterations: options.iterations || 1,
      direction: options.direction || 'normal',
      fill: options.fill || 'none',
    };

    const animation = element.animate(keyframes, animationOptions);

    this.activeAnimations.add(animation);

    animation.addEventListener('finish', () => {
      this.activeAnimations.delete(animation);
    });

    animation.addEventListener('cancel', () => {
      this.activeAnimations.delete(animation);
    });

    return animation.finished.then(() => animation);
  }

  /**
   * Fade in animation
   */
  fadeIn(element: Element, options: AnimationOptions = {}): Promise<Animation> {
    return this.animate(
      element,
      [
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 300, ...options }
    );
  }

  /**
   * Fade out animation
   */
  fadeOut(element: Element, options: AnimationOptions = {}): Promise<Animation> {
    return this.animate(
      element,
      [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-20px)' },
      ],
      { duration: 300, ...options }
    );
  }

  /**
   * Slide in animation
   */
  slideIn(
    element: Element,
    direction: 'left' | 'right' | 'up' | 'down' = 'right',
    options: AnimationOptions = {}
  ): Promise<Animation> {
    const transforms = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      up: 'translateY(-100%)',
      down: 'translateY(100%)',
    };

    return this.animate(
      element,
      [
        { opacity: 0, transform: transforms[direction] },
        { opacity: 1, transform: 'translate(0)' },
      ],
      { duration: 400, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', ...options }
    );
  }

  /**
   * Slide out animation
   */
  slideOut(
    element: Element,
    direction: 'left' | 'right' | 'up' | 'down' = 'right',
    options: AnimationOptions = {}
  ): Promise<Animation> {
    const transforms = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      up: 'translateY(-100%)',
      down: 'translateY(100%)',
    };

    return this.animate(
      element,
      [
        { opacity: 1, transform: 'translate(0)' },
        { opacity: 0, transform: transforms[direction] },
      ],
      { duration: 400, easing: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)', ...options }
    );
  }

  /**
   * Scale animation
   */
  scale(
    element: Element,
    fromScale: number = 0,
    toScale: number = 1,
    options: AnimationOptions = {}
  ): Promise<Animation> {
    return this.animate(
      element,
      [
        { transform: `scale(${fromScale})`, opacity: fromScale === 0 ? 0 : 1 },
        { transform: `scale(${toScale})`, opacity: 1 },
      ],
      { duration: 300, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', ...options }
    );
  }

  /**
   * Bounce animation
   */
  bounce(element: Element, options: AnimationOptions = {}): Promise<Animation> {
    return this.animate(
      element,
      [
        { transform: 'translateY(0)' },
        { transform: 'translateY(-30%)' },
        { transform: 'translateY(0)' },
        { transform: 'translateY(-15%)' },
        { transform: 'translateY(0)' },
      ],
      { duration: 600, ...options }
    );
  }

  /**
   * Shake animation
   */
  shake(element: Element, options: AnimationOptions = {}): Promise<Animation> {
    return this.animate(
      element,
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 500, ...options }
    );
  }

  /**
   * Pulse animation
   */
  pulse(element: Element, options: AnimationOptions = {}): Promise<Animation> {
    return this.animate(
      element,
      [{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1)' }],
      { duration: 300, ...options }
    );
  }

  /**
   * Rotate animation
   */
  rotate(
    element: Element,
    fromDegrees: number = 0,
    toDegrees: number = 360,
    options: AnimationOptions = {}
  ): Promise<Animation> {
    return this.animate(
      element,
      [{ transform: `rotate(${fromDegrees}deg)` }, { transform: `rotate(${toDegrees}deg)` }],
      { duration: 400, ...options }
    );
  }

  /**
   * Stagger animation for multiple elements
   */
  stagger(
    elements: Element[],
    animationFn: (element: Element, index: number) => Promise<Animation>,
    staggerDelay: number = 100
  ): Promise<Animation[]> {
    const animations = elements.map((element, index) => {
      return new Promise<Animation>((resolve) => {
        setTimeout(() => {
          animationFn(element, index).then(resolve);
        }, index * staggerDelay);
      });
    });

    return Promise.all(animations);
  }

  /**
   * Animate elements sequentially
   */
  sequence(animations: Array<() => Promise<Animation>>): Promise<Animation[]> {
    return animations.reduce((promise, animationFn) => {
      return promise.then((results) => {
        return animationFn().then((animation) => [...results, animation]);
      });
    }, Promise.resolve<Animation[]>([]));
  }

  /**
   * Animate elements in parallel
   */
  parallel(animations: Array<() => Promise<Animation>>): Promise<Animation[]> {
    return Promise.all(animations.map((fn) => fn()));
  }

  /**
   * Create transition string
   */
  createTransition(transitions: Transition[]): string {
    return transitions
      .map((t) => `${t.property} ${t.duration}ms ${t.easing || 'ease'} ${t.delay || 0}ms`)
      .join(', ');
  }

  /**
   * Apply CSS transitions to element
   */
  applyTransitions(element: Element, transitions: Transition[]): void {
    const htmlElement = element as HTMLElement;
    htmlElement.style.transition = this.createTransition(transitions);
  }

  /**
   * Animate to a specific scroll position
   */
  scrollTo(target: Element | Window, x: number, y: number, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      const startX = target instanceof Window ? target.scrollX : (target as Element).scrollTop;
      const startY = target instanceof Window ? target.scrollY : (target as Element).scrollLeft;
      const distanceX = x - startX;
      const distanceY = y - startY;
      const startTime = performance.now();

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = this.easeInOutCubic(progress);

        const currentX = startX + distanceX * eased;
        const currentY = startY + distanceY * eased;

        if (target instanceof Window) {
          target.scrollTo(currentX, currentY);
        } else {
          (target as Element).scrollTo(currentX, currentY);
        }

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animateScroll);
    });
  }

  /**
   * Smooth scroll to element
   */
  scrollToElement(target: Element, duration: number = 300, offset: number = 0): Promise<void> {
    const rect = target.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetY = rect.top + scrollTop - offset;

    return this.scrollTo(window, window.scrollX, targetY, duration);
  }

  /**
   * Create custom animation function
   */
  customAnimation(
    element: Element,
    keyframes: KeyframeSequence[],
    options: AnimationOptions = {}
  ): Promise<Animation> {
    const webApiKeyframes: Keyframe[] = keyframes.map((keyframe) => keyframe as Keyframe);
    return this.animate(element, webApiKeyframes, options);
  }

  /**
   * Cancel all animations
   */
  cancelAllAnimations(): void {
    this.activeAnimations.forEach((animation) => {
      animation.cancel();
    });
    this.activeAnimations.clear();
  }

  /**
   * Pause all animations
   */
  pauseAllAnimations(): void {
    this.activeAnimations.forEach((animation) => {
      animation.pause();
    });
  }

  /**
   * Resume all animations
   */
  resumeAllAnimations(): void {
    this.activeAnimations.forEach((animation) => {
      animation.play();
    });
  }

  /**
   * Get active animations count
   */
  getActiveAnimationsCount(): number {
    return this.activeAnimations.size;
  }

  /**
   * Queue animation for later execution
   */
  queueAnimation(animationFn: () => void): void {
    this.animationQueue.push(animationFn);
    this.processQueue();
  }

  /**
   * Process animation queue
   */
  private processQueue(): void {
    if (this.isProcessingQueue || this.animationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    const processNext = () => {
      if (this.animationQueue.length === 0) {
        this.isProcessingQueue = false;
        return;
      }

      const animationFn = this.animationQueue.shift()!;
      animationFn();

      // Use requestAnimationFrame to avoid blocking
      requestAnimationFrame(processNext);
    };

    requestAnimationFrame(processNext);
  }

  /**
   * Cubic easing function
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  }

  /**
   * Check if element is animating
   */
  isAnimating(element: Element): boolean {
    return Array.from(this.activeAnimations).some(
      (animation) => animation.effect?.target === element
    );
  }

  /**
   * Get animations for element
   */
  getAnimationsForElement(element: Element): Animation[] {
    return Array.from(this.activeAnimations).filter(
      (animation) => animation.effect?.target === element
    );
  }

  /**
   * Set animation performance mode
   */
  setPerformanceMode(enabled: boolean): void {
    if (enabled) {
      document.documentElement.classList.add('performance-mode');
    } else {
      document.documentElement.classList.remove('performance-mode');
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.cancelAllAnimations();
    this.animationQueue.length = 0;
    this.isProcessingQueue = false;
  }
}

// Export singleton instance
export const animations = AnimationManager.getInstance();
