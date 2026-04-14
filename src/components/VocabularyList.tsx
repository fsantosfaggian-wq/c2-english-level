import React, { useState } from 'react';
import { Word, WordStatus } from '../hooks/use-vocabulary';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpeech } from '@/hooks/use-speech';

interface VocabularyListProps {
  words: Word[];
  onStatusUpdate: (id: number, status: WordStatus) => void;
}

const VocabularyList = ({ words, onStatusUpdate }: VocabularyListProps) => {
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const { speak, isSpeaking } = useSpeech();

  const getStatusColor = (status: WordStatus) => {
    switch (status) {
      case 'learned': return 'bg-green-100 text-green-700 border-green-200';
      case 'learning': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleSpeak = async (word: Word) => {
    if (speakingId === word.id && isSpeaking) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(word.id);
    await speak(word.word);
    setSpeakingId(null);
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[200px] font-bold">Word</TableHead>
            <TableHead className="hidden md:table-cell font-bold">Definition</TableHead>
            <TableHead className="w-[150px] font-bold">Status</TableHead>
            <TableHead className="w-[150px] text-right font-bold">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {words.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                No words found matching your search.
              </TableCell>
            </TableRow>
          ) : (
            words.map((word) => (
              <TableRow key={word.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-serif font-bold text-lg text-primary">
                  <div className="flex items-center gap-2">
                    <span>{word.word}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSpeak(word)}
                      className={cn(
                        "h-8 w-8 hover:bg-primary/10 transition-all",
                        speakingId === word.id && isSpeaking && "text-primary animate-pulse"
                      )}
                      aria-label="Listen to pronunciation"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground leading-relaxed">
                  {word.definition}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("capitalize px-3 py-1", getStatusColor(word.status))}>
                    {word.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Select
                    value={word.status}
                    onValueChange={(value) => onStatusUpdate(word.id, value as WordStatus)}
                  >
                    <SelectTrigger className="w-[130px] ml-auto h-8 text-xs">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="learned">Learned</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default VocabularyList;