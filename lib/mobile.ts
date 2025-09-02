// lib/mobile.ts
import { Capacitor } from '@capacitor/core';

// Conditional import for StatusBar to avoid build errors
let StatusBar: any;
let Style: any;
let Keyboard: any;

if (typeof window !== 'undefined') {
  try {
    const statusBarModule = require('@capacitor/status-bar');
    StatusBar = statusBarModule.StatusBar;
    Style = statusBarModule.Style;
  } catch (error) {
    console.log('StatusBar plugin not available');
  }

  try {
    const keyboardModule = require('@capacitor/keyboard');
    Keyboard = keyboardModule.Keyboard;
  } catch (error) {
    console.log('Keyboard plugin not available');
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

  // Initialize keyboard handling
  if (Capacitor.isNativePlatform() && Keyboard) {
    try {
      initializeKeyboardHandling();
      console.log('Keyboard handling initialized successfully');
    } catch (error) {
      console.error('Error initializing keyboard handling:', error);
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

// Initialize keyboard event handling
export const initializeKeyboardHandling = () => {
  if (!Keyboard) return;

  // Listen for keyboard show events
  Keyboard.addListener('keyboardWillShow', (info: any) => {
    // Add class to body when keyboard is showing
    document.body.classList.add('keyboard-open');
    
    // Adjust bottom padding of mobile navigation to account for keyboard
    const mobileNav = document.querySelector('.mobile-nav-safe') as HTMLElement;
    if (mobileNav) {
      const keyboardHeight = info.keyboardHeight || 0;
      mobileNav.style.transform = `translateY(-${keyboardHeight}px)`;
    }
  });

  // Listen for keyboard hide events
  Keyboard.addListener('keyboardWillHide', () => {
    // Remove class from body when keyboard is hiding
    document.body.classList.remove('keyboard-open');
    
    // Reset mobile navigation position
    const mobileNav = document.querySelector('.mobile-nav-safe') as HTMLElement;
    if (mobileNav) {
      mobileNav.style.transform = 'translateY(0)';
    }
  });

  // Listen for keyboard did show events (for additional handling if needed)
  Keyboard.addListener('keyboardDidShow', (info: any) => {
    console.log('Keyboard did show with height:', info.keyboardHeight);
  });

  // Listen for keyboard did hide events
  Keyboard.addListener('keyboardDidHide', () => {
    console.log('Keyboard did hide');
  });
};

// Utility function to hide keyboard programmatically
export const hideKeyboard = async () => {
  if (Capacitor.isNativePlatform() && Keyboard) {
    try {
      await Keyboard.hide();
    } catch (error) {
      console.error('Error hiding keyboard:', error);
    }
  }
};

// Utility function to show keyboard programmatically
export const showKeyboard = async () => {
  if (Capacitor.isNativePlatform() && Keyboard) {
    try {
      await Keyboard.show();
    } catch (error) {
      console.error('Error showing keyboard:', error);
    }
  }
};
