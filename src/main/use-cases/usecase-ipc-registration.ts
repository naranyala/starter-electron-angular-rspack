import { ipcMain } from 'electron';
import { MainUseCaseFactory, type UseCaseType } from './index.js';

/**
 * Registers use cases with IPC channels
 * This allows renderer processes to trigger specific use cases in the main process
 */
export class UseCaseIPCRegistration {
  static registerUseCases(): void {
    // Handle requests to execute use cases from renderer process
    ipcMain.handle('execute-use-case', async (event, type: UseCaseType, data?: any) => {
      try {
        const useCase = MainUseCaseFactory.createUseCase(type);
        if (!useCase) {
          throw new Error(`Unknown use case type: ${type}`);
        }

        const result = await useCase.execute(data);
        return { success: true, result };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    });
  }
}
