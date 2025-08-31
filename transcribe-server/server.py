import os, uuid, tempfile, shutil, subprocess
from typing import Optional, List
from asyncio import Lock
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from faster_whisper import WhisperModel

MODEL_NAME   = os.getenv("WHISPER_MODEL","base.en")
DEVICE       = "cpu"
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE","int8")
NUM_THREADS  = int(os.getenv("WHISPER_THREADS","6"))
ORIGINS = os.getenv("ALLOW_ORIGINS","http://localhost:3000,http://127.0.0.1:3000,http://192.168.29.53:3000").split(",")

os.environ.setdefault("OMP_NUM_THREADS", str(NUM_THREADS))
os.environ.setdefault("MKL_NUM_THREADS", str(NUM_THREADS))
os.environ.setdefault("OPENBLAS_NUM_THREADS", str(NUM_THREADS))

model = WhisperModel(MODEL_NAME, device=DEVICE, compute_type=COMPUTE_TYPE, cpu_threads=NUM_THREADS, num_workers=1)
app = FastAPI(title="Transcription Service (CPU)")

app.add_middleware(CORSMiddleware, allow_origins=ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

job_lock = Lock()

class Segment(BaseModel):
    id: int; start: float; end: float; text: str
class TranscriptionResponse(BaseModel):
    jobId: str; language: Optional[str]=None; text: str; segments: List[Segment]

def to_wav16k(src: str, dst: str):
    subprocess.run(["ffmpeg","-y","-i",src,"-ac","1","-ar","16000","-f","wav","-vn","-sn","-dn",dst],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

@app.get("/ping")
async def ping():
    return {"ok": True}

@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe(audio: UploadFile = File(...), language: Optional[str] = Form(default="en"),
                     beam_size: int = Form(default=1), vad: bool = Form(default=True),
                     word_timestamps: bool = Form(default=False), initial_prompt: Optional[str] = Form(default=None)):
    async with job_lock:
        job_id = str(uuid.uuid4())
        tmpdir = tempfile.mkdtemp(prefix="ts_")
        raw = os.path.join(tmpdir, audio.filename)
        with open(raw, "wb") as f: shutil.copyfileobj(audio.file, f)
        wav = os.path.join(tmpdir, "audio_16k.wav"); to_wav16k(raw, wav)

        seg_iter, info = model.transcribe(
            wav, language=language, vad_filter=vad, beam_size=beam_size,
            word_timestamps=word_timestamps, condition_on_previous_text=True,
            initial_prompt=initial_prompt, no_speech_threshold=0.6,
            log_prob_threshold=-1.0, compression_ratio_threshold=2.4)

        segs, full = [], []
        for i, s in enumerate(seg_iter):
            segs.append(Segment(id=i, start=s.start, end=s.end, text=s.text)); full.append(s.text)

        try: shutil.rmtree(tmpdir)
        except Exception: pass

        return TranscriptionResponse(jobId=job_id, language=getattr(info,"language",language),
                                     text=" ".join(full).strip(), segments=segs)
