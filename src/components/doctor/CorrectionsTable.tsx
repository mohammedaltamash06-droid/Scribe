import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/tables/ConfirmDialog";

interface Correction {
  before: string;
  after: string;
}

interface CorrectionsTableProps {
  doctorId: string;
}

export function CorrectionsTable({ doctorId }: CorrectionsTableProps) {
  const { toast } = useToast();
  const [corrections, setCorrections] = useState<Correction[]>([
    { before: "chest pain", after: "chest discomfort" },
    { before: "shortness of breath", after: "dyspnea" },
    { before: "heart beat", after: "cardiac rhythm" },
  ]);
  const [newBefore, setNewBefore] = useState("");
  const [newAfter, setNewAfter] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    index: number;
    correction: Correction | null;
  }>({ open: false, index: -1, correction: null });

  const addCorrection = () => {
    if (newBefore.trim() && newAfter.trim()) {
      setCorrections([...corrections, { before: newBefore.trim(), after: newAfter.trim() }]);
      setNewBefore("");
      setNewAfter("");
      toast({
        title: "Correction Added",
        description: `"${newBefore}" → "${newAfter}" added successfully.`,
      });
    }
  };

  const handleDeleteClick = (index: number) => {
    setConfirmDelete({
      open: true,
      index,
      correction: corrections[index]
    });
  };

  const confirmDeleteCorrection = () => {
    if (confirmDelete.index >= 0) {
      const removed = corrections[confirmDelete.index];
      setCorrections(corrections.filter((_, i) => i !== confirmDelete.index));
      toast({
        title: "Correction Removed",
        description: `"${removed.before}" → "${removed.after}" removed.`,
      });
    }
    setConfirmDelete({ open: false, index: -1, correction: null });
  };

  const saveAll = () => {
    // Mock API call
    toast({
      title: "Corrections Saved",
      description: `${corrections.length} corrections saved for ${doctorId}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Add New Correction */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add New Correction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="before">Original Text</Label>
              <Input
                id="before"
                placeholder="e.g., chest pain"
                value={newBefore}
                onChange={(e) => setNewBefore(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="after">Corrected Text</Label>
              <Input
                id="after"
                placeholder="e.g., chest discomfort"
                value={newAfter}
                onChange={(e) => setNewAfter(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={addCorrection} disabled={!newBefore.trim() || !newAfter.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Correction
          </Button>
        </CardContent>
      </Card>

      {/* Corrections Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Current Corrections ({corrections.length})</CardTitle>
          <Button onClick={saveAll} disabled={corrections.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Save All
          </Button>
        </CardHeader>
        <CardContent>
          {corrections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No corrections configured yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Original Text</TableHead>
                  <TableHead>Corrected Text</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {corrections.map((correction, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm bg-destructive/5 rounded">
                      {correction.before}
                    </TableCell>
                    <TableCell className="font-mono text-sm bg-medical-success/5 rounded">
                      {correction.after}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete(prev => ({ ...prev, open }))}
        onConfirm={confirmDeleteCorrection}
        title="Delete Correction"
        description={`Are you sure you want to delete the correction "${confirmDelete.correction?.before}" → "${confirmDelete.correction?.after}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}