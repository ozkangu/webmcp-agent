"""Yolcu formu tool'ları: fill_passenger_form"""

import json
from agno.tools import tool
from bridge import bridge


@tool(name="fill_passenger_form", description="""Yolcu bilgi formunu doldur. Parametreler:
- first_name: Ad
- last_name: Soyad
- email: E-posta adresi
- phone: Telefon numarası
- tc_no: TC Kimlik Numarası (11 haneli)
- birth_date: Doğum tarihi (YYYY-MM-DD)
- gender: male veya female
Tüm parametreler opsiyoneldir.""")
async def fill_passenger_form(
    first_name: str = "",
    last_name: str = "",
    email: str = "",
    phone: str = "",
    tc_no: str = "",
    birth_date: str = "",
    gender: str = "",
) -> str:
    params = {}
    if first_name: params["firstName"] = first_name
    if last_name: params["lastName"] = last_name
    if email: params["email"] = email
    if phone: params["phone"] = phone
    if tc_no: params["tcNo"] = tc_no
    if birth_date: params["birthDate"] = birth_date
    if gender: params["gender"] = gender
    result = await bridge.call_frontend("fillPassengerForm", params)
    return json.dumps(result, ensure_ascii=False)
