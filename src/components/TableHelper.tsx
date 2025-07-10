
import React, { useState } from 'react';
import { Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TableHelperProps {
  onInsertTable: (tableMarkdown: string) => void;
}

export const TableHelper = ({ onInsertTable }: TableHelperProps) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const generateTableMarkdown = () => {
    const headers = Array(cols).fill('Header').map((h, i) => `${h} ${i + 1}`);
    const separator = Array(cols).fill('---');
    const rowData = Array(rows - 1).fill(null).map(() => 
      Array(cols).fill('Cell')
    );

    let markdown = `| ${headers.join(' | ')} |\n`;
    markdown += `| ${separator.join(' | ')} |\n`;
    
    rowData.forEach(() => {
      markdown += `| ${Array(cols).fill('Data').join(' | ')} |\n`;
    });

    return markdown;
  };

  const handleInsertTable = () => {
    const tableMarkdown = generateTableMarkdown();
    onInsertTable(tableMarkdown);
    setIsPopoverOpen(false);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          title="Insert table"
          onClick={() => setIsPopoverOpen(true)}
        >
          <Table className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Insert Table</h4>
            <p className="text-sm text-muted-foreground">
              Select the dimensions for your table.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="rows">Rows</Label>
              <Input
                id="rows"
                type="number"
                min="2"
                max="20"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 2)}
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="cols">Columns</Label>
              <Input
                id="cols"
                type="number"
                min="2"
                max="10"
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value) || 2)}
                className="col-span-2 h-8"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setIsPopoverOpen(false)}>Cancel</Button>
              <Button variant="ghost" onClick={handleInsertTable}>Insert</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
