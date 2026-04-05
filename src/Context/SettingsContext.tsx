import * as React from 'react';
import { supabase } from '@/db/supabase';

export interface PlatformSettings {
  [key: string]: string;
}

interface SettingsContextType {
  settings: PlatformSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<PlatformSettings>({});
  const [loading, setLoading] = React.useState(true);

  const loadSettings = async () => {
    try {
      const { data } = await supabase.from('settings').select('key, value');
      const settingsObj: any = {};
      data?.forEach((s: any) => {
        settingsObj[s.key] = s.value;
      });
      setSettings(settingsObj);
      
      // Apply theme colors globally
      if (settingsObj.primary_color) {
        document.documentElement.style.setProperty('--primary', settingsObj.primary_color);
      }
      
      // Apply favicon
      if (settingsObj.favicon_url) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = settingsObj.favicon_url;
      }
    } catch (err) {
      console.error('Settings load error:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: loadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = React.useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
