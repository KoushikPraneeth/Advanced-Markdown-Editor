import React from 'react';
import { Bold, Italic, Code, Link, Quote, List, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type FormatType = 'bold' | 'italic' | 'code' | 'link' | 'quote' | 'ul' | 'ol';

interface ToolbarProps {
  onFormat: (formatType: FormatType, url?: string) => void;
}

export const Toolbar = ({ onFormat }: ToolbarProps) => {
  // Basic button component to reduce repetition
  const FormatButton = ({ format, children }: { format: FormatType, children: React.ReactNode }) => (
    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onFormat(format)} title={format.charAt(0).toUpperCase() + format.slice(1)}>
      {children}
    </Button>
  );

  return (
    <div className="flex items-center space-x-2 p-2 border-b bg-gray-50 dark:bg-gray-800/50">
      <FormatButton format="bold"><Bold className="h-4 w-4" /></FormatButton>
      <FormatButton format="italic"><Italic className="h-4 w-4" /></FormatButton>
      <FormatButton format="code"><Code className="h-4 w-4" /></FormatButton>
      <FormatButton format="quote"><Quote className="h-4 w-4" /></FormatButton>
      <FormatButton format="ul"><List className="h-4 w-4" /></FormatButton>
      <FormatButton format="ol"><ListOrdered className="h-4 w-4" /></FormatButton>
      {/* Link will be a special case with a popover, handled later */}
    </div>
  );
};
