import React, { useState, useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { profileStorage } from '@/utils/storage';
import { router, usePathname } from 'expo-router';

export default function RootLayout() {
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
  const hasRedirectedRef = useRef(false);
  const pathname = usePathname();
  useFrameworkReady();

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const setupStatus = await profileStorage.getSetupStatus();
      console.log('Setup status:', setupStatus);
      const isComplete = setupStatus === 1;
      setIsSetupComplete(isComplete);
      
      // Only redirect if setup status is 0, we haven't redirected yet, and we're not already on setup page
      if (setupStatus === 0 && !hasRedirectedRef.current && pathname !== '/setup') {
        console.log('Setup not complete (status: 0), redirecting to setup...');
        hasRedirectedRef.current = true;
        setTimeout(() => {
          router.replace('/setup');
        }, 100);
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
      setIsSetupComplete(false);
      
      // Only redirect on error if we haven't redirected yet and we're not already on setup page
      if (!hasRedirectedRef.current && pathname !== '/setup') {
        hasRedirectedRef.current = true;
        setTimeout(() => {
          router.replace('/setup');
        }, 100);
      }
    }
  };

  // Don't render anything until we've checked setup status
  if (isSetupComplete === null) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="setup" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}