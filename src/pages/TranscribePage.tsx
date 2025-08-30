import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { UploadDropzone } from "@/components/transcribe/UploadDropzone";
import { AudioPlayer } from "@/components/transcribe/AudioPlayer";
import { TranscriptList } from "@/components/transcribe/TranscriptList";
import { RightRailTabs } from "@/components/transcribe/RightRailTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Mic, AlertCircle, Download, ExternalLink, Upload } from "lucide-react";

type JobStatus = "idle" | "uploaded" | "queued" | "running" | "done" | "error";

interface TranscriptLine {
  id: string;
  text: string;
  timestamp: number;
  speaker?: string;
}

export default function TranscribePage() {
  const { toast } = useToast();
  const [doctorId, setDoctorId] = useState("");
  const [jobStatus, setJobStatus] = useState<JobStatus>("idle");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [corrections, setCorrections] = useState<Array<{ before: string; after: string }>>([]);
  const [mode, setMode] = useState<"Lite" | "Balanced" | "Pro">("Balanced");

  const handleFileUpload = useCallback((file: File) => {
    setUploadedFile(file);
    setJobStatus("uploaded");
    setError(null);
    toast({
      title: "File uploaded",
      description: `${file.name} is ready for transcription`,
    });
  }, [toast]);

  async function handleStart() {
    if (!uploadedFile) return;

    try {
      setJobStatus("queued");
      setProgress(0);
      setError(null);

      // 1) Create job (doctorId is optional)
      const res1 = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: doctorId || "demo" })
      });
      const { jobId } = await res1.json();
      if (!jobId) throw new Error("Failed to create job");
      setJobId(jobId);

      // 2) Upload file
      const fd = new FormData();
      fd.set("file", uploadedFile);
      const res2 = await fetch(`/api/jobs/${jobId}/upload`, { method: "POST", body: fd });
      const up = await res2.json();
      if (!res2.ok) throw new Error(up?.error || "Upload failed");

      // 3) Kick off processing
      await fetch(`/api/jobs/${jobId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: mode || "Balanced" })
      });

      // 4) Poll status until done
      const poll = async () => {
        const r = await fetch(`/api/jobs/${jobId}/status`);
        const s = await r.json();
        setJobStatus(s.state);
        setProgress(s.progress || 0);
        if (s.state === "done") return true;
        if (s.state === "error") throw new Error(s.message || "Processing error");
        await new Promise(r => setTimeout(r, 1500));
        return poll();
      };

      await poll();

      // 5) Fetch full transcript
      const r3 = await fetch(`/api/jobs/${jobId}/result`);
      const { lines } = await r3.json();

      // TODO: set lines into your TranscriptList component state
      setTranscript(lines);

    } catch (err) {
      console.error(err);
      setJobStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");
      toast({
        title: "Transcription error",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive"
      });
    }
  }

  const applyCorrections = (transcriptData: TranscriptLine[], corrections: Array<{ before: string; after: string }>) => {
    return transcriptData.map(line => ({
      ...line,
      text: corrections.reduce((text, correction) => {
        const regex = new RegExp(`\\b${correction.before.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        return text.replace(regex, correction.after);
      }, line.text)
    }));
  };

  const exportToDocx = async () => {
    try {
      const response = await fetch("/api/exports/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadedFile?.name || "Transcript",
          lines: transcript,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${uploadedFile?.name || "transcript"}.docx`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Export successful",
          description: "Transcript exported as Word document",
        });
      }
    } catch (err) {
      toast({
        title: "Export failed",
        description: "Failed to export transcript",
        variant: "destructive",
      });
    }
  };

  const retryTranscription = () => {
    setJobStatus("uploaded");
    setError(null);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Mic className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Transcribe</h1>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          Open Doctor Profile
        </Button>
      </div>

      {/* Doctor ID Input */}
      <div className="space-y-2">
        <Label htmlFor="doctorId">Doctor ID</Label>
        <Input
          id="doctorId"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          placeholder="Enter doctor ID (e.g., johnson, chen, rodriguez)"
          className="max-w-md"
        />
      </div>

      {/* Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Upload Audio or Video</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {jobStatus === "idle" && (
              <div className="space-y-4">
                <UploadDropzone onFileSelected={handleFileUpload} uploadedFile={uploadedFile} />
                <p className="text-muted-foreground text-center">Upload a file to see audio controls</p>
              </div>
            )}

          {jobStatus === "uploaded" && uploadedFile && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">{uploadedFile.name}</h3>
                <p className="text-sm text-muted-foreground">Ready for transcription</p>
              </div>
              <Button onClick={handleStart} className="w-full">
                Transcribe Now
              </Button>
            </div>
          )}

          {(jobStatus === "queued" || jobStatus === "running") && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium mb-2">
                  {jobStatus === "queued" ? "Queued..." : "Processing..."}
                </h3>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
              </div>
            </div>
          )}

          {jobStatus === "error" && error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                {error}
                <Button variant="outline" size="sm" onClick={retryTranscription}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {jobStatus === "done" && (
            <div className="space-y-4">
              {uploadedFile && (
                <AudioPlayer 
                  src={URL.createObjectURL(uploadedFile)} 
                />
              )}
            </div>
          )}
          </div>

          <div className="lg:col-span-1">
            <RightRailTabs doctorId={doctorId} />
          </div>
        </div>
      </div>

      {/* Transcript Section */}
      {jobStatus === "done" && transcript.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Transcript</h2>
            <Button onClick={exportToDocx} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export .docx
            </Button>
          </div>
          <TranscriptList 
            lines={transcript.map(line => ({ ...line, confidence: 'high' as const }))}
            onEditLine={(index, newText) => {
              const updatedTranscript = [...transcript];
              updatedTranscript[index].text = newText;
              setTranscript(updatedTranscript);
            }}
          />
        </div>
      )}

      {/* Mode Selector */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Mode:
        </div>
        <div className="flex items-center space-x-2">
          {(["Lite", "Balanced", "Pro"] as const).map((modeOption) => (
            <Button
              key={modeOption}
              variant={mode === modeOption ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(modeOption)}
              className={mode === modeOption ? "bg-primary text-primary-foreground" : ""}
            >
              {modeOption}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}