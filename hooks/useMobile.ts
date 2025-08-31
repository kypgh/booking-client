// hooks/useMobile.ts
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    // Check if we're in a native mobile environment
    const nativeCheck = Capacitor.isNativePlatform();
    setIsNative(nativeCheck);

    // Check if we're on a mobile device (including mobile web)
    const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;
    
    setIsMobile(mobileCheck);

    // Get safe area insets if available
    const updateSafeAreaInsets = () => {
      if (typeof window !== 'undefined' && CSS.supports('padding', 'env(safe-area-inset-top)')) {
        const computedStyle = getComputedStyle(document.documentElement);
        setSafeAreaInsets({
          top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)').replace('px', '')) || 0,
          bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)').replace('px', '')) || 0,
          left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)').replace('px', '')) || 0,
          right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)').replace('px', '')) || 0,
        });
      }
    };

    updateSafeAreaInsets();
    
    // Update on resize (device rotation)
    window.addEventListener('resize', updateSafeAreaInsets);
    window.addEventListener('orientationchange', updateSafeAreaInsets);

    return () => {
      window.removeEventListener('resize', updateSafeAreaInsets);
      window.removeEventListener('orientationchange', updateSafeAreaInsets);
    };
  }, []);

  return {
    isMobile,
    isNative,
    safeAreaInsets,
  };
};
