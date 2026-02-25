// Import all styles first to ensure they're loaded before DOM manipulation
import './styles';
import App from './app';
import { initWinboxSidebar } from './winbox-sidebar';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initWinboxSidebar();
  const app = new App();
  app.init();
});
