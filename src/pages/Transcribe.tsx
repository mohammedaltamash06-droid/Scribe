import { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { UploadDropzone } from "@/components/transcribe/UploadDropzone";
import { AudioPlayer } from "@/components/transcribe/AudioPlayer";
import { TranscriptList } from "@/components/transcribe/TranscriptList";
import { RightRailTabs } from "@/components/transcribe/RightRailTabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Download, Mic } from "lucide-react";
import heroImage from "@/assets/medical-hero.jpg";

export default function Transcribe() {
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptLines, setTranscriptLines] = useState<Array<{
    id: string;
    text: string;
    confidence: 'high' | 'medium' | 'low';
    timestamp: number;
  }>>([]);
  const [mode, setMode] = useState<'lite' | 'balanced' | 'pro'>('balanced');

  const mockDoctors = [
    { id: '1', name: 'Dr. Sarah Johnson' },
    { id: '2', name: 'Dr. Michael Chen' },
    { id: '3', name: 'Dr. Emily Rodriguez' },
  ];

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  const handleStartTranscription = async () => {
    if (!uploadedFile || !selectedDoctor) return;
    
    setIsTranscribing(true);
    // Mock transcription process
    setTimeout(() => {
      const mockLines = [
        { id: '1', text: 'Patient presents with chest pain and shortness of breath.', confidence: 'high' as const, timestamp: 0 },
        { id: '2', text: 'Physical examination reveals irregular heart rhythm.', confidence: 'medium' as const, timestamp: 3000 },
        { id: '3', text: 'Recommend ECG and chest X-ray for further evaluation.', confidence: 'low' as const, timestamp: 6000 },
      ];
      setTranscriptLines(mockLines);
      setIsTranscribing(false);
    }, 2000);
  };

  const handleEditLine = (index: number, newText: string) => {
    setTranscriptLines(prev => 
      prev.map((line, i) => i === index ? { ...line, text: newText } : line)
    );
  };

  const handleExport = () => {
    // Mock export functionality
    console.log('Exporting document...');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Navigation />
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl">
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="Medical transcription workspace" 
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-primary opacity-90" />
          </div>
          <div className="relative px-8 py-12 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Medical Transcription Suite
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Transform audio recordings into accurate medical documentation with AI-powered transcription and auto-corrections.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Transcription */}
          <div className="lg:col-span-2 space-y-6">
            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="h-5 w-5 text-primary" />
                  <span>Transcription Setup</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Doctor</label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDoctors.map(doctor => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Transcription Mode</label>
                    <Select value={mode} onValueChange={(value: 'lite' | 'balanced' | 'pro') => setMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lite">Lite - Fast</SelectItem>
                        <SelectItem value="balanced">Balanced - Recommended</SelectItem>
                        <SelectItem value="pro">Pro - Highest Accuracy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Area */}
            <UploadDropzone onFileUpload={handleFileUpload} />

            {/* Audio Player */}
            {uploadedFile && (
              <AudioPlayer file={uploadedFile} />
            )}

            {/* Start Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleStartTranscription}
                disabled={!uploadedFile || !selectedDoctor || isTranscribing}
                size="lg"
                className="bg-gradient-primary hover:bg-primary-hover shadow-medium"
              >
                <Play className="h-5 w-5 mr-2" />
                {isTranscribing ? 'Transcribing...' : 'Start Live Preview'}
              </Button>
            </div>

            {/* Transcript */}
            {transcriptLines.length > 0 && (
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
            )}

            {/* Export Controls */}
            {transcriptLines.length > 0 && (
              <div className="flex justify-center space-x-4">
                <Button onClick={handleExport} variant="outline" size="lg">
                  <Download className="h-5 w-5 mr-2" />
                  Export to Word
                </Button>
              </div>
            )}
          </div>

          {/* Right Rail */}
          <div className="space-y-6">
            <RightRailTabs doctorId={selectedDoctor} />
          </div>
        </div>
      </div>
    </div>
  );
}