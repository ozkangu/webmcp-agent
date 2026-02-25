"""WebSocket endpoint handler — dynamic tool registration via frontend manifest"""

from fastapi import WebSocket, WebSocketDisconnect
from bridge import bridge
from agent import create_agent
from tool_factory import create_tools_from_manifest


async def websocket_agent(websocket: WebSocket):
    await websocket.accept()
    bridge.set_websocket(websocket)

    agent = None

    # Frontend'e bağlantı onayı gönder — frontend tool_manifest ile cevap verecek
    await websocket.send_json({"type": "connected"})

    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type") == "tool_manifest":
                manifest = data.get("tools", [])
                tools = create_tools_from_manifest(manifest)
                agent = create_agent(tools)
                await websocket.send_json({
                    "type": "tools_registered",
                    "count": len(tools),
                })

            elif data.get("type") == "tool_result":
                bridge.resolve(data["callId"], data["result"])

            elif data.get("type") == "user_message":
                if agent is None:
                    await websocket.send_json({
                        "type": "agent_error",
                        "message": "Agent henüz hazır değil. Tool manifest bekleniyor.",
                    })
                    continue

                await websocket.send_json({"type": "agent_thinking"})
                try:
                    response = await agent.arun(data["message"])
                    await websocket.send_json({
                        "type": "agent_response",
                        "message": response.content,
                    })
                except Exception as e:
                    await websocket.send_json({
                        "type": "agent_error",
                        "message": f"Agent hatası: {str(e)}",
                    })

            elif data.get("type") == "user_action":
                if agent is None:
                    continue

                changes = data.get("changes", [])
                if changes:
                    context_msg = "[Kullanıcı Aksiyonu] " + " | ".join(changes)
                    try:
                        response = await agent.arun(context_msg)
                        if response.content:
                            await websocket.send_json({
                                "type": "agent_response",
                                "message": response.content,
                            })
                    except Exception:
                        pass

    except WebSocketDisconnect:
        bridge.set_websocket(None)
        print("Frontend bağlantısı kesildi")
