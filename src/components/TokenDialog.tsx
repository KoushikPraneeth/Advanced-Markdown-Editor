
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TokenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (token: string) => void;
}

export const TokenDialog: React.FC<TokenDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [token, setToken] = React.useState('');

  const handleSave = () => {
    if (token) {
      onSave(token);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>GitHub Access Token</DialogTitle>
          <DialogDescription>
            To save your work as a GitHub Gist, please provide a personal access token.
            You can create one <a href="https://github.com/settings/tokens/new?scopes=gist" target="_blank" rel="noopener noreferrer" className="underline">here</a> with the 'gist' scope.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="token"
            placeholder="Enter your GitHub token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Token</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
