"""Form kontrol tool'ları: fill_search_form, clear_search_form, click_button"""

import json
from agno.tools import tool
from bridge import bridge


@tool(name="fill_search_form", description="""Uçuş arama formunu doldur. Parametreler:
- origin: Kalkış havalimanı kodu (IST, SAW, ESB, AYT, ADB, ADA, TZX, GZT, DIY, VAN)
- destination: Varış havalimanı kodu
- date: Tarih (YYYY-MM-DD formatında)
- cabinClass: economy, business veya first
- passengers: Yolcu sayısı (1-6)
- tripType: one-way veya round-trip
Tüm parametreler opsiyoneldir, sadece değiştirmek istediklerini gönder.""")
async def fill_search_form(
    origin: str = "",
    destination: str = "",
    date: str = "",
    cabin_class: str = "",
    passengers: int = 0,
    trip_type: str = "",
) -> str:
    params = {}
    if origin: params["origin"] = origin.upper()
    if destination: params["destination"] = destination.upper()
    if date: params["date"] = date
    if cabin_class: params["cabinClass"] = cabin_class
    if passengers > 0: params["passengers"] = passengers
    if trip_type: params["tripType"] = trip_type
    result = await bridge.call_frontend("fillSearchForm", params)
    return json.dumps(result, ensure_ascii=False)


@tool(name="clear_search_form", description="Uçuş arama formunu temizle, tüm alanları sıfırla.")
async def clear_search_form() -> str:
    result = await bridge.call_frontend("clearSearchForm", {})
    return json.dumps(result, ensure_ascii=False)


@tool(name="click_button", description="""Sayfadaki bir butona tıkla. Mevcut buton ID'leri:
- search-btn: Uçuş Ara butonu (formu submit eder)
- clear-btn: Form Temizle butonu
- back-to-search: Yeni Arama butonu (arama sayfasına döner)
- proceed-to-passenger: Yolcu Bilgilerini Gir butonu
- proceed-to-checkout: Ödemeye Geç butonu""")
async def click_button(button_id: str) -> str:
    result = await bridge.call_frontend("clickButton", {"buttonId": button_id})
    return json.dumps(result, ensure_ascii=False)
