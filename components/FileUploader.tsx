'use client';

import { useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileAudio, FileVideo, X } from 'lucide-react';
import { Language, t } from '@/lib/i18n';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;  // <-- File | null
  mediaInfo: { name: string; size: string; duration: number; type: 'audio' | 'video' } | null;
  lang: Language;
  formatTime: (seconds: number) => string;
}

const ACCEPTED_TYPES = [
  'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/aac', 
  'audio/ogg', 'video/mp4', 'video/quicktime', 'video/webm',
  'audio/x-m4a', 'audio/m4a'
];

export function FileUploader({ onFileSelect, mediaInfo, lang, formatTime }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (ACCEPTED_TYPES.includes(file.type) || file.name.match(/\.(mp3|wav|m4a|aac|ogg|mp4|mov|webm)$/i))) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

    const clearFile = useCallback(() => {
    onFileSelect(null);  // <-- no 'as any'
  }, [onFileSelect]);

  return (
    <Card className={`p-6 ${isDragging ? 'border-primary bg-primary/5' : ''}`}>
      {!mediaInfo ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t(lang, 'dragDrop')}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t(lang, 'supportedFormats')}</p>
          <Button type="button">
            {t(lang, 'selectFile')}
          </Button>
          <input
            id="file-input"
            type="file"
            accept=".mp3,.wav,.m4a,.aac,.ogg,.mp4,.mov,.webm,audio/*,video/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mediaInfo.type === 'audio' ? (
                <FileAudio className="h-8 w-8 text-primary" />
              ) : (
                <FileVideo className="h-8 w-8 text-primary" />
              )}
              <div>
                <p className="font-medium truncate max-w-[200px] sm:max-w-md">{mediaInfo.name}</p>
                <p className="text-sm text-muted-foreground">
                  {mediaInfo.size} • {mediaInfo.duration > 0 ? formatTime(mediaInfo.duration) : '--:--'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={clearFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{t(lang, 'mediaType')}:</span>{' '}
              <span className="capitalize">{t(lang, mediaInfo.type)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t(lang, 'duration')}:</span>{' '}
              {mediaInfo.duration > 0 ? formatTime(mediaInfo.duration) : '--:--'}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}