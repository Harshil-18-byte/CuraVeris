'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type DeviceMode = 'desktop' | 'ios' | 'android';

interface DeviceContextType {
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  isMobileMode: boolean;
}

const DeviceContext = createContext<DeviceContextType>({
  deviceMode: 'desktop',
  setDeviceMode: () => {},
  isMobileMode: false,
});

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [deviceMode, setDeviceModeState] = useState<DeviceMode>('desktop');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkDevice = () => {
        const isPhone = window.innerWidth <= 768;
        if (isPhone) {
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          setDeviceModeState(isIOS ? 'ios' : 'android');
        } else {
          setDeviceModeState('desktop');
        }
      };

      checkDevice();
      window.addEventListener('resize', checkDevice);
      return () => window.removeEventListener('resize', checkDevice);
    }
  }, []);

  const setDeviceMode = (mode: DeviceMode) => {
    setDeviceModeState(mode);
  };

  const isMobileMode = deviceMode === 'ios' || deviceMode === 'android';

  return (
    <DeviceContext.Provider value={{ deviceMode, setDeviceMode, isMobileMode }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  return useContext(DeviceContext);
}
