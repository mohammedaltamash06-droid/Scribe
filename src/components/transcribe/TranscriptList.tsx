import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit3, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptLine {
  id: string;
  text: string;
  confidence: 'high' | 'medium' | 'low';
  timestamp: number;
}

interface TranscriptListProps {
  lines: TranscriptLine[];
  onEditLine: (index: number, newText: string) => void;
  lowConfidenceIndices?: number[];
}

export function TranscriptList({ lines, onEditLine, lowConfidenceIndices = [] }: TranscriptListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const startEditing = (index: number, currentText: string) => {
    setEditingIndex(index);
    setEditText(currentText);
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      onEditLine(editingIndex, editText);
      setEditingIndex(null);
      setEditText("");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-medical-confidence-high border-medical-confidence-high/20 bg-medical-confidence-high/5';
      case 'medium':
        return 'text-medical-confidence-medium border-medical-confidence-medium/20 bg-medical-confidence-medium/5';
      case 'low':
        return 'bg-yellow-50 text-medical-confidence-low border-medical-confidence-low/20';
      default:
        return 'text-foreground border-border bg-background';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor(timestamp / 60000);
    const seconds = Math.floor((timestamp % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (lines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No transcript lines yet. Start transcription to see live preview.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {lines.map((line, index) => (
        <div
          key={line.id}
          className={cn(
            "p-4 rounded-lg border transition-all duration-200 hover:shadow-soft",
            getConfidenceColor(line.confidence),
            lowConfidenceIndices.includes(index) && "bg-yellow-50"
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {formatTimestamp(line.timestamp)}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  line.confidence === 'high' && "border-medical-confidence-high text-medical-confidence-high",
                  line.confidence === 'medium' && "border-medical-confidence-medium text-medical-confidence-medium",
                  line.confidence === 'low' && "border-medical-confidence-low text-medical-confidence-low"
                )}
              >
                {line.confidence} confidence
              </Badge>
            </div>
            
            {editingIndex !== index && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startEditing(index, line.text)}
                className="hover:bg-background/50"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {editingIndex === index ? (
            <div className="space-y-2">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-background"
                autoFocus
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={saveEdit}>
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed">{line.text}</p>
          )}
        </div>
      ))}
    </div>
  );
}