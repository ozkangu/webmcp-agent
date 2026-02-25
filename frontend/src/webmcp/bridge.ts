import type { AppStore } from '../store/useAppStore';
import type { Flight, ViewType } from '../types';
import { AIRPORTS, CABIN_CLASSES, MOCK_FLIGHTS } from '../data/constants';
import { flightService } from '../services/flightService';

// ---------------------------------------------------------------------------
// Standart tool cevap tipi
// ---------------------------------------------------------------------------
interface ToolResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  hint?: string;
  nextSteps?: { action: string; description: string }[];
}

type ToolHandler = (params: Record<string, unknown>) => Promise<ToolResponse>;

// ---------------------------------------------------------------------------
// Yardimci: Ucus ozeti (agent'a gonderilecek kompakt format)
// ---------------------------------------------------------------------------
function flightSummary(f: Flight, store: AppStore) {
  return {
    offerId: f.offerId,
    flightNo: f.flightNo,
    airline: f.airline,
    origin: f.origin,
    destination: f.destination,
    departureTime: f.departureTime,
    arrivalTime: f.arrivalTime,
    duration: f.duration,
    price: f.price,
    cabinClass: f.cabinClass,
    seatsAvailable: f.seatsAvailable,
    isSelected: store.selectedFlight?.offerId === f.offerId,
    isInCart: store.cart.some((c) => c.offerId === f.offerId),
  };
}

// ---------------------------------------------------------------------------
// Yardimci: Sepet ozeti
// ---------------------------------------------------------------------------
function cartSummary(store: AppStore) {
  return {
    count: store.cart.length,
    total: store.cart.reduce((s, f) => s + f.price, 0),
    items: store.cart.map((f) => ({
      offerId: f.offerId,
      flightNo: f.flightNo,
      origin: f.origin,
      destination: f.destination,
      price: f.price,
    })),
  };
}

// ---------------------------------------------------------------------------
// Yardimci: Passenger form validasyonu
// ---------------------------------------------------------------------------
const PASSENGER_REQUIRED: (keyof AppStore['passengerForm'])[] = [
  'firstName', 'lastName', 'email', 'tcNo',
];

function validatePassengerField(field: string, value: string): string | null {
  if (field === 'tcNo' && value.length !== 11) return 'TC Kimlik No 11 haneli olmali';
  if (field === 'tcNo' && !/^\d+$/.test(value)) return 'TC Kimlik No sadece rakam icermeli';
  if (field === 'email' && !value.includes('@')) return 'Gecerli bir e-posta adresi girin';
  if (field === 'phone' && value.replace(/\D/g, '').length < 10) return 'Telefon en az 10 haneli olmali';
  return null;
}

