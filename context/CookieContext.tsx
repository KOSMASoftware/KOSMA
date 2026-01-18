
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CookieSettingsModal } from '../components/modals/CookieSettingsModal';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieContextType {
  preferences: CookiePreferences;
  savePreferences: (prefs: CookiePreferences) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

const STORAGE_KEY = 'kosma-cookie-prefs';

// Default Preferences (Pragmatic / Swiss Approach)
const DEFAULT_PREFS: CookiePreferences = {
  essential: true,
  analytics: true, // Default ON
  marketing: false // Default OFF
};

export const CookieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load cookie prefs", e);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    setPreferences(prefs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    // In a real app, this is where you would initialize/destroy trackers
    // e.g., if (prefs.analytics) initGA() else disableGA()
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <CookieContext.Provider value={{ preferences, savePreferences, isModalOpen, openModal, closeModal }}>
      {children}
      {isModalOpen && <CookieSettingsModal onClose={closeModal} />}
    </CookieContext.Provider>
  );
};

export const useCookieSettings = () => {
  const context = useContext(CookieContext);
  if (context === undefined) throw new Error('useCookieSettings must be used within a CookieProvider');
  return context;
};
