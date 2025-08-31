// lib/mobile.ts
import { Capacitor } from '@capacitor/core';

// Conditional import for StatusBar to avoid build errors
let StatusBar: any;
let Style: any;

if (typeof window !== 'undefined') {
  try {
    const statusBarModule = require('@capacitor/status-bar');
    StatusBar = statusBarModule.StatusBar;
    Style = statusBarModule.Style;
  } catch (error) {
    console.log('StatusBar plugin not available');
  }
}

export const initializeMobile = async () => {
  if (Capacitor.isNativePlatform() && StatusBar && Style) {
    try {
      // Configure status bar
      await StatusBar.setStyle({
        style: Style.Light, // Use light content on dark status bar
      });

      await StatusBar.setBackgroundColor({
        color: '#ffffff', // Match your app's background
      });

      await StatusBar.setOverlaysWebView({
        overlay: false, // Don't overlay the web view
      });

      // Show status bar if it was hidden
      await StatusBar.show();

      console.log('Mobile UI initialized successfully');
    } catch (error) {
      console.error('Error initializing mobile UI:', error);
    }
  }
};

// Function to toggle status bar style based on theme
export const updateStatusBarForTheme = async (isDark: boolean) => {
  if (Capacitor.isNativePlatform() && StatusBar && Style) {
    try {
      await StatusBar.setStyle({
        style: isDark ? Style.Dark : Style.Light,
      });

      await StatusBar.setBackgroundColor({
        color: isDark ? '#0f172a' : '#ffffff',
      });
    } catch (error) {
      console.error('Error updating status bar theme:', error);
    }
  }
};

// Get safe area insets programmatically (fallback for older devices)
export const getSafeAreaInsets = () => {
  if (typeof window !== 'undefined') {
    const computedStyle = getComputedStyle(document.documentElement);
    return {
      top: computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0px',
      bottom: computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0px',
      left: computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0px',
      right: computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0px',
    };
  }
  return { top: '0px', bottom: '0px', left: '0px', right: '0px' };
};
