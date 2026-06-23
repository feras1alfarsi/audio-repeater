'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Language, t } from '@/lib/i18n';

const PAUSE_OPTIONS = [0, 5, 10, 30, 60];

interface PauseSelectorProps {
  lang: Language;
  selectedPause: number;
  onPauseChange: (pause: number) => void;
  disabled: boolean;
}

export function PauseSelector({ lang, selectedPause, onPauseChange, disabled }: PauseSelectorProps) {
  return (
    <Card className="p-4">
      <Label className="block mb-3 font-semibold">{t(lang, 'pauseBetween')}</Label>
      <div className="flex flex-wrap gap-2">
        {PAUSE_OPTIONS.map((pause) => (
          <button
            key={pause}
            onClick={() => onPauseChange(pause)}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPause === pause
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {pause === 0 ? t(lang, 'noDelay') : `${pause} ${t(lang, 'seconds')}`}
          </button>
        ))}
      </div>
    </Card>
  );
}