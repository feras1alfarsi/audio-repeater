'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export function LanguageSwitcher({ currentLang, onLanguageChange }: LanguageSwitcherProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onLanguageChange(currentLang === 'en' ? 'ar' : 'en')}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      {currentLang === 'en' ? 'العربية' : 'English'}
    </Button>
  );
}