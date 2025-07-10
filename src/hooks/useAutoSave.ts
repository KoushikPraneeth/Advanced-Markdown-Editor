
import { useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

interface UseAutoSaveProps {
  content: string;
  enabled: boolean;
  onSave: (content: string) => void;
  delay?: number;
}

export const useAutoSave = ({ 
  content, 
  enabled, 
  onSave, 
  delay = 3000 
}: UseAutoSaveProps) => {
  const debouncedSave = useCallback(
    debounce((content: string) => {
      if (enabled && content.trim()) {
        onSave(content);
      }
    }, delay),
    [enabled, onSave, delay]
  );

  useEffect(() => {
    debouncedSave(content);
    return () => {
      debouncedSave.cancel();
    };
  }, [content, debouncedSave]);

  return { debouncedSave };
};
