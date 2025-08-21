import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface Correction {
  before: string;
  after: string;
}

interface CorrectionFormProps {
  onSubmit: (correction: Correction) => void;
  onCancel?: () => void;
  initialData?: Correction;
  title?: string;
}

export function CorrectionForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  title = "Add New Correction" 
}: CorrectionFormProps) {
  const [before, setBefore] = useState(initialData?.before || "");
  const [after, setAfter] = useState(initialData?.after || "");
  const [errors, setErrors] = useState<{ before?: string; after?: string }>({});

  const validate = () => {
    const newErrors: { before?: string; after?: string } = {};
    
    if (!before.trim()) {
      newErrors.before = "Original text is required";
    }
    
    if (!after.trim()) {
      newErrors.after = "Corrected text is required";
    }
    
    if (before.trim() === after.trim()) {
      newErrors.after = "Corrected text must be different from original";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({
        before: before.trim(),
        after: after.trim()
      });
      
      // Reset form if not editing
      if (!initialData) {
        setBefore("");
        setAfter("");
      }
    }
  };

  const handleCancel = () => {
    setBefore(initialData?.before || "");
    setAfter(initialData?.after || "");
    setErrors({});
    onCancel?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="before" className="required">
                Original Text
              </Label>
              <Input
                id="before"
                placeholder="e.g., chest pain"
                value={before}
                onChange={(e) => setBefore(e.target.value)}
                className={errors.before ? "border-destructive" : ""}
                aria-invalid={!!errors.before}
                aria-describedby={errors.before ? "before-error" : undefined}
              />
              {errors.before && (
                <p id="before-error" className="text-sm text-destructive">
                  {errors.before}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="after" className="required">
                Corrected Text
              </Label>
              <Input
                id="after"
                placeholder="e.g., chest discomfort"
                value={after}
                onChange={(e) => setAfter(e.target.value)}
                className={errors.after ? "border-destructive" : ""}
                aria-invalid={!!errors.after}
                aria-describedby={errors.after ? "after-error" : undefined}
              />
              {errors.after && (
                <p id="after-error" className="text-sm text-destructive">
                  {errors.after}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={!before.trim() || !after.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              {initialData ? "Update" : "Add"} Correction
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}