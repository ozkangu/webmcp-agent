import { create } from 'zustand';
import type { Flight, FormState, PassengerFormState, SearchResult, ViewType } from '../types';
import { MOCK_FLIGHTS } from '../data/constants';

const initialForm: FormState = {
  origin: '',
  destination: '',
  date: '',
  cabinClass: 'economy',
  passengers: 1,
  tripType: 'one-way',
};

const initialPassengerForm: PassengerFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  tcNo: '',
  birthDate: '',
  gender: '',
};

export interface AppStore {
  form: FormState;
  passengerForm: PassengerFormState;
  cart: Flight[];
  searchResults: SearchResult | null;
  selectedFlight: Flight | null;
  currentView: ViewType;
  isConnected: boolean;
  _agentActing: boolean;

  setFormField: (field: keyof FormState, value: string | number) => void;
  setPassengerField: (field: keyof PassengerFormState, value: string) => void;
  setResults: (results: SearchResult) => void;
  selectFlight: (offerId: string) => void;
  addToCart: (offerId: string) => void;
  removeFromCart: (offerId: string) => void;
  setView: (view: ViewType) => void;
  clearForm: () => void;
  setConnected: (connected: boolean) => void;
  setAgentActing: (acting: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  form: { ...initialForm },
  passengerForm: { ...initialPassengerForm },
  cart: [],
  searchResults: null,
  selectedFlight: null,
  currentView: 'search',
  isConnected: false,
  _agentActing: false,

  setFormField: (field, value) =>
    set((state) => ({ form: { ...state.form, [field]: value } })),

  setPassengerField: (field, value) =>
    set((state) => ({ passengerForm: { ...state.passengerForm, [field]: value } })),

  setResults: (results) =>
    set({ searchResults: results, currentView: 'results' }),

  selectFlight: (offerId) =>
    set({ selectedFlight: MOCK_FLIGHTS.find((f) => f.offerId === offerId) || null }),

  addToCart: (offerId) =>
    set((state) => {
      const flight = MOCK_FLIGHTS.find((f) => f.offerId === offerId);
      if (flight && !state.cart.find((c) => c.offerId === offerId)) {
        return { cart: [...state.cart, flight] };
      }
      return state;
    }),

  removeFromCart: (offerId) =>
    set((state) => ({ cart: state.cart.filter((c) => c.offerId !== offerId) })),

  setView: (view) => set({ currentView: view }),

  clearForm: () => set({ form: { ...initialForm } }),

  setConnected: (connected) => set({ isConnected: connected }),

  setAgentActing: (acting) => set({ _agentActing: acting }),
}));
