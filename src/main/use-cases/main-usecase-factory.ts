import {
  CreateWindowUseCase,
  type MainUseCase,
  QuitAppUseCase,
  ShowMessageUseCase,
} from './index';

export type UseCaseType = 'CREATE_WINDOW' | 'QUIT_APP' | 'SHOW_MESSAGE';

export class MainUseCaseFactory {
  static createUseCase(type: UseCaseType): MainUseCase | null {
    switch (type) {
      case 'CREATE_WINDOW':
        return new CreateWindowUseCase();
      case 'QUIT_APP':
        return new QuitAppUseCase();
      case 'SHOW_MESSAGE':
        return new ShowMessageUseCase();
      default:
        return null;
    }
  }
}
