// contexts/FontSizeContext.js
import { createContext, useContext, useState } from 'react';

const FontSizeContext = createContext();

export const FontSizeProvider = ({ children }) => {
  const [banglaFontSize, setBanglaFontSize] = useState(14);

  const updateBanglaFontSize = (size) => {
    setBanglaFontSize(size);
  };

  return (
    <FontSizeContext.Provider value={{ banglaFontSize, updateBanglaFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};