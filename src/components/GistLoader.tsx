
import { useEffect } from 'react';
import { useGist } from '@/hooks/useGist';

interface GistLoaderProps {
  onContentLoad: (content: string) => void;
}

export const GistLoader = ({ onContentLoad }: GistLoaderProps) => {
  const { loadFromGist } = useGist();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gistId = urlParams.get('gist');
    
    if (gistId) {
      loadFromGist(gistId).then(content => {
        if (content) {
          onContentLoad(content);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // This component doesn't render anything
};
