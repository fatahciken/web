from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import httpx
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_BASE = "https://noderouter.groups.id/v1"
API_KEY = os.getenv("API_KEY", "sk-anything")

@app.get("/api/models")
async def get_models():
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{API_BASE}/models", headers={"Authorization": f"Bearer {API_KEY}"})
        return res.json()

@app.post("/api/chat")
async def chat(request: Request):
    body = await request.json()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    if body.get("stream"):
        async def stream_response():
            async with httpx.AsyncClient() as client:
                async with client.stream("POST", f"{API_BASE}/chat/completions", json=body, headers=headers) as res:
                    async for chunk in res.aiter_text():
                        if chunk.startswith("data: "):
                            yield chunk + "\n\n"
        
        return StreamingResponse(stream_response(), media_type="text/event-stream")
    else:
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{API_BASE}/chat/completions", json=body, headers=headers)
            return res.json()

@app.get("/")
async def root():
    return {"status": "CIKEN AI Backend Running 🚀"}
