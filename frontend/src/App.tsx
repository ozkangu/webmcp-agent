import { useEffect, useRef } from 'react';
import { useAppStore } from './store/useAppStore';
import { useFieldHighlight } from './hooks/useFieldHighlight';
import { Header } from './components/Header';
import { SearchForm } from './components/SearchForm';
import { PassengerForm } from './components/PassengerForm';
import { FlightCard } from './components/FlightCard';
import { CartPanel } from './components/CartPanel';
import { ChatPanel } from './components/ChatPanel';
import type { FormState, PassengerFormState } from './types';

export default function App() {
  const currentView = useAppStore((s) => s.currentView);
  const form = useAppStore((s) => s.form);
  const passengerForm = useAppStore((s) => s.passengerForm);
  const searchResults = useAppStore((s) => s.searchResults);
  const selectedFlight = useAppStore((s) => s.selectedFlight);
  const cart = useAppStore((s) => s.cart);
  const setView = useAppStore((s) => s.setView);
  const selectFlight = useAppStore((s) => s.selectFlight);
  const addToCart = useAppStore((s) => s.addToCart);
  const removeFromCart = useAppStore((s) => s.removeFromCart);

  const { hl, highlight } = useFieldHighlight();
  const prevFormRef = useRef<FormState>(form);
  const prevPassRef = useRef<PassengerFormState>(passengerForm);

  // Detect field changes from agent and highlight them
  useEffect(() => {
    (Object.keys(form) as (keyof FormState)[]).forEach((k) => {
      if (form[k] !== prevFormRef.current[k]) highlight(k);
    });
    prevFormRef.current = form;
  }, [form, highlight]);

  useEffect(() => {
    (Object.keys(passengerForm) as (keyof PassengerFormState)[]).forEach((k) => {
      if (passengerForm[k] !== prevPassRef.current[k]) highlight(k);
    });
    prevPassRef.current = passengerForm;
  }, [passengerForm, highlight]);

  return (
    <div className="min-h-screen bg-dark-bg text-zinc-50 font-sans">
      <Header />

      <div className="grid grid-cols-[1fr_400px] h-[calc(100vh-53px)]">
        {/* Left panel */}
        <div className="p-6 overflow-y-auto">
          {currentView === 'search' && (
            <>
              <SearchForm hl={hl} />
              <div className="text-center py-8 text-zinc-800">
                <p className="text-[13px]">Chat'ten formu doldurup arama yapabilirsiniz</p>
              </div>
            </>
          )}

          {currentView === 'results' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="m-0 text-base font-bold text-zinc-200">✈️ Uçuş Sonuçları</h2>
                  {searchResults && (
                    <p className="text-zinc-600 text-[13px] mt-1 mb-0 font-mono">
                      {searchResults.resultCount} uçuş · {form.origin} → {form.destination}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setView('search')}
                  className="bg-dark-input border border-dark-border rounded-lg px-4 py-2 text-zinc-500 cursor-pointer text-xs font-sans hover:text-zinc-300 transition-colors"
                >
                  ← Yeni Arama
                </button>
              </div>
              {searchResults && searchResults.flights.length > 0 ? (
                searchResults.flights.map((f) => (
                  <FlightCard
                    key={f.offerId}
                    flight={f}
                    onSelect={selectFlight}
                    onAddToCart={addToCart}
                    isInCart={cart.some((c) => c.offerId === f.offerId)}
                    isSelected={selectedFlight?.offerId === f.offerId}
                  />
                ))
              ) : (
                <div className="text-center py-16 text-zinc-700">
                  <p>Sonuç bulunamadı</p>
                </div>
              )}
            </div>
          )}

          {currentView === 'passenger' && (
            <div>
              <PassengerForm hl={hl} />
              <div className="mt-4 flex gap-2.5">
                <button
                  onClick={() => setView('results')}
                  className="bg-dark-input border border-dark-border rounded-[10px] px-5 py-3 text-zinc-500 cursor-pointer text-[13px] font-sans hover:text-zinc-300 transition-colors"
                >
                  ← Uçuşler
                </button>
                <button
                  id="proceed-to-checkout"
                  className="flex-1 bg-gradient-to-br from-green-500 to-green-600 text-white border-none rounded-[10px] px-6 py-3 cursor-pointer text-sm font-bold font-sans hover:from-green-600 hover:to-green-700 transition-all"
                >
                  Ödemeye Geç →
                </button>
              </div>
            </div>
          )}

          {cart.length > 0 && (
            <div className="mt-6">
              <CartPanel cart={cart} onRemove={removeFromCart} />
              {currentView === 'results' && (
                <button
                  onClick={() => setView('passenger')}
                  className="w-full mt-3 bg-gradient-to-br from-indigo-500 to-violet-500 text-white border-none rounded-[10px] py-3 cursor-pointer text-sm font-bold font-sans hover:from-indigo-600 hover:to-violet-600 transition-all"
                >
                  Yolcu Bilgilerini Gir →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right panel: Chat */}
        <ChatPanel />
      </div>
    </div>
  );
}
