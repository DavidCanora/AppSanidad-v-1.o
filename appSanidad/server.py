from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from modules.clinical_analyzer import ClinicalAnalyzer
import os
import uuid

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = ClinicalAnalyzer()

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

PNG_SIG = b"\x89PNG\r\n\x1a\n"
JPEG_SIGS = (b"\xff\xd8\xff",)

def _secure_extension(filename: str) -> str:
    if "." not in filename:
        raise ValueError("El archivo no tiene extensión.")
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Extensión '{ext}' no permitida.")
    return ext

def _validate_image_bytes(content: bytes, ext: str):
    is_png = content.startswith(PNG_SIG)
    is_jpeg = any(content.startswith(sig) for sig in JPEG_SIGS)
    if not (is_png or is_jpeg):
        raise ValueError("El contenido no es una imagen válida (solo PNG o JPEG).")

@app.post("/api/v1/analyze")
async def analyze_file(file: UploadFile = File(...), format_type: str = Form(...)):
    try:
        ext = _secure_extension(file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    content = await file.read()

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="El archivo supera el límite de 10 MB.")

    if ext in ("png", "jpg", "jpeg"):
        try:
            _validate_image_bytes(content, ext)
        except ValueError as e:
            raise HTTPException(status_code=415, detail=str(e))

    safe_name = f"{uuid.uuid4().hex}.{ext}"
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, safe_name)

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        results = analyzer.process_document(file_path, ext)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
