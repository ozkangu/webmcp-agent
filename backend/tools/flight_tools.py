"""Uçuş & Sepet tool'ları: search_flights, select_flight, add_to_cart, remove_from_cart, get_cart"""

import json
from agno.tools import tool
from bridge import bridge


@tool(name="search_flights", description="Doğrudan uçuş ara (form doldurmadan). origin, destination, date ve cabinClass parametreleri alır.")
async def search_flights(
    origin: str,
    destination: str,
    date: str = "2026-03-01",
    cabin_class: str = "economy",
) -> str:
    result = await bridge.call_frontend("searchFlights", {
        "origin": origin.upper(),
        "destination": destination.upper(),
        "date": date,
        "cabinClass": cabin_class,
    })
    return json.dumps(result, ensure_ascii=False)


@tool(name="select_flight", description="Bir uçuşu seç/highlight et. offerId parametresi gerekli (örn: OF-001).")
async def select_flight(offer_id: str) -> str:
    result = await bridge.call_frontend("selectFlight", {"offerId": offer_id})
    return json.dumps(result, ensure_ascii=False)


@tool(name="add_to_cart", description="Uçuşu sepete ekle. offerId parametresi gerekli.")
async def add_to_cart(offer_id: str) -> str:
    result = await bridge.call_frontend("addToCart", {"offerId": offer_id})
    return json.dumps(result, ensure_ascii=False)


@tool(name="remove_from_cart", description="Uçuşu sepetten çıkar. offerId parametresi gerekli.")
async def remove_from_cart(offer_id: str) -> str:
    result = await bridge.call_frontend("removeFromCart", {"offerId": offer_id})
    return json.dumps(result, ensure_ascii=False)


@tool(name="get_cart", description="Sepetin mevcut içeriğini ve toplam tutarı getir.")
async def get_cart() -> str:
    result = await bridge.call_frontend("getCart", {})
    return json.dumps(result, ensure_ascii=False)
