import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.bookingclient',
  appName: 'Booking Client',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'light',
      backgroundColor: '#ffffff',
      overlay: false,
      show: true
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    App: {
      android: {
        // Partial immersive mode - hide navigation bar but keep status bar
        immersive: true,
        hideNavigationBar: true
      }
    }
  }
};

export default config;