function passengerFormValidation(pf: AppStore['passengerForm']) {
  const missing = PASSENGER_REQUIRED.filter((f) => !pf[f]);
  const errors: Record<string, string> = {};
  for (const [k, v] of Object.entries(pf)) {
    if (!v) continue;
    const err = validatePassengerField(k, v);
    if (err) errors[k] = err;
  }
  return {
    canSubmit: missing.length === 0 && Object.keys(errors).length === 0,
    missingRequired: missing.length > 0 ? missing : undefined,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}

// ---------------------------------------------------------------------------
// Yardimci: Search form validasyonu
// ---------------------------------------------------------------------------
const VALID_AIRPORT_CODES = AIRPORTS.map((a) => a.code);
const VALID_CABIN_VALUES = CABIN_CLASSES.map((c) => c.value);

function searchFormValidation(form: AppStore['form']) {
  const missing: string[] = [];
  if (!form.origin) missing.push('origin');
  if (!form.destination) missing.push('destination');
  return {
    canSubmit: missing.length === 0,
    missingRequired: missing.length > 0 ? missing : undefined,
  };
}

// ---------------------------------------------------------------------------
// Yardimci: View bazli available actions
// ---------------------------------------------------------------------------
function getActionsForView(store: AppStore) {
  const view = store.currentView;
  const form = store.form;
  const cart = store.cart;
  const pf = store.passengerForm;
  const hasResults = !!store.searchResults && store.searchResults.flights.length > 0;

  const actions: { name: string; description: string; enabled: boolean; reason?: string }[] = [];

  // Her view'de gecerli genel aksiyonlar
  actions.push(
    { name: 'getCurrentState', description: 'Uygulamanin mevcut durumunu getir', enabled: true },
    { name: 'getAvailableAirports', description: 'Havalimanlarini listele', enabled: true },
    { name: 'getAvailableActions', description: 'Mevcut aksiyonlari listele', enabled: true },
  );

  if (view === 'search') {
    const canSearch = !!form.origin && !!form.destination;
    actions.push(
      { name: 'fillSearchForm', description: 'Arama formunu doldur', enabled: true },
      { name: 'clearSearchForm', description: 'Formu temizle', enabled: true },
      { name: 'clickButton:search-btn', description: 'Ucus ara', enabled: canSearch,
        reason: canSearch ? undefined : 'Kalkis (origin) ve varis (destination) secilmeli' },
      { name: 'searchFlights', description: 'Dogrudan ucus ara (form doldurmadan)', enabled: true },
    );
    if (hasResults) {
      actions.push(
        { name: 'navigateTo:results', description: 'Onceki arama sonuclarina don', enabled: true },
      );
    }
  }

  if (view === 'results') {
    actions.push(
      { name: 'selectFlight', description: 'Bir ucusu sec/highlight et', enabled: hasResults,
        reason: hasResults ? undefined : 'Arama sonucu yok' },
      { name: 'addToCart', description: 'Ucusu sepete ekle', enabled: hasResults,
        reason: hasResults ? undefined : 'Arama sonucu yok' },
      { name: 'removeFromCart', description: 'Sepetten cikar', enabled: cart.length > 0,
        reason: cart.length === 0 ? 'Sepet bos' : undefined },
      { name: 'clickButton:back-to-search', description: 'Yeni arama yap', enabled: true },
      { name: 'clickButton:proceed-to-passenger', description: 'Yolcu bilgilerine gec',
        enabled: cart.length > 0, reason: cart.length === 0 ? 'Once sepete ucus ekleyin' : undefined },
      { name: 'searchFlights', description: 'Farkli kriterlerle yeni arama', enabled: true },
    );
  }

  if (view === 'passenger') {
    const pVal = passengerFormValidation(pf);
    actions.push(
      { name: 'fillPassengerForm', description: 'Yolcu bilgilerini doldur', enabled: true },
      { name: 'clickButton:proceed-to-checkout', description: 'Odemeye gec',
        enabled: pVal.canSubmit, reason: pVal.canSubmit ? undefined : 'Zorunlu alanlar eksik: ' + (pVal.missingRequired || []).join(', ') },
      { name: 'navigateTo:results', description: 'Ucuslere don', enabled: true },
    );
  }

  if (view === 'checkout') {
    actions.push(
      { name: 'navigateTo:passenger', description: 'Yolcu bilgilerine don', enabled: true },
      { name: 'navigateTo:search', description: 'Yeni arama yap', enabled: true },
      { name: 'getCart', description: 'Sepet icerigini gor', enabled: true },
    );
  }

  return actions;
}

// ===========================================================================
// ANA BRIDGE FACTORY
// ===========================================================================
export function createWebMCPBridge(store: AppStore) {
  const handlers: Record<string, ToolHandler> = {

    // ----- FORM KONTROL -----

    setFormField: async ({ field, value }) => {
      const f = field as string;
      // Validasyon
      if (f === 'origin' || f === 'destination') {
        const code = String(value).toUpperCase();
        if (code && !VALID_AIRPORT_CODES.includes(code)) {
          return {
            success: false,
            error: `Gecersiz havaalani kodu: ${value}`,
            hint: `Gecerli kodlar: ${VALID_AIRPORT_CODES.join(', ')}`,
          };
        }
      }
      if (f === 'cabinClass' && value && !VALID_CABIN_VALUES.includes(String(value))) {
        return {
          success: false,
          error: `Gecersiz kabin sinifi: ${value}`,
          hint: `Gecerli degerler: ${VALID_CABIN_VALUES.join(', ')}`,
        };
      }
      if (f === 'passengers') {
        const n = Number(value);
        if (n < 1 || n > 6) {
          return { success: false, error: 'Yolcu sayisi 1-6 arasi olmali' };
        }
      }

      store.setFormField(f as keyof AppStore['form'], value as string | number);
      return {
        success: true,
        data: { field: f, value, currentForm: store.form },
      };
    },

    fillSearchForm: async ({ origin, destination, date, cabinClass, passengers, tripType }) => {
      const errors: Record<string, string> = {};
      const filled: string[] = [];

      const trySet = (field: keyof AppStore['form'], val: unknown, validate?: () => string | null) => {
        if (!val) return;
        if (validate) {
          const err = validate();
          if (err) { errors[field] = err; return; }
        }
        store.setFormField(field, val as string | number);
        filled.push(field);
      };

      trySet('origin', origin, () => {
        const c = String(origin).toUpperCase();
        return VALID_AIRPORT_CODES.includes(c) ? null : `Gecersiz havaalani: ${origin}. Gecerli: ${VALID_AIRPORT_CODES.join(', ')}`;
      });
      trySet('destination', destination, () => {
        const c = String(destination).toUpperCase();
        return VALID_AIRPORT_CODES.includes(c) ? null : `Gecersiz havaalani: ${destination}. Gecerli: ${VALID_AIRPORT_CODES.join(', ')}`;
      });
      trySet('date', date);
      trySet('cabinClass', cabinClass, () =>
        VALID_CABIN_VALUES.includes(String(cabinClass)) ? null : `Gecersiz kabin: ${cabinClass}. Gecerli: ${VALID_CABIN_VALUES.join(', ')}`
      );
      trySet('passengers', passengers, () => {
        const n = Number(passengers);
        return (n >= 1 && n <= 6) ? null : 'Yolcu sayisi 1-6 arasi olmali';
      });
      trySet('tripType', tripType, () =>
        ['one-way', 'round-trip'].includes(String(tripType)) ? null : 'tripType: one-way veya round-trip olmali'
      );

      const hasErrors = Object.keys(errors).length > 0;
      const formVal = searchFormValidation(store.form);

      return {
        success: !hasErrors,
        data: {
          filled,
          form: store.form,
          validation: formVal,
        },
        error: hasErrors ? 'Bazi alanlar gecersiz' : undefined,
        hint: hasErrors ? JSON.stringify(errors) : undefined,
        nextSteps: formVal.canSubmit
          ? [
              { action: 'clickButton:search-btn', description: 'Formu submit edip ucus ara' },
              { action: 'searchFlights', description: 'Dogrudan ucus ara' },
            ]
          : [
              { action: 'fillSearchForm', description: `Eksik alanlari doldur: ${(formVal.missingRequired || []).join(', ')}` },
            ],
      };
    },

    clearSearchForm: async () => {
      store.clearForm();
      return {
        success: true,
        data: { form: store.form },
        nextSteps: [
          { action: 'fillSearchForm', description: 'Yeni arama kriterleri gir' },
        ],
      };
    },

    submitSearchForm: async () => {
      const form = store.form;
      if (!form.origin || !form.destination) {
        return {
          success: false,
          error: 'Kalkis ve varis havalimani secilmeli',
          hint: `Bos alanlar: ${!form.origin ? 'origin' : ''} ${!form.destination ? 'destination' : ''}`.trim(),
          nextSteps: [
            { action: 'fillSearchForm', description: 'Eksik alanlari doldur' },
          ],
        };
      }
      const results = await flightService.search(form);
      store.setResults(results);
      return {
        success: true,
        data: {
          resultCount: results.resultCount,
          date: results.date,
          flights: results.flights.map((f) => flightSummary(f, store)),
        },
        nextSteps: results.flights.length > 0
          ? [
              { action: 'selectFlight', description: 'Bir ucusu sec' },
              { action: 'addToCart', description: 'Ucusu sepete ekle' },
            ]
          : [
              { action: 'fillSearchForm', description: 'Farkli kriterlerle tekrar ara' },
              { action: 'clearSearchForm', description: 'Formu temizleyip yeniden baslat' },
            ],
      };
    },

    // ----- YOLCU FORMU -----

    fillPassengerForm: async (params) => {
      const errors: Record<string, string> = {};
      const filled: string[] = [];

      Object.entries(params).forEach(([k, v]) => {
        if (!v) return;
        const val = String(v);
        const err = validatePassengerField(k, val);
        if (err) {
          errors[k] = err;
          return;
        }
        store.setPassengerField(k as keyof AppStore['passengerForm'], val);
        filled.push(k);
      });

      const pVal = passengerFormValidation(store.passengerForm);
      const hasErrors = Object.keys(errors).length > 0;

      return {
        success: !hasErrors,
        data: {
          filled,
          passengerForm: store.passengerForm,
          validation: pVal,
        },
        error: hasErrors ? 'Bazi alanlar gecersiz' : undefined,
        hint: hasErrors ? JSON.stringify(errors) : undefined,
        nextSteps: pVal.canSubmit
          ? [
              { action: 'clickButton:proceed-to-checkout', description: 'Odemeye gec' },
            ]
          : [
              { action: 'fillPassengerForm', description: `Eksik/hatali alanlari duzelt: ${[...(pVal.missingRequired || []), ...Object.keys(pVal.errors || {})].join(', ')}` },
            ],
      };
    },

    // ----- UCUS & SEPET -----

    searchFlights: async (params) => {
      const results = await flightService.search(params as {
        origin: string; destination: string; date: string; cabinClass: string; passengers: number;
      });
      store.setResults(results);

      const flights = results.flights.map((f) => flightSummary(f, store));
      const cheapest = results.flights.length > 0
        ? results.flights.reduce((min, f) => f.price < min.price ? f : min)
        : null;

      return {
        success: true,
        data: {
          resultCount: results.resultCount,
          date: results.date,
          flights,
          cheapest: cheapest ? { offerId: cheapest.offerId, flightNo: cheapest.flightNo, price: cheapest.price } : null,
        },
        nextSteps: results.flights.length > 0
          ? [
              { action: 'selectFlight', description: cheapest ? `En ucuz ucusu sec: ${cheapest.flightNo} (₺${cheapest.price.toLocaleString('tr-TR')})` : 'Bir ucusu sec' },
              { action: 'addToCart', description: 'Dogrudan sepete ekle' },
            ]
          : [
              { action: 'fillSearchForm', description: 'Farkli kriterlerle tekrar ara' },
            ],
      };
    },

    selectFlight: async ({ offerId }) => {
      const id = offerId as string;
      const f = MOCK_FLIGHTS.find((fl) => fl.offerId === id);
      if (!f) {
        const validIds = store.searchResults?.flights.map((fl) => fl.offerId) || MOCK_FLIGHTS.map((fl) => fl.offerId);
        return {
          success: false,
          error: `${id} ID'li ucus bulunamadi`,
          hint: `Gecerli offerId'ler: ${validIds.join(', ')}`,
        };
      }
      store.selectFlight(id);
      const inCart = store.cart.some((c) => c.offerId === id);
      return {
        success: true,
        data: { flight: flightSummary(f, store) },
        nextSteps: inCart
          ? [
              { action: 'navigateTo:passenger', description: 'Yolcu bilgilerine gec' },
              { action: 'removeFromCart', description: 'Sepetten cikar' },
            ]
          : [
              { action: 'addToCart', description: `${f.flightNo} ucusunu sepete ekle` },
            ],
      };
    },

    addToCart: async ({ offerId }) => {
      const id = offerId as string;
      const flight = MOCK_FLIGHTS.find((f) => f.offerId === id);
      if (!flight) {
        const validIds = store.searchResults?.flights.map((f) => f.offerId) || MOCK_FLIGHTS.map((f) => f.offerId);
        return {
          success: false,
          error: `${id} ID'li ucus bulunamadi`,
          hint: `Gecerli offerId'ler: ${validIds.join(', ')}`,
        };
      }
      if (store.cart.some((c) => c.offerId === id)) {
        return {
          success: false,
          error: 'Bu ucus zaten sepette',
          hint: 'Baska bir ucus ekleyin veya yolcu bilgilerine gecin',
          nextSteps: [
            { action: 'navigateTo:passenger', description: 'Yolcu bilgilerine gec' },
            { action: 'addToCart', description: 'Baska bir ucus ekle' },
          ],
        };
      }
      store.addToCart(id);
      return {
        success: true,
        data: {
          addedFlight: { offerId: flight.offerId, flightNo: flight.flightNo, price: flight.price },
          cart: cartSummary(store),
        },
        nextSteps: [
          { action: 'navigateTo:passenger', description: 'Yolcu bilgilerini gir' },
          { action: 'addToCart', description: 'Baska bir ucus daha ekle' },
        ],
      };
    },

    removeFromCart: async ({ offerId }) => {
      const id = offerId as string;
      if (!store.cart.some((c) => c.offerId === id)) {
        return {
          success: false,
          error: `${id} sepette degil`,
          hint: store.cart.length > 0
            ? `Sepetteki ucuslar: ${store.cart.map((c) => c.offerId).join(', ')}`
            : 'Sepet zaten bos',
        };
      }
      store.removeFromCart(id);
      return {
        success: true,
        data: { cart: cartSummary(store) },
        nextSteps: store.cart.length > 0
          ? [{ action: 'navigateTo:passenger', description: 'Yolcu bilgilerine gec' }]
          : [{ action: 'searchFlights', description: 'Yeni ucus ara' }],
      };
    },

    getCart: async () => {
      const cart = cartSummary(store);
      return {
        success: true,
        data: cart as unknown as Record<string, unknown>,
        nextSteps: cart.count > 0
          ? [
              { action: 'navigateTo:passenger', description: 'Yolcu bilgilerine gec' },
              { action: 'removeFromCart', description: 'Sepetten ucus cikar' },
            ]
          : [
              { action: 'searchFlights', description: 'Ucus ara' },
            ],
      };
    },

    // ----- NAVIGASYON & STATE -----

    navigateTo: async ({ view }) => {
      const v = view as ViewType;
      const valid: ViewType[] = ['search', 'results', 'passenger', 'checkout'];
      if (!valid.includes(v)) {
        return {
          success: false,
          error: `Gecersiz view: ${view}`,
          hint: `Gecerli view'ler: ${valid.join(', ')}`,
        };
      }
      store.setView(v);
      return {
        success: true,
        data: { currentView: v, availableActions: getActionsForView(store) },
      };
    },

    clickButton: async ({ buttonId }) => {
      const map: Record<string, () => Promise<ToolResponse>> = {
        'search-btn': () => handlers.submitSearchForm({}),
        'clear-btn': () => handlers.clearSearchForm({}),
        'back-to-search': () => handlers.navigateTo({ view: 'search' }),
        'proceed-to-passenger': () => handlers.navigateTo({ view: 'passenger' }),
        'proceed-to-checkout': () => handlers.navigateTo({ view: 'checkout' }),
      };
      const handler = map[buttonId as string];
      if (!handler) {
        return {
          success: false,
          error: `Bilinmeyen buton: ${buttonId}`,
          hint: `Gecerli butonlar: ${Object.keys(map).join(', ')}`,
        };
      }
      return handler();
    },

    getCurrentState: async () => {
      const view = store.currentView;
      const form = store.form;
      const pf = store.passengerForm;

      // Arama sonuclari — tam ucus listesi
      let searchData: Record<string, unknown> | null = null;
      if (store.searchResults) {
        const sr = store.searchResults;
        const flights = sr.flights.map((f) => flightSummary(f, store));
        const cheapest = sr.flights.length > 0
          ? sr.flights.reduce((min, f) => f.price < min.price ? f : min)
          : null;
        searchData = {
          resultCount: sr.resultCount,
          date: sr.date,
          flights,
          cheapest: cheapest ? { offerId: cheapest.offerId, flightNo: cheapest.flightNo, price: cheapest.price } : null,
        };
      }

      return {
        success: true,
        data: {
          currentView: view,
          form,
          searchFormValidation: searchFormValidation(form),
          passengerForm: pf,
          passengerFormValidation: passengerFormValidation(pf),
          searchResults: searchData,
          selectedFlight: store.selectedFlight ? flightSummary(store.selectedFlight, store) : null,
          cart: cartSummary(store),
          availableActions: getActionsForView(store),
        },
      };
    },

    getAvailableActions: async () => {
      return {
        success: true,
        data: {
          currentView: store.currentView,
          actions: getActionsForView(store),
        },
      };
    },

    getAvailableAirports: async () => ({
      success: true,
      data: {
        airports: AIRPORTS,
        codes: VALID_AIRPORT_CODES,
      },
    }),
  };

  return {
    handleToolCall: async (name: string, params: Record<string, unknown>): Promise<ToolResponse> => {
      const handler = handlers[name];
      if (!handler) {
        return {
          success: false,
          error: `Bilinmeyen tool: ${name}`,
          hint: `Gecerli tool'lar: ${Object.keys(handlers).join(', ')}`,
        };
      }
      try {
        return await handler(params);
      } catch (e) {
        return { success: false, error: (e as Error).message };
      }
    },
  };
}

export type WebMCPBridge = ReturnType<typeof createWebMCPBridge>;
