'use client';

import { useEffect } from 'react';

export default function IuguScript() {
  useEffect(() => {
    // Wait for iugu.js to load
    const initializeIugu = () => {
      if (window.Iugu) {
        const accountId = process.env.NEXT_PUBLIC_IUGU_ACCOUNT_ID;
        const isTestMode = process.env.NEXT_PUBLIC_IUGU_TEST_MODE === 'true';

        if (accountId) {
          window.Iugu.setAccountID(accountId);
          window.Iugu.setTestMode(isTestMode);
          console.log('iugu.js initialized', { testMode: isTestMode });
        } else {
          console.warn('IUGU_ACCOUNT_ID not configured');
        }
      } else {
        // Retry after 100ms if not loaded yet
        setTimeout(initializeIugu, 100);
      }
    };

    initializeIugu();
  }, []);

  return null;
}
