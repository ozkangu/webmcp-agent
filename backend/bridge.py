"""
FrontendToolBridge - WebSocket üzerinden frontend'e tool call gönderen köprü.
"""

import asyncio
import uuid
from typing import Optional
from fastapi import WebSocket


class FrontendToolBridge:
    def __init__(self):
        self.websocket: Optional[WebSocket] = None
        self.pending_calls: dict[str, asyncio.Future] = {}

    def set_websocket(self, ws: Optional[WebSocket]):
        self.websocket = ws

    async def call_frontend(self, tool_name: str, params: dict) -> dict:
        if not self.websocket:
            return {"error": "Frontend bağlı değil"}

        call_id = str(uuid.uuid4())
        future = asyncio.get_event_loop().create_future()
        self.pending_calls[call_id] = future

        await self.websocket.send_json({
            "type": "tool_call",
            "callId": call_id,
            "toolName": tool_name,
            "params": params,
        })

        try:
            return await asyncio.wait_for(future, timeout=30.0)
        except asyncio.TimeoutError:
            self.pending_calls.pop(call_id, None)
            return {"error": "Timeout"}

    def resolve(self, call_id: str, result: dict):
        future = self.pending_calls.pop(call_id, None)
        if future and not future.done():
            future.set_result(result)


bridge = FrontendToolBridge()
