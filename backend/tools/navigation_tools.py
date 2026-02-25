"""Navigasyon & State tool'ları: navigate_to, get_current_state, get_available_airports, get_available_actions"""

import json
from agno.tools import tool
from bridge import bridge


@tool(name="navigate_to", description="Sayfalar arası geçiş. view parametresi: search, results, passenger, checkout")
async def navigate_to(view: str) -> str:
    result = await bridge.call_frontend("navigateTo", {"view": view})
    return json.dumps(result, ensure_ascii=False)


@tool(name="get_current_state", description="""Uygulamanın mevcut durumunu getir. Dönen veri:
- currentView: Aktif sayfa
- form: Arama formu değerleri + validasyon durumu
- passengerForm: Yolcu formu değerleri + validasyon durumu
- searchResults: Tüm uçuş listesi (fiyat, saat, koltuk, isSelected, isInCart) + en ucuz uçuş
- selectedFlight: Seçili uçuş detayı
- cart: Sepet içeriği (items, count, total)
- availableActions: Bu sayfada yapılabilecek aksiyonlar (enabled/disabled + sebep)""")
async def get_current_state() -> str:
    result = await bridge.call_frontend("getCurrentState", {})
    return json.dumps(result, ensure_ascii=False)


@tool(name="get_available_airports", description="Mevcut havalimanı listesini getir (kod ve isim).")
async def get_available_airports() -> str:
    result = await bridge.call_frontend("getAvailableAirports", {})
    return json.dumps(result, ensure_ascii=False)


@tool(name="get_available_actions", description="""Mevcut sayfada yapılabilecek aksiyonları getir.
Her aksiyon için: name, description, enabled (true/false), reason (neden disabled).
Hangi tool'u çağırabileceğini ve hangi butonlara basabileceğini öğrenmek için kullan.""")
async def get_available_actions() -> str:
    result = await bridge.call_frontend("getAvailableActions", {})
    return json.dumps(result, ensure_ascii=False)
