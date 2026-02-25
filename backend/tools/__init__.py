from .form_tools import fill_search_form, clear_search_form, click_button
from .flight_tools import search_flights, select_flight, add_to_cart, remove_from_cart, get_cart
from .passenger_tools import fill_passenger_form
from .navigation_tools import navigate_to, get_current_state, get_available_airports, get_available_actions

ALL_TOOLS = [
    # Form kontrol
    fill_search_form,
    clear_search_form,
    click_button,
    # Yolcu formu
    fill_passenger_form,
    # Uçuş & Sepet
    search_flights,
    select_flight,
    add_to_cart,
    remove_from_cart,
    get_cart,
    # Navigasyon & State
    navigate_to,
    get_current_state,
    get_available_airports,
    get_available_actions,
]
