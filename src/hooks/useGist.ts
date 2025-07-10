
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

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_GIST_TOKEN;

export const useGist = () => {
  const [loading, setLoading] = useState(false);
  const [currentGist, setCurrentGist] = useState<Gist | null>(null);

  const getHeaders = () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    };
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }
    return headers;
  };

  const saveToGist = async (content: string, description?: string): Promise<string | null> => {
    setLoading(true);
    try {
      if (!GITHUB_TOKEN) {
        throw new Error("GitHub token is not configured. Please set VITE_GITHUB_GIST_TOKEN.");
      }
      const response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          description: description || 'Markdown document from Advanced Markdown Editor',
          public: true, // Public gists are more straightforward for sharing
          files: {
            'document.md': {
              content: content,
            },
          },
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
  };

  const loadFromGist = async (gistId: string): Promise<string | null> => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, { headers: getHeaders() });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const gist = await response.json();
      setCurrentGist(gist);

      const files = Object.values(gist.files) as GistFile[];
      const markdownFile = files.find(file => 
        file.filename.endsWith('.md') || file.filename.endsWith('.markdown')
      ) || files[0];

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
    setLoading(true);
    try {
      if (!GITHUB_TOKEN) {
        throw new Error("GitHub token is not configured. Please set VITE_GITHUB_GIST_TOKEN.");
      }
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          files: {
            'document.md': {
              content: content,
            },
          },
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
  };

  return {
    loading,
    currentGist,
    saveToGist,
    loadFromGist,
    updateGist,
  };
};
