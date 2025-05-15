
import React, { createContext, useContext, useState, useEffect } from 'react';

type FontSize = 'small' | 'medium' | 'large';
type ThemeColor = '#9b87f5' | '#4F46E5' | '#0EA5E9' | '#10B981' | '#F97316' | '#EC4899';

interface ThemeContextType {
  darkMode: boolean;
  compactMode: boolean;
  fontSize: FontSize;
  accentColor: ThemeColor;
  toggleDarkMode: () => void;
  toggleCompactMode: () => void;
  setFontSize: (size: FontSize) => void;
  setAccentColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializar com valores salvos ou padrões
  const [darkMode, setDarkMode] = useState<boolean>(
    localStorage.getItem('darkMode') === 'true'
  );
  const [compactMode, setCompactMode] = useState<boolean>(
    localStorage.getItem('compactMode') === 'true'
  );
  const [fontSize, setFontSize] = useState<FontSize>(
    (localStorage.getItem('fontSize') as FontSize) || 'medium'
  );
  const [accentColor, setAccentColor] = useState<ThemeColor>(
    (localStorage.getItem('accentColor') as ThemeColor) || '#9b87f5'
  );

  // Atualize o DOM e localStorage quando as configurações mudarem
  useEffect(() => {
    // Dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Compact mode
  useEffect(() => {
    if (compactMode) {
      document.documentElement.classList.add('compact');
    } else {
      document.documentElement.classList.remove('compact');
    }
    localStorage.setItem('compactMode', compactMode.toString());
  }, [compactMode]);

  // Font size
  useEffect(() => {
    document.documentElement.classList.remove('text-small', 'text-medium', 'text-large');
    document.documentElement.classList.add(`text-${fontSize}`);
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);
  
  // Accent color
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.style.setProperty('--accent-hsl', convertHexToHSL(accentColor));
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleCompactMode = () => setCompactMode(!compactMode);

  // Função para converter hex para HSL (formato usado no Tailwind CSS)
  const convertHexToHSL = (hex: string): string => {
    // Remova o # se presente
    hex = hex.replace('#', '');
    
    // Converta para RGB
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Encontre o valor máximo e mínimo
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }
    
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return `${h} ${s}% ${l}%`;
  };

  const value = {
    darkMode,
    compactMode,
    fontSize,
    accentColor,
    toggleDarkMode,
    toggleCompactMode,
    setFontSize,
    setAccentColor,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
