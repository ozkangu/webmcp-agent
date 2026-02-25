"""
SARP WebMCP Demo - Backend (v2 Modular)
FastAPI + Agno Agent + WebSocket
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from websocket_handler import websocket_agent
from agent import agent

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
    return {"status": "ok", "agent": agent.name, "tools": len(agent.tools)}


app.websocket("/ws/agent")(websocket_agent)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
