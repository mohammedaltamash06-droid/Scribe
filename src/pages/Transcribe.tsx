import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { Play, Download, Mic, Upload, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/medical-hero.jpg";

export default function Transcribe() {
  const { toast } = useToast();
  const [doctorId, setDoctorId] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [transcriptLines, setTranscriptLines] = useState<Array<{
    id: string;
    text: string;
    confidence: 'high' | 'medium' | 'low';
    timestamp: number;
  }>>([]);
  const [mode, setMode] = useState<'lite' | 'balanced' | 'pro'>('balanced');

  // Create job on component mount
  useEffect(() => {
    const createJob = async () => {
      try {
        const response = await fetch('/api/jobs', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          setJobId(data.jobId);
        }
      } catch (error) {
        console.error('Failed to create job:', error);
        toast({
          title: "Error",
          description: "Failed to create transcription job.",
          variant: "destructive"
        });
      }
    };
    createJob();
  }, [toast]);

  const handleFileUpload = async (file: File) => {
    try {
      setUploadedFile(file);
      
      // Create object URL for audio player
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      // Mock API call to create job
      const jobResponse = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId })
      });
      
      if (!jobResponse.ok) throw new Error('Failed to create job');
      
      const { jobId: newJobId } = await jobResponse.json();
      setJobId(newJobId);
      
      // Mock upload file
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch(`/api/jobs/${newJobId}/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) throw new Error('Failed to upload file');
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} is ready for transcription`,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleStartTranscription = async () => {
    if (!uploadedFile || !doctorId.trim() || !jobId) return;
    
    setIsTranscribing(true);
    setTranscriptLines([]);
    
    try {
      // Start EventSource for live streaming
      const source = new EventSource(`/api/jobs/${jobId}/stream`);
      setEventSource(source);
      
      source.onmessage = (event) => {
        const line = event.data;
        if (line.trim()) {
          // Parse the line data - assuming format: confidence|timestamp|text
          const [confidence, timestamp, ...textParts] = line.split('|');
          const text = textParts.join('|');
          
          const newLine = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            text: text || line,
            confidence: (confidence as 'high' | 'medium' | 'low') || 'medium',
            timestamp: parseInt(timestamp) || Date.now()
          };
          
          setTranscriptLines(prev => [...prev, newLine]);
        }
      };
      
      source.onerror = () => {
        console.error('EventSource error');
        source.close();
        setEventSource(null);
        setIsTranscribing(false);
        toast({
          title: "Transcription Error",
          description: "Live transcription stream encountered an error.",
          variant: "destructive"
        });
      };
      
      source.onopen = () => {
        toast({
          title: "Transcription Started",
          description: "Live transcription is now running."
        });
      };
      
    } catch (error) {
      console.error('Transcription error:', error);
      setIsTranscribing(false);
      toast({
        title: "Error",
        description: "Failed to start transcription.",
        variant: "destructive"
      });
    }
  };

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Navigation />
        
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Mic className="h-6 w-6 text-primary" />
                <span>Transcribe</span>
              </CardTitle>
              <Link 
                to="/doctor" 
                className="flex items-center space-x-2 text-sm text-primary hover:text-primary-hover transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open Doctor Profile</span>
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
              />
            </div>
          </CardContent>
        </Card>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>Upload Audio or Video</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UploadDropzone 
              onFileSelected={handleFileUpload}
              uploadedFile={uploadedFile} 
            />
            {uploadedFile && (
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(uploadedFile.size / 1024 / 1024 * 100) / 100} MB
                      {/* Duration would be detected after upload */}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-medical-success border-medical-success">
                    Ready
                  </Badge>
                </div>
              </div>
            )}
            
            {/* Start Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleStartTranscription}
                disabled={!uploadedFile || !doctorId.trim() || isTranscribing}
                size="lg"
                className="bg-gradient-primary hover:bg-primary-hover shadow-medium"
              >
                <Play className="h-5 w-5 mr-2" />
                {isTranscribing ? 'Live Preview Running...' : 'Start Live Preview'}
              </Button>
            </div>
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
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p className="text-sm">Upload a file to see audio controls</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Center: Transcript */}
          <div className="lg:col-span-2">
            {transcriptLines.length > 0 ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Live Transcript</CardTitle>
                  <Badge variant="secondary" className="text-medical-success">
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Live Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No transcript yet</p>
                    <p className="text-sm">Upload a file and start transcription to see live preview</p>
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleExport} 
                  disabled={transcriptLines.length === 0}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export .docx
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label className="text-sm">Mode:</Label>
                <div className="flex border rounded-md">
                  {(['lite', 'balanced', 'pro'] as const).map((modeOption) => (
                    <Button
                      key={modeOption}
                      variant={mode === modeOption ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setMode(modeOption)}
                      className={`rounded-none first:rounded-l-md last:rounded-r-md ${
                        mode === modeOption ? 'bg-primary text-primary-foreground' : ''
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
    </div>
  );
}