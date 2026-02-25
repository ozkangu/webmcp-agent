"""WebSocket endpoint handler"""

from fastapi import WebSocket, WebSocketDisconnect
from bridge import bridge
from agent import agent

# Tool tanımları - frontend'e bağlantıda gönderilir
TOOL_DEFINITIONS = [
    {"name": "fillSearchForm", "description": "Arama formunu doldur", "params": ["origin", "destination", "date", "cabinClass", "passengers", "tripType"]},
    {"name": "clearSearchForm", "description": "Formu temizle"},
    {"name": "clickButton", "description": "Butona tıkla", "params": ["buttonId"]},
    {"name": "fillPassengerForm", "description": "Yolcu formunu doldur", "params": ["firstName", "lastName", "email", "phone", "tcNo", "birthDate", "gender"]},
    {"name": "searchFlights", "description": "Uçuş ara", "params": ["origin", "destination", "date", "cabinClass"]},
    {"name": "selectFlight", "description": "Uçuş seç", "params": ["offerId"]},
    {"name": "addToCart", "description": "Sepete ekle", "params": ["offerId"]},
    {"name": "removeFromCart", "description": "Sepetten çıkar", "params": ["offerId"]},
    {"name": "getCart", "description": "Sepet bilgisi"},
    {"name": "navigateTo", "description": "Sayfaya git", "params": ["view"]},
    {"name": "getCurrentState", "description": "Mevcut durum (tam uçuş listesi, sepet, validasyon, available actions)"},
    {"name": "getAvailableAirports", "description": "Havalimanı listesi"},
    {"name": "getAvailableActions", "description": "Mevcut sayfada yapılabilecek aksiyonlar (enabled/disabled + sebep)"},
]


async def websocket_agent(websocket: WebSocket):
    await websocket.accept()
    bridge.set_websocket(websocket)

    await websocket.send_json({"type": "connected", "tools": TOOL_DEFINITIONS})

    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type") == "tool_result":
                bridge.resolve(data["callId"], data["result"])

            elif data.get("type") == "user_message":
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
                # Kullanıcının arayüzde yaptığı değişiklikleri agent context'ine aktar
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
                        # User action bildirimi sessizce basarisiz olabilir
                        pass

    except WebSocketDisconnect:
        bridge.set_websocket(None)
        print("Frontend bağlantısı kesildi")
