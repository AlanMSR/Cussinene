import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TextSizeType = 'small' | 'medium' | 'large';
const TEXT_SIZE_STORAGE_KEY = '@app_text_size';

interface TextSizeContextType {
  textSize: TextSizeType;
  setTextSize: (size: TextSizeType) => void;
  getFontSize: (baseSize: number) => number;
}

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

export function TextSizeProvider({ children }: { children: React.ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSizeType>('medium');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedTextSize();
  }, []);

  const loadSavedTextSize = async () => {
    try {
      const savedSize = await AsyncStorage.getItem(TEXT_SIZE_STORAGE_KEY);
      if (savedSize) {
        setTextSizeState(savedSize as TextSizeType);
      }
    } catch (error) {
      console.error('Error loading text size:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTextSize = async (size: TextSizeType) => {
    try {
      await AsyncStorage.setItem(TEXT_SIZE_STORAGE_KEY, size);
      setTextSizeState(size);
    } catch (error) {
      console.error('Error saving text size:', error);
    }
  };

  const getFontSize = (baseSize: number) => {
    switch (textSize) {
      case 'small':
        return Math.floor(baseSize * 0.85);
      case 'large':
        return Math.floor(baseSize * 1.15);
      default:
        return baseSize;
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize, getFontSize }}>
      {children}
    </TextSizeContext.Provider>
  );
}

export function useTextSize() {
  const context = useContext(TextSizeContext);
  if (context === undefined) {
    throw new Error('useTextSize must be used within a TextSizeProvider');
  }
  return context;
} 