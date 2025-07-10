
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface GistFile {
  filename: string;
  content: string;
}

interface Gist {
  id: string;
  html_url: string;
  description: string;
  files: Record<string, GistFile>;
  created_at: string;
  updated_at: string;
}

const GITHUB_TOKEN_KEY = 'github_gist_token';

export const useGist = () => {
  const [loading, setLoading] = useState(false);
  const [currentGist, setCurrentGist] = useState<Gist | null>(null);
  const [isTokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [tokenCallback, setTokenCallback] = useState<((token: string) => void) | null>(null);

  const getToken = (): string | null => localStorage.getItem(GITHUB_TOKEN_KEY);

  const setToken = (token: string) => {
    localStorage.setItem(GITHUB_TOKEN_KEY, token);
    if (tokenCallback) {
      tokenCallback(token);
      setTokenCallback(null);
    }
  };

  const getHeaders = (token: string | null) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const withToken = async <T>(callback: (token: string) => Promise<T>): Promise<T | null> => {
    let token = getToken();
    if (!token) {
      return new Promise<T | null>((resolve) => {
        setTokenCallback(() => (newToken: string) => {
          resolve(callback(newToken));
        });
        setTokenDialogOpen(true);
      });
    }
    return callback(token);
  };

  const saveToGist = async (content: string, description?: string): Promise<string | null> => {
    return withToken(async (token) => {
      setLoading(true);
      try {
        const response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: getHeaders(token),
          body: JSON.stringify({
            description: description || 'Markdown document from Advanced Markdown Editor',
            public: true,
            files: { 'document.md': { content } },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status} - ${errorData.message}`);
        }

        const gist = await response.json();
        setCurrentGist(gist);

        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('gist', gist.id);
        window.history.replaceState({}, '', newUrl.toString());

        toast({
          title: "Saved to GitHub Gist!",
          description: "Your markdown has been saved as a public Gist.",
        });

        await navigator.clipboard.writeText(gist.html_url);
        return gist.id;
      } catch (error) {
        console.error('Failed to save gist:', error);
        toast({
          title: "Save Failed",
          description: (error as Error).message || "Could not save to GitHub Gist.",
          variant: "destructive",
        });
        return null;
      } finally {
        setLoading(false);
      }
    });
  };

  const loadFromGist = async (gistId: string): Promise<string | null> => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, { headers: getHeaders(getToken()) });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const gist = await response.json();
      setCurrentGist(gist);

      const files = Object.values(gist.files) as GistFile[];
      const markdownFile = files.find(file => file.filename.endsWith('.md') || file.filename.endsWith('.markdown')) || files[0];

      if (markdownFile) {
        toast({
          title: "Gist Loaded",
          description: `Loaded "${markdownFile.filename}" from GitHub Gist`,
          duration: 5000,
        });
        return markdownFile.content;
      } else {
        throw new Error('No markdown content found in gist');
      }
    } catch (error) {
      console.error('Failed to load gist:', error);
      toast({
        title: "Load Failed",
        description: "Could not load the GitHub Gist. Please check the ID.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateGist = async (gistId: string, content: string): Promise<boolean> => {
    const result = await withToken(async (token) => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers: getHeaders(token),
          body: JSON.stringify({
            files: { 'document.md': { content } },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status} - ${errorData.message}`);
        }

        const updatedGist = await response.json();
        setCurrentGist(updatedGist);

        toast({
          title: "Gist Updated",
          description: "Your changes have been saved to the existing gist.",
        });

        return true;
      } catch (error) {
        console.error('Failed to update gist:', error);
        toast({
          title: "Update Failed",
          description: (error as Error).message || "Could not update the GitHub Gist.",
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    });
    return result ?? false;
  };

  return {
    loading,
    currentGist,
    saveToGist,
    loadFromGist,
    updateGist,
    isTokenDialogOpen,
    closeTokenDialog: () => setTokenDialogOpen(false),
    saveToken: setToken,
  };
};
