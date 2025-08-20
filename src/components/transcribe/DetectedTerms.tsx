import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Stethoscope, Pill, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DetectedTerm {
  text: string;
  type: 'diagnosis' | 'medication' | 'procedure';
  confidence: number;
}

interface DetectedTermsProps {
  doctorId: string;
}

export function DetectedTerms({ doctorId }: DetectedTermsProps) {
  const { toast } = useToast();
  const [detectedTerms] = useState<DetectedTerm[]>([
    { text: "chest pain", type: "diagnosis", confidence: 0.95 },
    { text: "electrocardiogram", type: "procedure", confidence: 0.88 },
    { text: "aspirin", type: "medication", confidence: 0.92 },
    { text: "hypertension", type: "diagnosis", confidence: 0.87 },
    { text: "chest X-ray", type: "procedure", confidence: 0.91 },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'diagnosis':
        return <Stethoscope className="h-3 w-3" />;
      case 'medication':
        return <Pill className="h-3 w-3" />;
      case 'procedure':
        return <Activity className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'diagnosis':
        return 'text-medical-info border-medical-info/20 bg-medical-info/5';
      case 'medication':
        return 'text-medical-success border-medical-success/20 bg-medical-success/5';
      case 'procedure':
        return 'text-medical-warning border-medical-warning/20 bg-medical-warning/5';
      default:
        return 'text-muted-foreground border-border bg-background';
    }
  };

  const handleAddToDoctor = (term: DetectedTerm) => {
    if (!doctorId) {
      toast({
        title: "No Doctor Selected",
        description: "Please select a doctor first to add terms to their favorites.",
        variant: "destructive"
      });
      return;
    }

    // Mock API call
    toast({
      title: "Term Added",
      description: `"${term.text}" added to Dr. ${doctorId}'s ${term.type} favorites.`,
    });
  };

  if (detectedTerms.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p className="text-sm">No medical terms detected yet</p>
        <p className="text-xs mt-1">Terms will appear here during transcription</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-64">
      <div className="space-y-2">
        {detectedTerms.map((term, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-soft ${getTypeColor(term.type)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getIcon(term.type)}
                <span className="text-xs font-medium capitalize">{term.type}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {Math.round(term.confidence * 100)}%
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{term.text}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddToDoctor(term)}
                disabled={!doctorId}
                className="h-6 px-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}