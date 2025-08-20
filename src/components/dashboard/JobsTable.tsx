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

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Corrections</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockJobs.map((job) => (
            <TableRow key={job.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{job.fileName}</TableCell>
              <TableCell>{job.doctor}</TableCell>
              <TableCell>{job.duration}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{job.createdAt}</TableCell>
              <TableCell>
                {job.corrections > 0 ? (
                  <Badge variant="outline" className="text-medical-info border-medical-info/20">
                    {job.corrections}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button variant="ghost" size="sm" disabled={job.status !== 'completed'}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" disabled={job.status !== 'completed'}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}