// Base interface for main process use cases
export interface MainUseCase<T = any> {
  execute(data?: T): Promise<any>;
}
