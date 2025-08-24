"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navigation } from "@/components/ui/navigation";
import { UploadDropzone } from "@/components/transcribe/UploadDropzone";
import { AudioPlayer } from "@/components/transcribe/AudioPlayer";
import { TranscriptList } from "@/components/transcribe/TranscriptList";
import { RightRailTabs } from "@/components/transcribe/RightRailTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Download, Mic, Upload, ExternalLink, AlertCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TranscribePage() {
  const { toast } = useToast();
  const [doctorId, setDoctorId] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<'idle' | 'uploaded' | 'queued' | 'running' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [transcriptLines, setTranscriptLines] = useState<Array<{
    id: string;
    text: string;
    confidence: 'high' | 'medium' | 'low';
    timestamp: number;
  }>>([]);
  const [mode, setMode] = useState<'lite' | 'balanced' | 'pro'>('balanced');
  const [doctorCorrections, setDoctorCorrections] = useState<Array<{
    id: string;
    before: string;
    after: string;
    type: 'dx' | 'rx' | 'proc' | 'correction';
  }>>([]);

  // Load doctor corrections
  useEffect(() => {
    const loadDoctorCorrections = async () => {
      if (!doctorId.trim()) return;
      
      try {
        const response = await fetch(`/api/doctor/${doctorId}/corrections`);
        if (response.ok) {
          const data = await response.json();
          setDoctorCorrections(data.items || []);
        }
      } catch (error) {
        console.error('Failed to load doctor corrections:', error);
      }
    };
    
    loadDoctorCorrections();
  }, [doctorId]);

  // Polling effect for job status
  useEffect(() => {
    if (!jobId || !['queued', 'running'].includes(jobStatus)) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}/status`);
        if (response.ok) {
          const data = await response.json();
          setJobStatus(data.status);
          setProgress(data.progress || 0);
          
          if (data.status === 'done') {
            // Fetch transcript result
            const resultResponse = await fetch(`/api/jobs/${jobId}/result`);
            if (resultResponse.ok) {
              const resultData = await resultResponse.json();
              let lines = resultData.lines || [];
              
              // Apply doctor corrections automatically with improved logic
              lines = applyDoctorCorrections(lines, doctorCorrections);
              
              setTranscriptLines(lines);
              toast({
                title: "Transcription Complete",
                description: "Your transcript is ready for review."
              });
            }
          } else if (data.status === 'error') {
            setErrorMessage(data.error || 'Unknown error occurred');
            toast({
              title: "Transcription Failed",
              description: data.error || 'Unknown error occurred',
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        setJobStatus('error');
        setErrorMessage('Failed to check job status');
      }
    };

    const interval = setInterval(pollStatus, 2500);
    return () => clearInterval(interval);
  }, [jobId, jobStatus, doctorCorrections, toast]);

  // Improved doctor corrections with case-insensitive whole-word replacement
  const applyDoctorCorrections = (lines: any[], corrections: any[]) => {
    return lines.map(line => {
      let correctedText = line.text;
      corrections.forEach(correction => {
        if (correction.before && correction.after) {
          // Escape special regex characters in the search term
          const escapedBefore = correction.before.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // Create regex for case-insensitive whole-word replacement
          const regex = new RegExp(`\\b${escapedBefore}\\b`, 'gi');
          correctedText = correctedText.replace(regex, correction.after);
        }
      });
      return { ...line, text: correctedText };
    });
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploadedFile(file);
      setJobStatus('uploaded');
      setErrorMessage("");
      
      // Create object URL for audio player
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} is ready for transcription`,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      setJobStatus('error');
      setErrorMessage('Failed to upload file');
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleStartTranscription = async () => {
    if (!uploadedFile || !doctorId.trim()) return;
    
    setJobStatus('queued');
    setProgress(0);
    setTranscriptLines([]);
    setErrorMessage("");
    
    try {
      // Create job
      const jobResponse = await fetch('/api/jobs', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!jobResponse.ok) throw new Error('Failed to create job');
      
      const jobData = await jobResponse.json();
      setJobId(jobData.jobId);
      
      // Upload file
      const formData = new FormData();
      formData.set("file", uploadedFile);
      
      const uploadResponse = await fetch(`/api/jobs/${jobData.jobId}/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) throw new Error('Failed to upload file');
      
      // Start processing
      const processResponse = await fetch(`/api/jobs/${jobData.jobId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      
      if (!processResponse.ok) throw new Error('Failed to start processing');
      
      setJobStatus('running');
      toast({
        title: "Transcription Started",
        description: "Processing your audio file..."
      });
      
    } catch (error) {
      console.error('Transcription error:', error);
      setJobStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      toast({
        title: "Error",
        description: "Failed to start transcription.",
        variant: "destructive"
      });
    }
  };

  const handleRetry = () => {
    setJobStatus('uploaded');
    setErrorMessage("");
    setProgress(0);
  };

  const handleEditLine = (index: number, newText: string) => {
    setTranscriptLines(prev => 
      prev.map((line, i) => i === index ? { ...line, text: newText } : line)
    );
  };

  const handleExport = async () => {
    if (transcriptLines.length === 0) {
      toast({
        title: "No Content",
        description: "No transcript content to export.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/exports/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Transcription - ${doctorId} - ${new Date().toLocaleDateString()}`,
          lines: transcriptLines
        })
      });

      if (response.ok) {
        // Create download link
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcription-${doctorId}-${Date.now()}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: "Document downloaded successfully."
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export document.",
        variant: "destructive"
      });
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Navigation />
        
        {/* Header */}
        <Card className="rounded-xl shadow-soft">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center space-x-2">
                <Mic className="h-6 w-6 text-primary" />
                <span>Medical Transcription</span>
              </CardTitle>
              <Link 
                href="/doctor" 
                className="flex items-center space-x-2 text-sm text-primary hover:text-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-2 py-1"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Manage Doctor Profile</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="doctorId">Doctor ID</Label>
              <Input
                id="doctorId"
                placeholder="Enter doctor ID (e.g., johnson, chen, rodriguez)"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground">
                Required for applying personalized corrections and preferences
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Card */}
        <Card className="rounded-xl shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>Upload Audio or Video File</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UploadDropzone 
              onFileSelected={handleFileUpload}
              uploadedFile={uploadedFile} 
            />
            
            {uploadedFile && (
              <div className="p-4 bg-medical-success/5 border border-medical-success/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(uploadedFile.size / 1024 / 1024 * 100) / 100} MB
                    </p>
                  </div>
                  <Badge variant="outline" className="text-medical-success border-medical-success bg-medical-success/10">
                    Ready for Processing
                  </Badge>
                </div>
              </div>
            )}
            
            {/* Processing Status or Start Button */}
            {jobStatus === 'error' && (
              <Alert variant="destructive" className="rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{errorMessage}</span>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    size="sm"
                    className="ml-4 hover:bg-destructive/10"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            {(['queued', 'running'].includes(jobStatus)) && (
              <div className="space-y-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium">
                    {jobStatus === 'queued' ? 'Queued for processing...' : 'Processing audio file...'}
                  </span>
                  <span className="text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  This may take a few minutes depending on file size and selected mode
                </p>
              </div>
            )}
            
            {jobStatus === 'uploaded' && (
              <div className="flex justify-center">
                <Button
                  onClick={handleStartTranscription}
                  disabled={!uploadedFile || !doctorId.trim()}
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90 shadow-medium transition-all duration-200"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Transcription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Audio Player */}
          <div className="lg:col-span-1">
            {uploadedFile ? (
                <AudioPlayer 
                  src={audioUrl}
                  onBack15={() => console.log('Back 15s')}
                  onPlayPause={(playing) => console.log('Play/Pause:', playing)}
                />
            ) : (
              <Card className="rounded-xl shadow-soft">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Mic className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Upload a file to see audio controls</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Center: Transcript */}
          <div className="lg:col-span-2">
            {transcriptLines.length > 0 ? (
              <Card className="rounded-xl shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Medical Transcript</CardTitle>
                  <Badge variant="secondary" className="text-medical-success bg-medical-success/10 border-medical-success/20">
                    {transcriptLines.length} lines
                  </Badge>
                </CardHeader>
                <CardContent>
                  <TranscriptList 
                    lines={transcriptLines}
                    onEditLine={handleEditLine}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-xl shadow-soft">
                <CardHeader>
                  <CardTitle>Medical Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No transcript available</p>
                    <p className="text-sm">Upload an audio file and start transcription to see results</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Rail */}
          <div className="lg:col-span-1">
            <RightRailTabs doctorId={doctorId} />
          </div>
        </div>

        {/* Footer Bar */}
        <Card className="rounded-xl shadow-soft">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleExport} 
                  disabled={transcriptLines.length === 0}
                  variant="outline"
                  className="hover:bg-primary/10 hover:text-primary hover:border-primary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as Word Document
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium">Processing Mode:</Label>
                <div className="flex border rounded-lg overflow-hidden">
                  {(['lite', 'balanced', 'pro'] as const).map((modeOption) => (
                    <Button
                      key={modeOption}
                      variant={mode === modeOption ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setMode(modeOption)}
                      className={`rounded-none border-none ${
                        mode === modeOption 
                          ? 'bg-primary text-primary-foreground shadow-none' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      {modeOption === 'lite' && 'Lite'}
                      {modeOption === 'balanced' && 'Balanced'}
                      {modeOption === 'pro' && 'Pro'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}