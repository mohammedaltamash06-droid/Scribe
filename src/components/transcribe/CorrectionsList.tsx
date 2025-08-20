import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight } from "lucide-react";

interface Correction {
  before: string;
  after: string;
}

interface CorrectionsListProps {
  doctorId: string;
}

export function CorrectionsList({ doctorId }: CorrectionsListProps) {
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call - replace with actual API
    const fetchCorrections = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data based on doctor
      const mockCorrections: Correction[] = [
        { before: "chest pain", after: "chest discomfort" },
        { before: "shortness of breath", after: "dyspnea" },
        { before: "heart beat", after: "cardiac rhythm" },
        { before: "high blood pressure", after: "hypertension" },
        { before: "sugar diabetes", after: "diabetes mellitus" },
      ];
      
      setCorrections(mockCorrections);
      setLoading(false);
    };

    if (doctorId) {
      fetchCorrections();
    }
  }, [doctorId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-10 bg-muted rounded-md"></div>
          </div>
        ))}
      </div>
    );
  }

  if (corrections.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p className="text-sm">No corrections configured for this doctor</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-64">
      <div className="space-y-2">
        {corrections.map((correction, index) => (
          <div
            key={index}
            className="p-3 bg-secondary/50 rounded-lg space-y-2"
          >
            <div className="flex items-center space-x-2 text-xs">
              <Badge variant="outline" className="text-destructive border-destructive/20">
                {correction.before}
              </Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline" className="text-medical-success border-medical-success/20">
                {correction.after}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}