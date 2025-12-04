/**
 * Configuration file for GAK Calendar
 *
 * IMPORTANT: After deploying your Google Apps Script,
 * update the API_URL below with your Web App URL
 */

window.CONFIG = {
  // Google Apps Script Web App URL
  // Get this from: Apps Script > Deploy > Manage deployments > Web App URL
  API_URL: '',  // Leave empty to use localStorage for development

  // Example: API_URL: 'https://script.google.com/macros/s/AKfycbzXXXXXXX/exec'

  // App settings
  APP_NAME: 'Gabriel\'s Art Kids Calendar',
  DEFAULT_LOCATION: 'holly',

  // Cache duration (in milliseconds)
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

  // Features
  ENABLE_OFFLINE_MODE: true,
  ENABLE_NOTIFICATIONS: false,

  // UI Settings
  BOOKINGS_PER_PAGE: 100,
  ANIMATION_DURATION: 300,

  // Development mode
  DEBUG: false
};

// Log configuration on load
if (window.CONFIG.DEBUG) {
  console.log('GAK Calendar Configuration:', window.CONFIG);
}
