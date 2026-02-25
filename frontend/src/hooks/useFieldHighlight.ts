import { useState, useCallback } from 'react';

export function useFieldHighlight() {
  const [hl, setHl] = useState<Record<string, boolean>>({});

  const highlight = useCallback((field: string) => {
    setHl((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setHl((prev) => ({ ...prev, [field]: false }));
    }, 1200);
  }, []);

  return { hl, highlight };
}
