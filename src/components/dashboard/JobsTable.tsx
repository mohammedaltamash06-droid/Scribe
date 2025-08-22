import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";

interface Job {
  id: string;
  fileName: string;
  doctor: string;
  duration: string;
  status: 'completed' | 'processing' | 'failed';
  createdAt: string;
  corrections: number;
}

export function JobsTable() {
  const mockJobs: Job[] = [
    {
      id: '1',
      fileName: 'patient_interview_001.mp3',
      doctor: 'Dr. Sarah Johnson',
      duration: '12:34',
      status: 'completed',
      createdAt: '2024-01-15 14:30',
      corrections: 8
    },
    {
      id: '2',
      fileName: 'consultation_notes_002.wav',
      doctor: 'Dr. Michael Chen',
      duration: '8:45',
      status: 'completed',
      createdAt: '2024-01-15 13:15',
      corrections: 5
    },
    {
      id: '3',
      fileName: 'follow_up_003.m4a',
      doctor: 'Dr. Emily Rodriguez',
      duration: '15:22',
      status: 'processing',
      createdAt: '2024-01-15 12:00',
      corrections: 0
    },
    {
      id: '4',
      fileName: 'emergency_notes_004.mp3',
      doctor: 'Dr. Sarah Johnson',
      duration: '6:18',
      status: 'failed',
      createdAt: '2024-01-15 11:30',
      corrections: 0
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-medical-success border-medical-success/20 bg-medical-success/5';
      case 'processing':
        return 'text-medical-warning border-medical-warning/20 bg-medical-warning/5';
      case 'failed':
        return 'text-destructive border-destructive/20 bg-destructive/5';
      default:
        return 'text-muted-foreground border-border bg-background';
    }
  };

  if (mockJobs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted/50 flex items-center justify-center">
          <Eye className="h-8 w-8" />
        </div>
        <p className="text-lg font-medium">No transcription jobs yet</p>
        <p className="text-sm mt-1">Upload your first audio file to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <h3 className="font-medium text-foreground">Recent Transcription Jobs</h3>
        <p className="text-sm text-muted-foreground mt-1">Latest audio transcription activity</p>
      </div>
      
      {mockJobs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted/50 flex items-center justify-center">
            <Eye className="h-8 w-8" />
          </div>
          <p className="text-lg font-medium">No transcription jobs yet</p>
          <p className="text-sm mt-1">Upload your first audio file to get started</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead className="font-medium">File Name</TableHead>
              <TableHead className="font-medium">Doctor</TableHead>
              <TableHead className="font-medium">Duration</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Created</TableHead>
              <TableHead className="font-medium">Corrections</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockJobs.map((job) => (
              <TableRow key={job.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">{job.fileName}</TableCell>
                <TableCell className="text-muted-foreground">{job.doctor}</TableCell>
                <TableCell className="font-mono text-sm">{job.duration}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-sm">{job.createdAt}</TableCell>
                <TableCell>
                  {job.corrections > 0 ? (
                    <Badge variant="outline" className="text-medical-info border-medical-info/20 bg-medical-info/5">
                      {job.corrections}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={job.status !== 'completed'}
                      className="hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label={`View ${job.fileName}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={job.status !== 'completed'}
                      className="hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label={`Download ${job.fileName}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}