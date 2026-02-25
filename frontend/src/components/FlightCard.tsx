import type { Flight } from '../types';

interface FlightCardProps {
  flight: Flight;
  isSelected: boolean;
  isInCart: boolean;
  onSelect: (offerId: string) => void;
  onAddToCart: (offerId: string) => void;
}

export function FlightCard({ flight, isSelected, isInCart, onSelect, onAddToCart }: FlightCardProps) {
  const bgClass = isSelected
    ? 'bg-[#0f1a2e] border-blue-500'
    : isInCart
      ? 'bg-[#0f2a1f] border-green-500/25'
      : 'bg-dark-input border-dark-border hover:border-zinc-700';

  return (
    <div
      onClick={() => onSelect(flight.offerId)}
      className={`border-[1.5px] ${bgClass} rounded-xl p-4 mb-2.5 flex justify-between items-center cursor-pointer transition-all duration-200`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-zinc-200 font-semibold text-[15px] font-mono">
            {flight.flightNo}
          </span>
          <span className="text-zinc-500 text-xs bg-dark-border px-2 py-0.5 rounded">
            {flight.airline}
          </span>
          {flight.cabinClass === 'business' && (
            <span className="text-amber-400 text-[11px] bg-amber-400/10 px-2 py-0.5 rounded font-semibold">
              BUSINESS
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-zinc-50 text-xl font-bold font-mono">
            {flight.departureTime}
          </span>
          <div className="flex flex-col items-center">
            <span className="text-zinc-600 text-[11px]">{flight.duration}</span>
            <div className="w-20 h-px bg-gradient-to-r from-blue-500 to-violet-500 my-1" />
            <span className="text-zinc-600 text-[11px]">
              {flight.origin} → {flight.destination}
            </span>
          </div>
          <span className="text-zinc-50 text-xl font-bold font-mono">
            {flight.arrivalTime}
          </span>
        </div>
      </div>
      <div className="text-right flex flex-col items-end gap-2">
        <span className="text-zinc-50 text-[22px] font-bold">
          ₺{flight.price.toLocaleString('tr-TR')}
        </span>
        <span className="text-zinc-600 text-[11px]">
          {flight.seatsAvailable} koltuk · {flight.aircraft}
        </span>
        {isInCart ? (
          <span className="text-green-500 text-xs font-semibold">✓ Sepette</span>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(flight.offerId);
            }}
            className="bg-gradient-to-br from-blue-500 to-violet-500 text-white border-none rounded-lg px-4 py-2 cursor-pointer text-[13px] font-semibold font-sans hover:from-blue-600 hover:to-violet-600 transition-all"
          >
            Sepete Ekle
          </button>
        )}
      </div>
    </div>
  );
}
