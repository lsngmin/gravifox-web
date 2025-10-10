import { useMemo } from 'react';

export function useNumberFormatter(locale, options) {
  const optionsKey = options ? JSON.stringify(options) : null;
  return useMemo(() => new Intl.NumberFormat(locale || 'en', options), [locale, optionsKey]);
}

export default useNumberFormatter;
