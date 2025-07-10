
import { useState, useEffect } from 'react';

interface Settings {
  theme: 'light' | 'dark';
  autoSave: boolean;
  previewMode: 'side' | 'preview-only' | 'editor-only';
  autoSaveEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  autoSave: true,
  previewMode: 'side',
  autoSaveEnabled: true,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem('nexus-editor-settings');
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('nexus-editor-settings', JSON.stringify(updated));
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  const toggleAutoSave = () => {
    updateSettings({ autoSaveEnabled: !settings.autoSaveEnabled });
  };

  return {
    settings,
    updateSettings,
    toggleTheme,
    toggleAutoSave,
  };
};
