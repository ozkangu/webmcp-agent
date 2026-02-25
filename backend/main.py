"""
SARP WebMCP Demo - Backend (v2 Dynamic)
FastAPI + Agno Agent + WebSocket
Agent, frontend tool manifest'inden dinamik olarak oluşturulur.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from websocket_handler import websocket_agent

app = FastAPI(title="SARP WebMCP Demo v2", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "mode": "dynamic",
        "description": "Agent created per WebSocket connection from frontend tool manifest",
    }


app.websocket("/ws/agent")(websocket_agent)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
